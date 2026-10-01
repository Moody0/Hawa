<?php

namespace App\Models;

use App\Models\Concerns\HasStringId;
use Illuminate\Database\Eloquent\Model;

class Post extends Model
{
    use HasStringId;

    protected $table = 'posts';

    protected $guarded = [];

    protected $attributes = ['category' => 'أخبار الشركة', 'category_ar' => 'أخبار الشركة', 'is_published' => true];

    public $incrementing = false;

    protected $keyType = 'string';

    protected function casts(): array
    {
        return ['is_published' => 'boolean', 'created_at' => 'datetime', 'updated_at' => 'datetime', 'archived_at' => 'datetime'];
    }

    protected static function booted(): void
    {
        static::addGlobalScope('active_records', fn ($q) => $q->whereNull($q->getModel()->getTable().'.archived_at'));
    }
}
