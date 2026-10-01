<?php

namespace Database\Seeders;

use App\Models\Settings;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $defaults = json_decode(file_get_contents(__DIR__.'/default-settings.json'), true, 512, JSON_THROW_ON_ERROR);
        $data = [];
        foreach ($defaults as $key => $value) {
            $data[Str::snake($key)] = $value;
        } Settings::firstOrCreate(['id' => 'site-settings'], $data);
    }
}
