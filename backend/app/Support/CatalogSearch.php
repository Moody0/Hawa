<?php

namespace App\Support;

class CatalogSearch
{
    public static function variants(string $term): array
    {
        $term = trim($term);
        $variants = [$term];
        $normalized = mb_strtolower(preg_replace('/[\x{064B}-\x{065F}\x{0670}\x{0640}]/u', '', $term));
        $variants[] = strtr($normalized, ['أ' => 'ا', 'إ' => 'ا', 'آ' => 'ا', 'ة' => 'ه', 'ى' => 'ي']);
        $variants[] = str_replace('ة', 'ه', $term);
        $variants[] = str_replace('ه', 'ة', $term);
        $variants[] = str_replace('ى', 'ي', $term);
        $variants[] = str_replace('ي', 'ى', $term);
        if (in_array($term, ['تونة', 'تونا', 'طون'])) {
            array_push($variants, 'تونة', 'تونا', 'طون');
        }
        if (in_array($term, ['زيت', 'زيوت'])) {
            array_push($variants, 'زيت', 'زيوت');
        }
        if (in_array($term, ['سمن', 'سمنة'])) {
            array_push($variants, 'سمن', 'سمنة');
        }

        return array_values(array_unique(array_filter($variants, fn ($v) => mb_strlen($v) >= 2)));
    }
}
