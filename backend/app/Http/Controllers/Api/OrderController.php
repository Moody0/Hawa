<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\InventoryMovement;
use App\Models\Order;
use App\Models\Product;
use App\Models\PromoCode;
use App\Models\Settings;
use App\Support\AdminAccess;
use App\Support\ApiJson;
use App\Support\MerchantPhone;
use Illuminate\Database\QueryException;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\RateLimiter;
use Symfony\Component\HttpKernel\Exception\HttpException;

class OrderController extends Controller
{
    public function validatePromo(Request $request)
    {
        $data = $request->validate(['code' => ['required', 'string', 'max:191']]);
        $promo = PromoCode::where('code', mb_strtoupper(trim($data['code'])))->where('is_active', true)->first();

        return $promo ? response()->json(['success' => true, 'promoCode' => ['id' => $promo->id, 'code' => $promo->code, 'discountPercentage' => $promo->discount_percentage], 'id' => $promo->id, 'discountPercentage' => $promo->discount_percentage]) : response()->json(['success' => false, 'error' => 'Invalid promo code.'], 422);
    }

    private const MAX_LINES = 100;

    private const MAX_PACKAGES = 5000;

    private const MAX_TOTAL_CENTS = 9999999999;

    private const GOVERNORATES = ['دمشق', 'ريف دمشق', 'حمص', 'حماة', 'حلب', 'اللاذقية', 'طرطوس', 'درعا', 'السويداء', 'القنيطرة', 'دير الزور', 'الحسكة', 'الرقة', 'إدلب'];

