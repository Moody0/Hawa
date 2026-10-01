<?php

namespace Tests\Feature;

use App\Models\Customer;
use App\Models\Settings;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class WebsiteAuditTest extends TestCase
{
    use RefreshDatabase;
    protected bool $seed = true;

    public function test_settings_control_sections_and_reject_unsafe_urls(): void
    {
        $admin = User::create(['username' => 'audit-owner', 'password' => Hash::make('audit-password'), 'role' => 'SUPER_ADMIN']);
        $this->actingAs($admin, 'web')->putJson('/api/admin/settings', ['websiteContent' => ['homeHeroEnabled' => false, 'aboutValuesEnabled' => false, 'businessHours' => '9 AM - 5 PM'], 'footerPhone' => '+963911111111'])->assertOk()->assertJsonPath('websiteContent.homeHeroEnabled', false);
        $this->getJson('/api/settings')->assertOk()->assertJsonPath('footerPhone', '+963911111111')->assertJsonPath('websiteContent.businessHours', '9 AM - 5 PM');
        $this->putJson('/api/admin/settings', ['footerFacebookUrl' => 'javascript:alert(1)'])->assertStatus(422);
        $this->putJson('/api/admin/settings', ['websiteContent' => ['homeHeroEnabled' => 'false']])->assertStatus(422);
        $this->putJson('/api/admin/settings', ['websiteContent' => ['managementPhone' => '', 'businessHours' => null, 'navBlogEnabled' => false]])->assertOk()->assertJsonPath('websiteContent.managementPhone', '')->assertJsonPath('websiteContent.businessHours', '')->assertJsonPath('websiteContent.navBlogEnabled', false);
    }

    public function test_registration_validation_duplicates_and_pending_login_are_explained(): void
    {
        $payload = ['shopName' => 'Audit shop', 'ownerName' => 'Audit owner', 'phone' => '0912345678', 'city' => 'حمص', 'address' => 'Main street', 'password' => 'audit-password'];
        $this->postJson('/api/customer/auth/register', [...$payload, 'address' => 'abcd'])->assertStatus(422)->assertJsonValidationErrors('address');
        $this->postJson('/api/customer/auth/register', [...$payload, 'shopName' => '<b></b>'])->assertStatus(422)->assertJsonValidationErrors('shopName');
        $this->postJson('/api/customer/auth/register', $payload)->assertCreated()->assertJsonPath('pendingApproval', true);
        $this->postJson('/api/customer/auth/register', [...$payload, 'phone' => '+963912345678'])->assertStatus(409);
        $this->postJson('/api/customer/auth/login', ['phone' => $payload['phone'], 'password' => $payload['password']])->assertStatus(403)->assertJsonPath('error', 'ACCOUNT_PENDING')->assertJsonPath('shopName', 'Audit shop');
        $this->getJson('/api/customer/auth/me')->assertJsonPath('authenticated', false);
    }

    public function test_passwords_preserve_spaces_and_admin_limits_normalize_username(): void
    {
        Customer::create(['shop_name' => 'Audit shop', 'owner_name' => 'Owner', 'phone' => '963912345678', 'password' => Hash::make('    ab'), 'is_active' => true, 'city' => 'حمص', 'address' => 'Audit street']);
        $this->postJson('/api/customer/auth/login', ['phone' => '0912345678', 'password' => '    ab'])->assertOk();
        $this->getJson('/api/customer/auth/me')->assertJsonPath('authenticated', true);
        for ($i = 0; $i < 10; $i++) $this->postJson('/api/admin/auth/login', ['username' => str_repeat(' ', $i).'MissingAdmin', 'password' => 'wrong-password'])->assertUnauthorized();
        $this->postJson('/api/admin/auth/login', ['username' => ' MISSINGADMIN ', 'password' => 'wrong-password'])->assertStatus(429);
    }

    public function test_fresh_defaults_contain_no_demo_endorsements_and_privacy_has_its_own_page(): void
    {
        $settings = Settings::findOrFail('site-settings');
        $this->assertSame('/privacy', $settings->footer_privacy_url);
        $this->assertSame([], json_decode($settings->home_testimonials_items, true));
        $this->assertSame([], json_decode($settings->home_categories_stats, true));
    }
}
