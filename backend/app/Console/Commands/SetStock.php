<?php

namespace App\Console\Commands;

use App\Models\Product;
use Illuminate\Console\Command;

class SetStock extends Command
{
    protected $signature = 'hawa:set-stock {stock=100 : The stock quantity to set for all products}';

    protected $description = 'Set stock quantity for all products in the catalog';

    public function handle(): int
    {
        $stock = (int) $this->argument('stock');
        if ($stock < 0) {
            $this->error('Stock quantity cannot be negative.');

            return self::FAILURE;
        }

        $count = Product::withoutGlobalScopes()->update(['stock' => $stock]);

        $this->info("Successfully updated stock to {$stock} for {$count} products.");

        return self::SUCCESS;
    }
}
