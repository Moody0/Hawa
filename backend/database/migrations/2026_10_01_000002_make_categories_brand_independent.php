<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('category_model_migration_backup', function (Blueprint $table) {
            $table->string('id', 191)->primary();
            $table->longText('row_json');
        });
        Schema::create('product_category_migration_backup', function (Blueprint $table) {
            $table->string('product_id', 191)->primary();
            $table->string('category_id', 191);
        });
        Schema::create('category_settings_migration_backup', function (Blueprint $table) {
            $table->string('id', 191)->primary();
            $table->longText('home_categories_ids')->nullable();
        });
        Schema::create('category_slug_redirects', function (Blueprint $table) {
            $table->string('slug', 191)->primary();
            $table->string('category_id', 191);
            $table->foreign('category_id')->references('id')->on('categories')->onDelete('cascade');
        });

        $categoryRows = DB::table('categories')->get();
        foreach ($categoryRows as $row) {
            DB::table('category_model_migration_backup')->insert([
                'id' => $row->id,
                'row_json' => json_encode((array) $row, JSON_THROW_ON_ERROR),
            ]);
        }
        foreach (DB::table('products')->get(['id', 'category_id']) as $row) {
            DB::table('product_category_migration_backup')->insert([
                'product_id' => $row->id,
                'category_id' => $row->category_id,
            ]);
        }
        $settings = DB::table('settings')->where('id', 'site-settings')->first(['home_categories_ids']);
        if ($settings) {
            DB::table('category_settings_migration_backup')->insert([
                'id' => 'site-settings',
                'home_categories_ids' => $settings->home_categories_ids,
            ]);
        }

        $brandMainCategories = DB::table('brands')->pluck('main_category_id', 'id')->all();
        $productMainCategories = DB::table('products')->whereNotNull('main_category_id')->get(['category_id', 'main_category_id'])
            ->groupBy('category_id')->map(function ($products) {
                return $products->groupBy('main_category_id')->sortByDesc(fn ($rows) => $rows->count())->keys()->first();
            })->all();

        $groups = [];
        foreach ($categoryRows as $row) {
            $mainCategoryId = $row->main_category_id
                ?: ($brandMainCategories[$row->brand_id] ?? null)
                ?: ($productMainCategories[$row->id] ?? null);

            if ($mainCategoryId !== $row->main_category_id) {
                DB::table('categories')->where('id', $row->id)->update(['main_category_id' => $mainCategoryId]);
            }

            $normalizedName = mb_strtolower(trim(preg_replace('/\s+/u', ' ', $row->name) ?? $row->name));
            $groups[($mainCategoryId ?? '__none__').'|'.$normalizedName][] = [
                'row' => $row,
                'main_category_id' => $mainCategoryId,
            ];
        }

        $productCounts = DB::table('products')->select('category_id')->selectRaw('COUNT(*) as product_count')
            ->groupBy('category_id')->pluck('product_count', 'category_id')->all();
        $categoryIdMap = [];

        foreach ($groups as $group) {
            usort($group, function ($left, $right) use ($productCounts) {
                $leftRow = $left['row'];
                $rightRow = $right['row'];
                $leftRank = [
                    (int) ($productCounts[$leftRow->id] ?? 0),
                    (int) $leftRow->is_featured,
                    (int) $leftRow->is_active,
                    (int) (bool) $leftRow->image,
                    $leftRow->created_at,
                ];
                $rightRank = [
                    (int) ($productCounts[$rightRow->id] ?? 0),
                    (int) $rightRow->is_featured,
                    (int) $rightRow->is_active,
                    (int) (bool) $rightRow->image,
                    $rightRow->created_at,
                ];

                return $rightRank <=> $leftRank;
            });

            $canonical = $group[0]['row'];
            $mainCategoryId = $group[0]['main_category_id'];
            $featured = false;
            $active = false;
            $hasUnarchived = false;
            $description = null;
            $image = null;

            foreach ($group as $candidate) {
                $row = $candidate['row'];
                $featured = $featured || (bool) $row->is_featured;
                $active = $active || (bool) $row->is_active;
                $hasUnarchived = $hasUnarchived || $row->archived_at === null;
                $description ??= filled($row->description) ? $row->description : null;
                $image ??= filled($row->image) ? $row->image : null;
                $categoryIdMap[$row->id] = $canonical->id;
            }

            DB::table('categories')->where('id', $canonical->id)->update([
                'name' => trim(preg_replace('/\s+/u', ' ', $canonical->name) ?? $canonical->name),
                'main_category_id' => $mainCategoryId,
                'description' => $description,
                'image' => $image,
                'is_featured' => $featured,
                'is_active' => $active,
                'archived_at' => $hasUnarchived ? null : $canonical->archived_at,
            ]);

            foreach (array_slice($group, 1) as $duplicate) {
                $row = $duplicate['row'];
                if ($row->slug && $row->slug !== $canonical->slug) {
                    DB::table('category_slug_redirects')->insertOrIgnore([
                        'slug' => $row->slug,
                        'category_id' => $canonical->id,
                    ]);
                }
                DB::table('products')->where('category_id', $row->id)->update(['category_id' => $canonical->id]);
                DB::table('categories')->where('id', $row->id)->delete();
            }
        }

        if ($settings && $settings->home_categories_ids) {
            $ids = json_decode($settings->home_categories_ids, true);
            $isJson = is_array($ids);
            if (! $isJson) {
                $ids = array_filter(array_map('trim', explode(',', $settings->home_categories_ids)));
            }
            $ids = array_values(array_unique(array_map(fn ($id) => $categoryIdMap[$id] ?? $id, $ids)));
            DB::table('settings')->where('id', 'site-settings')->update([
                'home_categories_ids' => $isJson ? json_encode($ids, JSON_THROW_ON_ERROR) : implode(',', $ids),
            ]);
        }

        Schema::table('categories', function (Blueprint $table) {
            $table->dropForeign(['brand_id']);
            $table->dropUnique('categories_brand_id_name_unique');
            $table->dropIndex('categories_brand_id_index');
            $table->dropColumn('brand_id');
            $table->unique(['main_category_id', 'name']);
        });
    }

    public function down(): void
    {
        Schema::table('categories', function (Blueprint $table) {
            $table->dropUnique('categories_main_category_id_name_unique');
            $table->string('brand_id', 191)->nullable();
        });

        foreach (DB::table('category_model_migration_backup')->get() as $backup) {
            $row = json_decode($backup->row_json, true, 512, JSON_THROW_ON_ERROR);
            DB::table('categories')->updateOrInsert(['id' => $backup->id], $row);
        }
        foreach (DB::table('product_category_migration_backup')->get() as $backup) {
            DB::table('products')->where('id', $backup->product_id)->update(['category_id' => $backup->category_id]);
        }
        $settings = DB::table('category_settings_migration_backup')->where('id', 'site-settings')->first();
        if ($settings) {
            DB::table('settings')->where('id', 'site-settings')->update(['home_categories_ids' => $settings->home_categories_ids]);
        }

        Schema::dropIfExists('category_slug_redirects');
        Schema::table('categories', function (Blueprint $table) {
            $table->index('brand_id');
            $table->unique(['brand_id', 'name']);
            $table->foreign('brand_id')->references('id')->on('brands')->onDelete('restrict');
        });
        Schema::dropIfExists('category_settings_migration_backup');
        Schema::dropIfExists('product_category_migration_backup');
        Schema::dropIfExists('category_model_migration_backup');
    }
};
