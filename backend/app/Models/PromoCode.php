<?php

namespace App\Models;

use App\Models\Concerns\HasStringId;
use Illuminate\Database\Eloquent\Model;

class PromoCode extends Model
{
    use HasStringId;

    protected $table = 'promo_codes';

    protected $guarded = [];

    protected $attributes = ['is_active' => true, 'usage_count' => 0, 'total_sales' => 0];

    public $incrementing = false;

    protected $keyType = 'string';

    protected function casts(): array
    {
        return ['discount_percentage' => 'integer', 'is_active' => 'boolean', 'usage_count' => 'integer', 'total_sales' => 'decimal:2', 'created_at' => 'datetime', 'updated_at' => 'datetime', 'archived_at' => 'datetime'];
    }

    protected static function booted(): void
    {
        static::addGlobalScope('active_records', fn ($q) => $q->whereNull($q->getModel()->getTable().'.archived_at'));
    }
}
