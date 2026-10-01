<?php

namespace App\Models;

use App\Models\Concerns\HasStringId;
use Illuminate\Database\Eloquent\Model;

class Product extends Model
{
    use HasStringId;

    protected $table = 'products';

    protected $guarded = [];

    protected $appends = ['requires_quote'];

    public function getRequiresQuoteAttribute(): bool
    {
        return $this->hide_price || ($this->price !== null && (float) $this->price <= 0);
    }

    protected $attributes = ['is_trending' => false, 'stock' => 0, 'packaging' => 'طرد', 'min_order' => 1, 'hide_price' => false];

    public $incrementing = false;

    protected $keyType = 'string';

    protected function casts(): array
    {
        return ['is_trending' => 'boolean', 'price' => 'decimal:2', 'discount_price' => 'decimal:2', 'discount_value' => 'decimal:2', 'stock' => 'integer', 'min_order' => 'integer', 'hide_price' => 'boolean', 'created_at' => 'datetime', 'updated_at' => 'datetime', 'archived_at' => 'datetime'];
    }

    protected static function booted(): void
    {
        static::addGlobalScope('active_records', fn ($q) => $q->whereNull($q->getModel()->getTable().'.archived_at'));
    }

    public function brand()
    {
        return $this->belongsTo(Brand::class);
    }

    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    public function mainCategory()
    {
        return $this->belongsTo(MainCategory::class);
    }

    public function orderItems()
    {
        return $this->hasMany(OrderItem::class);
    }

    public function reviews()
    {
        return $this->hasMany(Review::class);
    }
}
