<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('settings', fn (Blueprint $table) => $table->json('website_content')->nullable());
        DB::table('settings')->where('footer_privacy_url', '/shipping-returns')->update(['footer_privacy_url' => '/privacy']);
        // Match the complete unchanged bundled payload. Edited content is preserved.
        foreach (DB::table('settings')->get(['id', 'home_testimonials_items', 'home_categories_stats']) as $row) {
            $reviews = json_decode($row->home_testimonials_items ?? '[]', true);
            if (is_array($reviews) && hash('sha256', json_encode($reviews)) === '485b3b7c594b492857c67adba8db3d9fec71b61331f53741fe6c228160d374c2') {
                DB::table('settings')->where('id', $row->id)->update(['home_testimonials_items' => '[]']);
            }
            $stats = json_decode($row->home_categories_stats ?? '[]', true);
            if (is_array($stats) && hash('sha256', json_encode($stats)) === '4b367d66bf7149f3f8ba7ff621f16754274eabf853ed6bbf7d44dc84ec5dc5d2') {
                DB::table('settings')->where('id', $row->id)->update(['home_categories_stats' => '[]']);
            }
        }
    }
    public function down(): void { Schema::table('settings', fn (Blueprint $table) => $table->dropColumn('website_content')); }
};
