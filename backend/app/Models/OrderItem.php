<?php

namespace App\Models;

use App\Models\Concerns\HasStringId;
use Illuminate\Database\Eloquent\Model;

class OrderItem extends Model
{
    use HasStringId;

    protected $table = 'order_items';

    protected $guarded = [];

    protected $attributes = [];

    public $incrementing = false;

    protected $keyType = 'string';

    protected function casts(): array
    {
        return ['quantity' => 'integer', 'price' => 'decimal:2', 'created_at' => 'datetime', 'updated_at' => 'datetime'];
    }

    public function order()
    {
        return $this->belongsTo(Order::class);
    }

    public function product()
    {
        return $this->belongsTo(Product::class)->withoutGlobalScope('active_records');
    }
}
