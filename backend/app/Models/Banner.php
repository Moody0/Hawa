<?php

namespace App\Models;

use App\Models\Concerns\HasStringId;
use Illuminate\Database\Eloquent\Model;

class Banner extends Model
{
    use HasStringId;

    protected $table = 'banners';

    protected $guarded = [];

    protected $attributes = ['button_text' => 'Shop Now', 'button_text_ar' => 'تسوق الآن', 'link' => '/products', 'badge' => 'Certified Wholesale', 'badge_ar' => 'توزيع جملة معتمد', 'is_active' => true];

    public $incrementing = false;

    protected $keyType = 'string';

    protected function casts(): array
    {
        return ['is_active' => 'boolean', 'created_at' => 'datetime', 'updated_at' => 'datetime', 'archived_at' => 'datetime'];
    }

    protected static function booted(): void
    {
        static::addGlobalScope('active_records', fn ($q) => $q->whereNull($q->getModel()->getTable().'.archived_at'));
    }
}