    public function store(Request $request)
    {
        if (strlen($request->getContent()) > 100000) {
            return response()->json(['message' => 'Order request is too large'], 413);
        }
        $key = 'order:'.$request->ip();
        if (RateLimiter::tooManyAttempts($key, 10)) {
            return response()->json(['message' => 'Too many orders. Please try again shortly.'], 429)->header('Retry-After', RateLimiter::availableIn($key));
        }
        RateLimiter::hit($key, 600);
        $body = $request->validate([
            'items' => ['required', 'array', 'min:1', 'max:'.self::MAX_LINES], 'items.*.productId' => ['required', 'string', 'max:191'],
            'items.*.quantity' => ['required', 'integer', 'min:1', 'max:'.self::MAX_PACKAGES], 'items.*.options' => ['nullable', 'string', 'max:100'],
            'shopName' => ['nullable', 'string', 'max:100'], 'ownerName' => ['nullable', 'string', 'max:100'], 'phone' => ['nullable', 'string', 'max:32'],
            'city' => ['nullable', 'string', 'max:100'], 'streetAddress' => ['nullable', 'string', 'max:250'], 'notes' => ['nullable', 'string', 'max:500'],
            'promoCodeId' => ['nullable', 'string', 'max:191'], 'idempotencyKey' => ['nullable', 'string', 'max:128'],
        ]);
        $merchant = Auth::guard('merchant')->user();
        $phone = MerchantPhone::normalize($body['phone'] ?? $merchant?->phone ?? '') ?? '';
        $city = $this->normalizeGovernorate($body['city'] ?? $merchant?->city ?? '');
        $clean = [
            'shopName' => $this->clean($body['shopName'] ?? $merchant?->shop_name ?? '', 100),
            'ownerName' => $this->clean($body['ownerName'] ?? $merchant?->owner_name ?? '', 100),
            'phone' => $phone, 'city' => $city, 'streetAddress' => $this->clean($body['streetAddress'] ?? $merchant?->address ?? '', 250),
            'notes' => $this->clean($body['notes'] ?? '', 500),
        ];
        $errors = [];
        if (mb_strlen($clean['shopName']) < 2) {
            $errors['shopName'] = 'Enter your store name';
        }
        if (mb_strlen($clean['ownerName']) < 2) {
            $errors['ownerName'] = 'Enter the contact person name';
        }
        if (! $phone) {
            $errors['phone'] = 'Enter a valid mobile number';
        }
        if (! $city) {
            $errors['city'] = 'Select a governorate';
        }
        if (mb_strlen($clean['streetAddress']) < 4) {
            $errors['streetAddress'] = 'Enter a detailed delivery address';
        }
        if ($errors) {
            return response()->json(['message' => reset($errors), 'errors' => $errors], 400);
        }

        $lines = $this->mergeLines($body['items']);
        usort($lines, fn ($a, $b) => strcmp($a['productId'].'|'.($a['options'] ?? ''), $b['productId'].'|'.($b['options'] ?? '')));
        $key = $request->header('X-Idempotency-Key') ?: $request->header('Idempotency-Key') ?: ($body['idempotencyKey'] ?? '');
        if (! is_string($key) || ! preg_match('/^[A-Za-z0-9._:-]{16,128}$/', trim($key))) {
            return response()->json(['message' => 'A valid order request key is required.'], 400);
        }
        $key = trim($key);
        $promoId = $body['promoCodeId'] ?? null;
        $canonical = ['customer' => $merchant?->id, 'clean' => $clean, 'promoCodeId' => $promoId, 'items' => $lines];
        $requestHash = hash('sha256', json_encode($canonical, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES));
        if ($existing = Order::with('items.product')->where('idempotency_key', $key)->first()) {
            return $this->replay($existing, $requestHash);
        }

        try {
            $order = DB::transaction(function () use ($lines, $clean, $merchant, $key, $requestHash, $promoId): Order {
                $ids = collect($lines)->pluck('productId')->unique()->sort()->values();
                $products = HawaCatalogController::available()->with('brand')->whereIn('id', $ids)->orderBy('id')->lockForUpdate()->get()->keyBy('id');
                if ($products->count() !== $ids->count()) {
                    throw new HttpException(409, 'A product in your cart is no longer available.');
                }
                // Any unpriced line makes the entire submission a quotation inquiry.
                $isQuoteRequest = $products->contains(fn ($product) => $product->requires_quote);
                $qtyByProduct = [];
                foreach ($lines as $line) {
                    $product = $products->get($line['productId']);
                    if (! $product || ! $product->brand?->is_active) {
                        throw new HttpException(409, 'A product in your cart is no longer available.');
                    }
                    if (! $isQuoteRequest && $product->price === null) {
                        throw new HttpException(409, 'The package price for '.($product->name_ar ?: $product->name).' is being reviewed.');
                    }
                    if ($line['options'] && ! in_array($line['options'], array_map('trim', explode(',', (string) $product->options)), true)) {
                        throw new HttpException(409, 'The selected product option is no longer available.');
                    }
                    $qtyByProduct[$product->id] = ($qtyByProduct[$product->id] ?? 0) + $line['quantity'];
                }
                foreach ($qtyByProduct as $id => $quantity) {
                    $product = $products->get($id);
                    if ($quantity < $product->min_order) {
                        throw new HttpException(422, 'Minimum order for '.($product->name_ar ?: $product->name).' is '.$product->min_order.'.');
                    }
                    if ($quantity > self::MAX_PACKAGES) {
                        throw new HttpException(400, 'Too many packages requested for a product.');
                    }
                    if (! $isQuoteRequest && $product->stock !== null && $product->stock < $quantity) {
                        throw new HttpException(409, 'Not enough packages available for '.($product->name_ar ?: $product->name).'.');
                    }
                    if (! $isQuoteRequest && $product->stock !== null) {
                        $product->decrement('stock', $quantity);
                    }
                }
                $subtotal = 0;
                $items = [];
                foreach ($lines as $line) {
                    $product = $products->get($line['productId']);
                    $regularPriceCents = $isQuoteRequest ? 0 : $this->priceCents($product->price);
                    $discountPriceCents = ! $isQuoteRequest && $product->discount_price !== null
                        ? $this->priceCents($product->discount_price)
                        : 0;
                    $unitCents = $product->discount_price !== null && $discountPriceCents <= $regularPriceCents
                        ? $discountPriceCents
                        : $regularPriceCents;
                    $subtotal += $unitCents * $line['quantity'];
                    $items[] = ['product_id' => $product->id, 'quantity' => $line['quantity'], 'options' => $line['options'], 'price' => number_format($unitCents / 100, 2, '.', '')];
                }
                if ($subtotal > self::MAX_TOTAL_CENTS) {
                    throw new HttpException(422, 'Order amount exceeds the supported limit.');
                }
                $discount = 0;
                $promo = null;
                if ($promoId && ! $isQuoteRequest) {
                    $promo = PromoCode::whereKey($promoId)->lockForUpdate()->first();
                    if (! $promo || ! $promo->is_active || $promo->discount_percentage < 0 || $promo->discount_percentage > 100) {
                        throw new HttpException(409, 'Promo code is no longer valid.');
                    }
                    $discount = intdiv($subtotal * $promo->discount_percentage + 50, 100);
                }
                DB::table('sequences')->insertOrIgnore(['name' => 'orders', 'value' => 0]);
                $sequence = DB::table('sequences')->where('name', 'orders')->lockForUpdate()->first();
                $number = $sequence->value + 1;
                DB::table('sequences')->where('name', 'orders')->update(['value' => $number]);
                $order = Order::create([
                    'order_number' => $number,
                    'customer_id' => $merchant?->id, 'shop_name' => $clean['shopName'], 'notes' => $clean['notes'] ?: null,
                    'idempotency_key' => $key, 'request_hash' => $requestHash, 'total_amount' => number_format(($subtotal - $discount) / 100, 2, '.', ''),
                    'status' => 'PENDING', 'city' => $clean['city'], 'street_address' => $clean['streetAddress'], 'Name' => $clean['ownerName'],
                    'phone' => $clean['phone'], 'discount' => number_format($discount / 100, 2, '.', ''), 'stock_reserved' => ! $isQuoteRequest, 'is_quote_request' => $isQuoteRequest, 'promo_code_id' => $promo?->id,
                ]);
                $order->items()->createMany($items);
                foreach ($isQuoteRequest ? [] : $qtyByProduct as $pid => $quantity) {
                    InventoryMovement::create(['order_id' => $order->id, 'product_id' => $pid, 'quantity' => -$quantity, 'type' => 'RESERVATION', 'deduplication_key' => 'reservation:'.$order->id.':'.$pid, 'created_at' => now()]);
                }
                if ($promo) {
                    $newSalesCents = $this->priceCents($promo->total_sales) + $subtotal - $discount;
                    $promo->update(['usage_count' => $promo->usage_count + 1, 'total_sales' => number_format($newSalesCents / 100, 2, '.', '')]);
                }

                return $order->load('items.product');
            }, 3);
        } catch (QueryException $e) {
            $existing = Order::with('items.product')->where('idempotency_key', $key)->first();
            if ($existing) {
                return $this->replay($existing, $requestHash);
            }
            throw $e;
        } catch (HttpException $e) {
            $existing = Order::with('items.product')->where('idempotency_key', $key)->first();
            if ($existing) {
                return $this->replay($existing, $requestHash);
            }

            return response()->json(['message' => $e->getMessage()], $e->getStatusCode());
        }

        return $this->createdResponse($order, 201);
    }

