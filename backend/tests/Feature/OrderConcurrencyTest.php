<?php

namespace Tests\Feature;

use App\Models\Brand;
use App\Models\Category;
use App\Models\InventoryMovement;
use App\Models\Order;
use App\Models\Product;
use Illuminate\Foundation\Testing\DatabaseTruncation;
use Tests\TestCase;

class OrderConcurrencyTest extends TestCase
{
    use DatabaseTruncation;

    protected bool $seed = true;

    private function product(int $stock): Product
    {
        $brand = Brand::create(['name' => 'Concurrency test', 'slug' => 'concurrency-test']);
        $category = Category::create(['name' => 'Concurrency test', 'slug' => 'concurrency-test']);

        return Product::create(['name' => 'Concurrent item', 'slug' => 'concurrent-item', 'price' => '0.10', 'stock' => $stock, 'images' => '/logo.png', 'brand_id' => $brand->id, 'category_id' => $category->id]);
    }

    private function submit(Product $product, bool $sameKey): array
    {
        $payload = ['shopName' => 'Test shop', 'ownerName' => 'Test owner', 'phone' => '0912345678', 'city' => 'حمص', 'streetAddress' => 'Test address 123', 'items' => [['productId' => $product->id, 'quantity' => 1]]];
        $jobs = [];
        for ($i = 0; $i < 6; $i++) {
            $input = base64_encode(json_encode(['key' => $sameKey ? 'concurrent-idempotent-request' : 'concurrent-order-request-'.$i, 'payload' => $payload]));
            $process = proc_open([PHP_BINARY, base_path('tests/order-worker.php'), $input], [0 => ['pipe', 'r'], 1 => ['pipe', 'w'], 2 => ['pipe', 'w']], $pipes, base_path());
            $this->assertIsResource($process);
            fclose($pipes[0]);
            $jobs[] = [$process, $pipes];
        }
        $results = [];
        foreach ($jobs as [$process,$pipes]) {
            $out = stream_get_contents($pipes[1]);
            $err = stream_get_contents($pipes[2]);
            fclose($pipes[1]);
            fclose($pipes[2]);
            $this->assertSame(0, proc_close($process), $err);
            $data = json_decode($out, true);
            $this->assertIsArray($data, $out.$err);
            $results[] = $data;
        }

        return $results;
    }

    public function test_simultaneous_orders_cannot_oversell_stock(): void
    {
        $product = $this->product(3);
        $results = $this->submit($product, false);
        $this->assertCount(3, array_filter($results, fn ($r) => $r['status'] === 201), json_encode($results));
        $this->assertCount(3, array_filter($results, fn ($r) => $r['status'] === 409), json_encode($results));
        $this->assertSame(0, $product->fresh()->stock);
        $this->assertSame(3, Order::count());
        $this->assertSame(3, InventoryMovement::count());
    }

    public function test_simultaneous_duplicate_submissions_create_exactly_one_order(): void
    {
        $product = $this->product(1);
        $results = $this->submit($product, true);
        $this->assertCount(1, array_filter($results, fn ($r) => $r['status'] === 201), json_encode($results));
        $this->assertCount(5, array_filter($results, fn ($r) => $r['status'] === 200), json_encode($results));
        $this->assertSame(1, Order::count());
        $this->assertSame(1, InventoryMovement::count());
        $this->assertSame(0,$product->fresh()->stock);
    }
}
