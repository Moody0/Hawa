import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hashPassword, signToken, setCustomerAuthCookie } from '@/lib/customer-auth';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { shopName, ownerName, phone, city, address, password, notes } = body;

        if (!shopName?.trim() || !ownerName?.trim() || !phone?.trim() || !city?.trim() || !address?.trim() || !password) {
            return NextResponse.json(
                { error: 'جميع الحقول المطلوبة (اسم المحل، الاسم، الهاتف، المحافظة، العنوان، كلمة المرور) يجب تعبئتها.' },
                { status: 400 }
            );
        }

        const cleanPhone = phone.replace(/[^0-9]/g, '');
        if (cleanPhone.length < 9) {
            return NextResponse.json(
                { error: 'يرجى إدخال رقم هاتف صالح.' },
                { status: 400 }
            );
        }

        // Check if phone already registered
        const existing = await prisma.customer.findUnique({
            where: { phone: cleanPhone },
        });

        if (existing) {
            return NextResponse.json(
                { error: 'رقم الهاتف مسجل مسبقاً بحساب تجاري. يرجى تسجيل الدخول مباشرة.' },
                { status: 409 }
            );
        }

        const hashedPassword = await hashPassword(password);

        const newCustomer = await prisma.customer.create({
            data: {
                shopName: shopName.trim(),
                ownerName: ownerName.trim(),
                phone: cleanPhone,
                city: city.trim(),
                address: address.trim(),
                password: hashedPassword,
                notes: notes?.trim() || null,
            },
            select: {
                id: true,
                shopName: true,
                ownerName: true,
                phone: true,
                city: true,
                address: true,
                notes: true,
                createdAt: true,
            },
        });

        // Sign session token & set cookie
        const token = signToken({
            id: newCustomer.id,
            phone: newCustomer.phone,
            shopName: newCustomer.shopName,
            ownerName: newCustomer.ownerName,
        });

        await setCustomerAuthCookie(token);

        // Also retroactively link any past orders placed with this phone number
        await prisma.order.updateMany({
            where: {
                phone: cleanPhone,
                customerId: null,
            },
            data: {
                customerId: newCustomer.id,
            },
        });

        return NextResponse.json({
            success: true,
            customer: newCustomer,
            message: 'تم تسجيل الحساب التجاري بنجاح!',
        });
    } catch (error: any) {
        console.error('Customer register error:', error);
        return NextResponse.json(
            { error: error?.message || 'حدث خطأ أثناء تسجيل الحساب' },
            { status: 500 }
        );
    }
}
