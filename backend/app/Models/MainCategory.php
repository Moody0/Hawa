<?php

namespace App\Models;

use App\Models\Concerns\HasStringId;
use Illuminate\Database\Eloquent\Model;

class MainCategory extends Model
{
    use HasStringId;

    protected $table = 'main_categories';

    protected $guarded = [];

    protected $attributes = ['is_active' => true, 'show_in_nav' => true, 'nav_order' => 0, 'is_featured' => false];

    public $incrementing = false;

    protected $keyType = 'string';

    protected function casts(): array
    {
        return ['is_active' => 'boolean', 'show_in_nav' => 'boolean', 'nav_order' => 'integer', 'is_featured' => 'boolean', 'created_at' => 'datetime', 'updated_at' => 'datetime', 'archived_at' => 'datetime'];
    }

    protected static function booted(): void
    {
        static::addGlobalScope('active_records', fn ($q) => $q->whereNull($q->getModel()->getTable().'.archived_at'));
    }

    public function categories()
    {
        return $this->hasMany(Category::class);
    }

    public function products()
    {
        return $this->hasMany(Product::class);
    }

    public function brands()
    {
        return $this->hasMany(Brand::class);
    }
}
