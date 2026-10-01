<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Support\AdminAccess;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class UploadController extends Controller
{
    public function store(Request $request)
    {
        $folder = (string) $request->input('folder', 'general');
        abort_unless(in_array($folder, ['products', 'brands', 'categories', 'main-categories', 'banners', 'blog', 'reviews', 'general', 'settings', 'site-content'], true), 422, 'Invalid upload folder.');
        $admin = Auth::guard('web')->user();
        $customer = Auth::guard('merchant')->user();
        if ($admin) {
            AdminAccess::check(match ($folder) {
                'products' => 'PRODUCTS_MANAGE','brands' => 'BRANDS_MANAGE','categories' => 'CATEGORIES_MANAGE','main-categories' => 'MAIN_CATEGORIES_MANAGE','banners' => 'BANNERS_MANAGE','blog' => 'BLOG_MANAGE','reviews' => 'REVIEWS_MANAGE',default => 'SITE_CONTENT_MANAGE'
            });
        } else {
            abort_unless($customer && $customer->is_active && $folder === 'reviews', 403);
        }
        $request->validate(['file' => ['required', 'file', 'image', 'mimes:jpg,jpeg,png,webp', 'max:5120']]);
        $file = $request->file('file');
        $meta = @getimagesize($file->getRealPath());
        abort_unless($meta && $meta[0] <= 4096 && $meta[1] <= 4096 && $meta[0] * $meta[1] <= 16777216, 422, 'Image dimensions exceed supported limits.');
        abort_unless(function_exists('imagewebp'), 503, 'PHP GD WebP support is required.');
        $source = @imagecreatefromstring(file_get_contents($file->getRealPath()));
        abort_unless($source, 422, 'Invalid image data.');
        try {
            if ($meta['mime'] === 'image/jpeg' && function_exists('exif_read_data')) {
                $exif = @exif_read_data($file->getRealPath());
                $o = (int) ($exif['Orientation'] ?? 1);
                if (in_array($o, [2, 4, 5, 7])) {
                    imageflip($source, IMG_FLIP_HORIZONTAL);
                }$angle = match ($o) {
                    3,4 => 180,5,6 => -90,7,8 => 90,default => 0
                };
                if ($angle) {
                    $rotated = imagerotate($source, $angle, 0);
                    imagedestroy($source);
                    $source = $rotated;
                }
            }
            $width = imagesx($source);
            $height = imagesy($source);
            $scale = min(1, 2560 / max($width, $height));
            $out = imagecreatetruecolor(max(1, (int) round($width * $scale)), max(1, (int) round($height * $scale)));
            imagealphablending($out, false);
            imagesavealpha($out, true);
            imagefill($out, 0, 0, imagecolorallocatealpha($out, 0, 0, 0, 127));
            imagecopyresampled($out, $source, 0, 0, 0, 0, imagesx($out), imagesy($out), $width, $height);
            ob_start();
            $ok = imagewebp($out, null, 85);
            $bytes = ob_get_clean();
            $w = imagesx($out);
            $h = imagesy($out);
            imagedestroy($out);
            abort_unless($ok && $bytes, 500, 'Unable to process image.');
            $key = $folder.'/'.Str::uuid().'.webp';
            abort_unless(Storage::disk('public')->put($key, $bytes), 500, 'Unable to save image.');

            return response()->json(['url' => '/uploads/'.$key, 'success' => true, 'width' => $w, 'height' => $h], 201);
        } finally {
            imagedestroy($source);
        }
    }

    public function show(string $path)
    {
        abort_unless(preg_match('/\A[a-zA-Z0-9._\/-]+\z/', $path) && ! str_contains($path, '..') && ! str_contains($path, '\\'), 404);
        $disk = Storage::disk('public');
        abort_unless($disk->exists($path),404);

        return response()->file($disk->path($path),['Cache-Control' => 'public, max-age=31536000, immutable', 'X-Content-Type-Options' => 'nosniff']);
    }
}
