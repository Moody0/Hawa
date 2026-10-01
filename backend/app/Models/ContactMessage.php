<?php

namespace App\Models;

use App\Models\Concerns\HasStringId;
use Illuminate\Database\Eloquent\Model;

class ContactMessage extends Model
{
    use HasStringId;

    protected $table = 'contact_messages';

    protected $guarded = [];

    protected $attributes = ['is_read' => false];

    public $incrementing = false;

    protected $keyType = 'string';

    protected function casts(): array
    {
        return ['is_read' => 'boolean', 'created_at' => 'datetime', 'updated_at' => 'datetime', 'archived_at' => 'datetime'];
    }

    protected static function booted(): void
    {
        static::addGlobalScope('active_records', fn ($q) => $q->whereNull($q->getModel()->getTable().'.archived_at'));
    }
}
