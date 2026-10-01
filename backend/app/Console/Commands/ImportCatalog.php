<?php

namespace App\Console\Commands;

use App\Http\Controllers\Api\HawaAdminController;
use App\Models\AdminAuditLog;
use App\Models\Product;
use App\Models\User;
use App\Support\AdminAccess;
use Illuminate\Console\Command;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Throwable;

class ImportCatalog extends Command
{
    protected $signature = 'hawa:import-catalog {file? : Absolute path to an import JSON file} {--dry-run : Validate the complete import without saving changes}';

    protected $description = 'Import the reviewed Hawa workbook into an empty product catalog, once per source file';

    public function handle(): int
    {
        $path = $this->argument('file') ?: database_path('imports/hawa-products.json');
        if (! is_file($path) || filesize($path) > 5 * 1024 * 1024) {
            $this->error('Import JSON is missing or exceeds 5 MB.');
            return self::FAILURE;
        }
        $content = file_get_contents($path);
        $data = json_decode($content, true);
        if (! is_array($data) || ! is_array($data['rows'] ?? null) || count($data['rows']) !== ($data['productCount'] ?? null)) {
            $this->error('Import JSON must contain rows and the matching productCount.');
            return self::FAILURE;
        }
        $admin = User::where('role', 'SUPER_ADMIN')->whereNull('disabled_at')->first();
        if (! $admin) {
            $this->error('Create an active super administrator before importing.');
            return self::FAILURE;
        }
        $hash = hash('sha256', $content);
        $previousUser = Auth::guard('web')->user();
        Auth::guard('web')->setUser($admin);
        DB::beginTransaction();
        try {
            // Serialize command runs and retain a durable marker for repeat uploads.
            DB::table('settings')->orderBy('id')->lockForUpdate()->first();
            if (AdminAuditLog::where('entity_type', 'CatalogImport')->where('entity_id', $hash)->exists()) {
                DB::rollBack();
                $this->info('This file was already imported. No products were changed.');
                return self::SUCCESS;
            }
            if (Product::withoutGlobalScopes()->exists()) {
                DB::rollBack();
                $this->error('The catalog already contains products. Use the admin dashboard to review existing data before importing.');
                return self::FAILURE;
            }
            $result = app(HawaAdminController::class)->import(Request::create('/', 'POST', ['rows' => $data['rows']]))->getData(true);
            AdminAccess::audit('IMPORT', 'CatalogImport', $hash, ['source' => basename($path), 'count' => $result['count']]);
            if ($this->option('dry-run')) {
                DB::rollBack();
                $this->info("Validated {$result['count']} products. No changes saved.");
            } else {
                DB::commit();
                $this->info("Imported {$result['count']} products. All product fields remain editable through the dashboard.");
            }
            return self::SUCCESS;
        } catch (Throwable $error) {
            DB::rollBack();
            $this->error('Import rolled back: '.$error->getMessage());
            return self::FAILURE;
        } finally {
            if ($previousUser) {
                Auth::guard('web')->setUser($previousUser);
            } else {
                Auth::guard('web')->forgetUser();
            }
        }
    }
}
