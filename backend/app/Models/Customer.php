<?php

namespace App\Models;

use App\Models\Concerns\HasStringId;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Laravel\Sanctum\HasApiTokens;

class Customer extends Authenticatable
{
    use HasApiTokens;
    use HasStringId;

    protected $table = 'customers';

    protected $guarded = [];

    protected $attributes = ['is_active' => false];

    public $incrementing = false;

    protected $keyType = 'string';

    protected $hidden = ['password', 'remember_token'];

    protected function casts(): array
    {
        return ['is_active' => 'boolean', 'created_at' => 'datetime', 'updated_at' => 'datetime', 'archived_at' => 'datetime', 'password' => 'hashed'];
    }

    protected static function booted(): void
    {
        static::addGlobalScope('active_records', fn ($q) => $q->whereNull($q->getModel()->getTable().'.archived_at'));
    }

    public function orders()
    {
        return $this->hasMany(Order::class);
    }

    public function wishlist()
    {
        return $this->hasMany(WishlistItem::class);
    }

    public function wishlistProducts()
    {
        return $this->belongsToMany(Product::class, 'wishlist_items')->withTimestamps();
    }
}
