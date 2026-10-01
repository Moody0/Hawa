<?php

namespace App\Support;

final class MerchantPhone
{
    public static function normalize(string $value): ?string
    {
        $normalized = strtr(trim($value), array_combine(
            preg_split('//u', '٠١٢٣٤٥٦٧٨٩۰۱۲۳۴۵۶۷۸۹', -1, PREG_SPLIT_NO_EMPTY),
            str_split('01234567890123456789'),
        ));
        if (! preg_match('/^[0-9+().\s-]+$/', $normalized)) {
            return null;
        }
        $digits = preg_replace('/\D/', '', $normalized) ?? '';
        // Canonical Syrian mobile numbers are country code + nine digits,
        // including the mobile prefix 9 (for example 963933254796).
        if (preg_match('/^9639\d{8}$/', $digits)) {
            return $digits;
        }
        if (str_starts_with($digits, '00963')) {
            $digits = substr($digits, 5);
        } elseif (preg_match('/^963\d{8}$/', $digits)) {
            // Older code accidentally dropped the leading mobile 9 when
            // saving a local number. Accept that stored/input form and repair it.
            return '9639'.substr($digits, 3);
        } elseif (str_starts_with($digits, '963')) {
            $digits = substr($digits, 3);
        }
        if (preg_match('/^09\d{8}$/', $digits)) {
            return '963'.substr($digits, 1);
        }
        if (preg_match('/^9\d{8}$/', $digits)) {
            return '963'.substr($digits, 1);
        }
        if (preg_match('/^\d{8}$/', $digits)) {
            return '9639'.$digits;
        }

        return null;
    }

    public static function variants(string $canonical): array
    {
        $subscriber = substr($canonical, 3);

        return array_values(array_unique([
            $canonical,
            '0'.$subscriber,
            // Include values saved by the previous normalizer, which omitted
            // the subscriber's leading 9 from international-form numbers.
            preg_match('/^9639\d{8}$/', $canonical) ? '963'.substr($canonical, 4) : $canonical,
        ]));
    }
}
