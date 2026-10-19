<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Archived names stay intact for history; only current records reserve a name.
        Schema::table('main_categories', function (Blueprint $table) {
            $table->string('active_name', 191)->nullable()->virtualAs('CASE WHEN archived_at IS NULL THEN name ELSE NULL END');
            $table->unique('active_name');
        });
        Schema::table('main_categories', fn (Blueprint $table) => $table->dropUnique('main_categories_name_unique'));

        Schema::table('categories', function (Blueprint $table) {
            $table->string('active_name', 191)->nullable()->virtualAs('CASE WHEN archived_at IS NULL THEN name ELSE NULL END');
            $table->unique(['main_category_id', 'active_name']);
        });
        Schema::table('categories', fn (Blueprint $table) => $table->dropUnique('categories_main_category_id_name_unique'));
    }

    public function down(): void
    {
        // Reinstating the original constraints requires resolving any reused names first.
        Schema::table('main_categories', fn (Blueprint $table) => $table->unique('name'));
        Schema::table('categories', fn (Blueprint $table) => $table->unique(['main_category_id', 'name']));
        Schema::table('main_categories', function (Blueprint $table) {
            $table->dropUnique('main_categories_active_name_unique');
            $table->dropColumn('active_name');
        });
        Schema::table('categories', function (Blueprint $table) {
            $table->dropUnique('categories_main_category_id_active_name_unique');
            $table->dropColumn('active_name');
        });
    }
};
