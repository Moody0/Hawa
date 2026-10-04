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
        // including the mobile prefix 9 (for example +963987654321).
        if (preg_match('/^9639\d{8}$/', $digits)) {
            return '+'.$digits;
        }
        if (str_starts_with($digits, '00963')) {
            $digits = substr($digits, 5);
        } elseif (preg_match('/^963\d{8}$/', $digits)) {
            // Older code accidentally dropped the leading mobile 9 when
            // saving a local number. Accept that stored/input form and repair it.
            return '+9639'.substr($digits, 3);
        } elseif (str_starts_with($digits, '963')) {
            $digits = substr($digits, 3);
        }
        if (str_starts_with($digits, '0')) {
            $digits = substr($digits, 1);
        }
        if (preg_match('/^9\d{8}$/', $digits)) {
            return '+963'.$digits;
        }
        if (preg_match('/^\d{8}$/', $digits)) {
            return '+9639'.$digits;
        }

        return null;
    }

    public static function variants(string $canonical): array
    {
        $clean = preg_replace('/\D/', '', $canonical) ?? '';
        if (str_starts_with($clean, '963')) {
            $subscriber = substr($clean, 3);
        } elseif (str_starts_with($clean, '0')) {
            $subscriber = substr($clean, 1);
        } else {
            $subscriber = $clean;
        }

        return array_values(array_unique(array_filter([
            '+963'.$subscriber,
            '963'.$subscriber,
            '0'.$subscriber,
            $subscriber,
            '00963'.$subscriber,
            strlen($subscriber) === 9 ? '963'.substr($subscriber, 1) : null,
            $canonical,
        ])));
    }
}
