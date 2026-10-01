<?php

namespace App\Models;

use App\Models\Concerns\HasStringId;
use Illuminate\Database\Eloquent\Model;

class Category extends Model
{
    use HasStringId;

    protected $table = 'categories';

    protected $guarded = [];

    protected $attributes = ['is_featured' => false, 'is_active' => true];

    public $incrementing = false;

    protected $keyType = 'string';

    protected function casts(): array
    {
        return ['created_at' => 'datetime', 'updated_at' => 'datetime', 'is_featured' => 'boolean', 'is_active' => 'boolean', 'archived_at' => 'datetime'];
    }

    protected static function booted(): void
    {
        static::addGlobalScope('active_records', fn ($q) => $q->whereNull($q->getModel()->getTable().'.archived_at'));
    }

    public function mainCategory()
    {
        return $this->belongsTo(MainCategory::class);
    }

    public function products()
    {
        return $this->hasMany(Product::class);
    }
}