    public function history(Request $request)
    {
        $merchant = Auth::guard('merchant')->user();
        $page = max(1, min((int) $request->query('page', 1), 10000));
        $orders = Order::where('customer_id', $merchant->id)->with('items.product.brand')->orderByDesc('created_at')->skip(($page - 1) * 20)->take(21)->get();
        $hasMore = $orders->count() > 20;

        return response()->json(['orders' => ApiJson::camel($orders->take(20)), 'hasMore' => $hasMore])->header('Cache-Control', 'private, no-store');
    }

    public function claim(Request $request)
    {
        $merchant = Auth::guard('merchant')->user();
        $data = $request->validate(['orderId' => ['required', 'string', 'max:191'], 'orderToken' => ['required', 'string', 'max:2048']]);
        abort_unless($this->verifyOrderToken($data['orderId'], $data['orderToken']), 403, 'Invalid order access token.');
        $order = Order::whereKey($data['orderId'])->firstOrFail();
        abort_if($order->customer_id && $order->customer_id !== $merchant->id, 409, 'Order is already linked to another account.');
        if (! $order->customer_id) {
            $count = Order::whereKey($order->id)->whereNull('customer_id')->update(['customer_id' => $merchant->id]);
            abort_unless($count === 1, 409, 'Order was already claimed.');
        }

        return response()->json(['success' => true, 'orderId' => $order->id]);
    }

    public function show(Request $request, string $id)
    {
        $merchant = Auth::guard('merchant')->user();
        $admin = Auth::guard('web')->user();
        if ($admin) {
            AdminAccess::check('ORDERS_VIEW');
        }
        $token = $request->query('token') ?: $request->header('X-Order-Token') ?: $request->cookie('hawa_order_'.$id);
        if (! $merchant && ! $admin && ! $this->verifyOrderToken($id, $token)) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }
        $order = Order::with('items.product')->find($id);
        if (! $order) {
            return response()->json(['message' => 'Order not found'], 404);
        }
        if (! $admin && ! $this->verifyOrderToken($id, $token) && $order->customer_id !== $merchant?->id) {
            return response()->json(['message' => 'Order not found'], 404);
        }

