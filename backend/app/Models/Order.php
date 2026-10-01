<?php

namespace App\Models;

use App\Models\Concerns\HasStringId;
use Illuminate\Database\Eloquent\Model;

class Order extends Model
{
    use HasStringId;

    protected $table = 'orders';

    protected $guarded = [];

    protected $attributes = ['status' => 'PENDING', 'discount' => 0, 'stock_reserved' => true];

    public $incrementing = false;

    protected $keyType = 'string';

    protected function casts(): array
    {
        return ['total_amount' => 'decimal:2', 'created_at' => 'datetime', 'updated_at' => 'datetime', 'discount' => 'decimal:2', 'stock_reserved' => 'boolean', 'is_quote_request' => 'boolean', 'archived_at' => 'datetime'];
    }

    protected static function booted(): void
    {
        static::addGlobalScope('active_records', fn ($q) => $q->whereNull($q->getModel()->getTable().'.archived_at'));
    }

    public function items()
    {
        return $this->hasMany(OrderItem::class);
    }

    public function customer()
    {
        return $this->belongsTo(Customer::class);
    }

    public function promoCode()
    {
        return $this->belongsTo(PromoCode::class);
    }
}
