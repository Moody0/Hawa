<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        foreach (['settings', 'posts'] as $name) {
            $changes = [];
            foreach (Schema::getColumns($name) as $column) {
                if ($column['type_name'] === 'text' && ($name === 'settings' || in_array($column['name'], ['content', 'content_ar']))) {
                    $changes[] = 'MODIFY `'.$column['name'].'` LONGTEXT '.($column['nullable'] ? 'NULL' : 'NOT NULL');
                }
            }
            if ($changes) {
                DB::statement('ALTER TABLE `'.$name.'` '.implode(', ', $changes));
            }
        }
    }

    public function down(): void
    {
        // Retain the larger columns rather than truncate editable site content.
    }
};
