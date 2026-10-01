<?php

namespace App\Models;

use App\Models\Concerns\HasStringId;
use Illuminate\Database\Eloquent\Model;

class AdminAuditLog extends Model
{
    use HasStringId;

    protected $table = 'admin_audit_logs';

    protected $guarded = [];

    protected $attributes = [];

    public $incrementing = false;

    protected $keyType = 'string';

    public $timestamps = false;

    protected function casts(): array
    {
        return ['metadata' => 'array', 'created_at' => 'datetime'];
    }
}
