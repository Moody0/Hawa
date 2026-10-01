<?php

namespace App\Models\Concerns;

use Illuminate\Support\Str;

trait HasStringId
{
    public static function bootHasStringId(): void
    {
        static::creating(function ($model): void {
            if (! $model->getKey()) {
                // Keep IDs compact and opaque like the existing CUID keys.
                $model->setAttribute($model->getKeyName(), 'c'.base_convert((string) (int) (microtime(true) * 1000), 10, 36).Str::lower(Str::random(16)));
            }
        });
    }
}
