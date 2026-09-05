import { formatPackaging } from './packaging';

/**
 * Utilities for formatting WhatsApp orders and messages for Hawa Distribution
 */

export function cleanWhatsAppNumber(phone: string): string {
    let cleaned = phone.replace(/[^0-9]/g, '');
    if (cleaned.startsWith('00963')) {
        cleaned = '963' + cleaned.slice(5);
    } else if (cleaned.startsWith('09') && cleaned.length === 10) {
        cleaned = '963' + cleaned.slice(1);
    }
    return cleaned;
}

export interface WhatsAppOrderProduct {
    name?: string | null;
    nameAr?: string | null;
    packaging?: string | null;
    itemsPerPackage?: string | number | null;
}

export interface WhatsAppOrderItem {
    quantity: number;
    price: number;
    options?: string | null;
    product?: WhatsAppOrderProduct | null;
}

export interface WhatsAppOrderData {
    id: string;
    shopName?: string | null;
    Name?: string | null;
    phone: string;
    city: string;
    streetAddress: string;
    notes?: string | null;
    totalAmount: number;
    items: WhatsAppOrderItem[];
}

export function generateWhatsAppOrderMessage(order: WhatsAppOrderData): string {
    const lines: string[] = [];
    lines.push(`🛒 *طلب جملة جديد – شركة هوا للتوزيع والتجارة*`);
    lines.push(`━━━━━━━━━━━━━━━━━━`);
    lines.push(`📦 *رقم الطلبية:* #${order.id.slice(-8).toUpperCase()}`);
    if (order.shopName) {
        lines.push(`🏪 *اسم المحل / المتجر:* ${order.shopName}`);
    }
    if (order.Name) {
        lines.push(`👤 *اسم صاحب الطلب:* ${order.Name}`);
    }
    lines.push(`📞 *رقم الهاتف للتواصل:* ${order.phone}`);
    lines.push(`📍 *المحافظة:* ${order.city}`);
    lines.push(`🏢 *العنوان بالتفصيل:* ${order.streetAddress}`);
    lines.push(`━━━━━━━━━━━━━━━━━━`);
    lines.push(`📋 *المنتجات والطرود المطلوبة:*`);

    order.items.forEach((item, index) => {
        const pName = item.product?.nameAr || item.product?.name || 'منتج';
        const pkg = formatPackaging(item.product?.packaging, 'ar');
        const rawContent = item.product?.itemsPerPackage ? String(item.product.itemsPerPackage).trim() : null;
        let contentStr = '';
        if (rawContent) {
            if (rawContent.includes('مواصفات المصنع')) {
                contentStr = ' (حسب مواصفات المصنع)';
            } else if (rawContent.includes('قطعة') || rawContent.includes('عبوة')) {
                contentStr = ` (${rawContent})`;
            } else if (/^\d+$/.test(rawContent)) {
                contentStr = ` (${rawContent} قطعة)`;
            } else {
                contentStr = ` (${rawContent})`;
            }
        }
        const priceText = item.price > 0
            ? `${(item.price * item.quantity).toLocaleString()} ل.س`
            : 'السعر عند الطلب';
        const opt = item.options ? ` [${item.options}]` : '';
        lines.push(`${index + 1}️⃣ *${pName}*${opt}`);
        lines.push(`   └ الكمية: *${item.quantity} ${pkg}*${contentStr} • ${priceText}`);
    });

    lines.push(`━━━━━━━━━━━━━━━━━━`);
    if (order.totalAmount > 0) {
        lines.push(`💰 *إجمالي الفاتورة التقديرية:* ${order.totalAmount.toLocaleString()} ل.س`);
    } else {
        lines.push(`💰 *الأسعار:* تحدد رسمياً حسب فواتير الوكالة المعتمدة (السعر عند الطلب)`);
    }
    lines.push(`📌 *ملاحظة:* الأسعار النهائية تعتمد حسب فواتير الوكالة الأصلية وجدول التسليم.`);
    if (order.notes && order.notes.trim()) {
        lines.push(`📝 *ملاحظات التوصيل:* ${order.notes.trim()}`);
    }
    lines.push(`━━━━━━━━━━━━━━━━━━`);
    lines.push(`يرجى تأكيد استلام الطلبية وجدولتها مع سيارة التوزيع.`);

    return lines.join('\n');
}

export function buildWhatsAppUrl(phone: string, message: string): string {
    const cleanNumber = cleanWhatsAppNumber(phone);
    return `https://wa.me/${cleanNumber}?text=${encodeURIComponent(message)}`;
}
