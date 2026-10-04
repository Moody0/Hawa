import { Phone } from 'lucide-react';
import { contactPhoneDigits, formatContactPhone, type getSiteContacts } from '@/lib/website-content';

interface ManagerContactLinksProps {
    contacts: Pick<ReturnType<typeof getSiteContacts>, 'phone' | 'managementPhone'>;
    isArabic: boolean;
    className?: string;
    linkClassName?: string;
}

export default function ManagerContactLinks({ contacts, isArabic, className = '', linkClassName = 'text-slate-600 dark:text-slate-300 hover:text-[#8A6305] dark:hover:text-[#E5B54A]' }: ManagerContactLinksProps) {
    const managers = [
        { phone: contacts.phone, label: isArabic ? 'مدير المبيعات' : 'Sales Manager' },
        { phone: contacts.managementPhone, label: isArabic ? 'مدير الشركة' : 'Company Manager' },
    ];

    return (
        <div className={`flex flex-wrap items-center gap-x-4 gap-y-2 text-xs ${className}`}>
            {managers.map(({ phone, label }) => (
                <a key={label} href={`tel:+${contactPhoneDigits(phone)}`} className={`inline-flex min-h-9 flex-wrap items-center gap-1.5 rounded-sm transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 ${linkClassName}`}>
                    <Phone className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                    <span>{label}:</span>
                    <span dir="ltr" className="font-semibold tabular-nums">{formatContactPhone(phone)}</span>
                </a>
            ))}
        </div>
    );
}