        return response()->json([...ApiJson::camel($order), 'whatsappNumber' => $this->whatsappNumber()])->header('Cache-Control', 'private, no-store');
    }

    public function updateStatus(Request $request, string $id)
    {
        AdminAccess::check('ORDERS_MANAGE');
        $data = $request->validate(['status' => ['required', 'in:PENDING,CONTACTED,PROCESSING,SHIPPED,DELIVERED,COMPLETED,CANCELLED'], 'cancellationReason' => ['nullable', 'string', 'max:2000']]);
        DB::transaction(function () use ($id, $data) {
            $order = Order::with('items')->whereKey($id)->lockForUpdate()->firstOrFail();
            $from = $order->status;
            $to = $data['status'];
            if ($from === $to) {
                return;
            }
            abort_if(in_array($from, ['CANCELLED', 'COMPLETED']) || ($from === 'DELIVERED' && $to !== 'COMPLETED') || ($from === 'SHIPPED' && ! in_array($to, ['DELIVERED', 'COMPLETED', 'CANCELLED'])), 409, 'Invalid order status transition.');
            if ($to === 'CANCELLED') {
                $this->releaseStock($order);
                $order->cancellation_reason = $data['cancellationReason'] ?? null;
            }
            $order->status = $to;
            $order->save();
            AdminAccess::audit('STATUS', 'Order', $id, ['from' => $from, 'to' => $to]);
        }, 3);

        return response()->json(['success' => true]);
    }

    private function releaseStock(Order $order): void
    {
        if (! $order->stock_reserved) {
            return;
        }
        foreach ($order->items->groupBy('product_id')->sortKeys() as $pid => $items) {
            $product = Product::withoutGlobalScopes()->whereKey($pid)->lockForUpdate()->first();
            if ($product) {
                $product->increment('stock', $items->sum('quantity'));
            }InventoryMovement::firstOrCreate(['deduplication_key' => 'release:'.$order->id.':'.$pid], ['order_id' => $order->id, 'product_id' => $pid, 'quantity' => $items->sum('quantity'), 'type' => 'RELEASE', 'created_at' => now()]);
        }
        $order->stock_reserved = false;
    }

    public function destroy(string $id)
    {
        AdminAccess::check('ORDERS_ARCHIVE');
        DB::transaction(function () use ($id) {
            $order = Order::with('items')->whereKey($id)->lockForUpdate()->firstOrFail();
            if (! in_array($order->status, ['DELIVERED', 'COMPLETED'])) {
                $this->releaseStock($order);
            }$order->archived_at = now();
            $order->save();
            AdminAccess::audit('ARCHIVE', 'Order', $id);
        }, 3);

        return response()->json(['success' => true]);
    }

    public function updatePricing(Request $request, string $id)
    {
        AdminAccess::check('ORDERS_MANAGE');
        $data = $request->validate(['itemPrices' => ['required', 'array', 'min:1', 'max:100'], 'itemPrices.*.itemId' => ['required', 'string', 'distinct'], 'itemPrices.*.price' => ['required', 'numeric', 'between:0.01,99999999.99']]);
        $total = DB::transaction(function () use ($id, $data) {
            $order = Order::with('items')->whereKey($id)->lockForUpdate()->firstOrFail();
            abort_unless(in_array($order->status, ['PENDING', 'CONTACTED']), 409, 'Order pricing cannot be changed.');
            abort_unless(count($data['itemPrices']) === $order->items->count(), 422, 'Enter a price for every order item.');
            foreach ($data['itemPrices'] as $line) {
                $item = $order->items->firstWhere('id', $line['itemId']);
                abort_unless($item, 422, 'Invalid order item.');
                $item->update(['price' => number_format((float) $line['price'], 2, '.', '')]);
            }$subtotal = $order->items()->get()->sum(fn ($i) => $this->priceCents($i->price) * $i->quantity);
            $discount = $order->promoCode ? intdiv($subtotal * $order->promoCode->discount_percentage + 50, 100) : 0;
            $total = number_format(($subtotal - $discount) / 100, 2, '.', '');
            $old = $this->priceCents($order->total_amount);
            if ($order->promo_code_id) {
                $promo = PromoCode::whereKey($order->promo_code_id)->lockForUpdate()->first();
                if ($promo) {
                    $promo->update(['total_sales' => number_format(max(0, $this->priceCents($promo->total_sales) + $this->priceCents($total) - $old) / 100, 2, '.', '')]);
                }
            }$order->update(['discount' => number_format($discount / 100, 2, '.', ''), 'total_amount' => $total]);
            AdminAccess::audit('PRICE', 'Order', $id);

            return $total;
        }, 3);

        return response()->json(['success' => true, 'totalAmount' => (float) $total, 'itemPrices' => $data['itemPrices']]);
    }

    private function mergeLines(array $input): array
    {
        $merged = [];
        $totals = [];
        foreach ($input as $raw) {
            if (! is_array($raw)) {
                throw new HttpException(400, 'Invalid order line.');
            }
            $id = trim((string) ($raw['productId'] ?? ''));
            $qty = filter_var($raw['quantity'] ?? null, FILTER_VALIDATE_INT);
            $option = $this->clean($raw['options'] ?? '', 100) ?: null;
            if ($id === '' || strlen($id) > 191 || ! $qty || $qty < 1 || $qty > self::MAX_PACKAGES) {
                throw new HttpException(400, 'Each product needs a valid positive package quantity.');
            }
            $totals[$id] = ($totals[$id] ?? 0) + $qty;
            if ($totals[$id] > self::MAX_PACKAGES) {
                throw new HttpException(400, 'Too many packages requested for a product.');
            }
            $key = $id.'|'.($option ?? '');
            if (isset($merged[$key])) {
                $merged[$key]['quantity'] += $qty;
            } else {
                $merged[$key] = ['productId' => $id, 'quantity' => $qty, 'options' => $option];
            }
        }

        return array_values($merged);
    }

    private function createdResponse(Order $order, int $status)
    {
        $token = $this->signOrderToken($order->id);

        return response()->json([...ApiJson::camel($order), 'orderToken' => $token, 'whatsappNumber' => $this->whatsappNumber()], $status)
            ->header('Cache-Control', 'private, no-store')
            ->cookie(cookie('hawa_order_'.$order->id, $token, 10080, '/', null, request()->isSecure(), true, false, 'lax'));
    }

    private function replay(Order $order, string $requestHash)
    {
        if (! hash_equals((string) $order->request_hash, $requestHash)) {
            return response()->json(['message' => 'This request key belongs to a different order.'], 409);
        }

        return $this->createdResponse($order, 200);
    }

    private function whatsappNumber(): string
    {
        $phone = Settings::query()->value('whatsapp_number');
        $phone = is_string($phone) ? preg_replace('/[^0-9+]/', '', $phone) : '';

        return $phone ?: '+963993443901';
    }

    private function signOrderToken(string $id): string
    {
        $payload = rtrim(strtr(base64_encode(json_encode(['id' => $id, 'exp' => now()->addDays(7)->timestamp, 'nonce' => bin2hex(random_bytes(16))])), '+/', '-_'), '=');

        return $payload.'.'.hash_hmac('sha256', $payload, (string) (env('ORDER_TOKEN_SECRET') ?: config('app.key')));
    }

    private function verifyOrderToken(string $id, ?string $token): bool
    {
        if (! $token || strlen($token) > 2048 || substr_count($token, '.') !== 1) {
            return false;
        }
        [$payload, $signature] = explode('.', $token, 2);
        if (! hash_equals(hash_hmac('sha256', $payload, (string) (env('ORDER_TOKEN_SECRET') ?: config('app.key'))), $signature)) {
            return false;
        }
        $data = json_decode(base64_decode(strtr($payload, '-_', '+/')), true);

        return is_array($data) && ($data['id'] ?? null) === $id && (int) ($data['exp'] ?? 0) > now()->timestamp;
    }

    private function priceCents(mixed $value): int
    {
        $value = (string) $value;
        if (! preg_match('/^(\d+)(?:\.(\d{1,2}))?$/', $value, $match)) {
            throw new HttpException(422, 'Invalid product price.');
        }

        return ((int) $match[1] * 100) + (int) str_pad($match[2] ?? '', 2, '0');
    }

    private function normalizeGovernorate(string $value): string
    {
        $aliases = ['Damascus' => 'دمشق', 'Rif Dimashq' => 'ريف دمشق', 'Homs' => 'حمص', 'Hama' => 'حماة', 'Aleppo' => 'حلب', 'Latakia' => 'اللاذقية', 'Tartus' => 'طرطوس', 'Daraa' => 'درعا', 'As-Suwayda' => 'السويداء', 'Quneitra' => 'القنيطرة', 'Deir ez-Zor' => 'دير الزور', 'Al-Hasakah' => 'الحسكة', 'Raqqa' => 'الرقة', 'Idlib' => 'إدلب'];
        foreach (self::GOVERNORATES as $governorate) {
            if (mb_strtolower(trim($value)) === mb_strtolower($governorate)) {
                return $governorate;
            }
        }
        foreach ($aliases as $en => $ar) {
            if (mb_strtolower(trim($value)) === mb_strtolower($en)) {
                return $ar;
            }
        }

        return '';
    }

    private function clean(?string $value, int $limit): string
    {
        return mb_substr(trim(preg_replace('/[\x00-\x1F\x7F-\x9F]/u', '', strip_tags($value ?? '')) ?? ''), 0, $limit);
    }
}
