import { NextResponse } from 'next/server';
import { clearCustomerAuthCookie } from '@/lib/customer-auth';

export async function POST() {
    await clearCustomerAuthCookie();
    return NextResponse.json({ success: true, message: 'تم تسجيل الخروج' });
}
