<?php

namespace App\Models;

use App\Models\Concerns\HasStringId;
use Illuminate\Database\Eloquent\Model;

class InventoryMovement extends Model
{
    use HasStringId;

    protected $table = 'inventory_movements';

    protected $guarded = [];

    protected $attributes = [];

    public $incrementing = false;

    protected $keyType = 'string';

    public $timestamps = false;

    protected function casts(): array
    {
        return ['quantity' => 'integer', 'created_at' => 'datetime'];
    }
}
