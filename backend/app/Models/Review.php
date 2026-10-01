<?php

namespace App\Models;

use App\Models\Concerns\HasStringId;
use Illuminate\Database\Eloquent\Model;

class Review extends Model
{
    use HasStringId;

    protected $table = 'reviews';

    protected $guarded = [];

    protected $attributes = ['is_approved' => false];

    public $incrementing = false;

    protected $keyType = 'string';

    protected function casts(): array
    {
        return ['rating' => 'integer', 'is_approved' => 'boolean', 'created_at' => 'datetime', 'updated_at' => 'datetime', 'archived_at' => 'datetime'];
    }

    protected static function booted(): void
    {
        static::addGlobalScope('active_records', fn ($q) => $q->whereNull($q->getModel()->getTable().'.archived_at'));
    }

    public function product()
    {
        return $this->belongsTo(Product::class);
    }
}
