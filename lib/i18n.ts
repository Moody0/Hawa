import en from '@/app/locales/en.json';
import ar from '@/app/locales/ar.json';

export async function getI18n(explicitLocale?: 'en' | 'ar') {
    const language: 'en' | 'ar' = explicitLocale === 'en' ? 'en' : 'ar';
    const translations = language === 'ar' ? ar : en;
    const dir: 'rtl' | 'ltr' = language === 'ar' ? 'rtl' : 'ltr';

    const t = (key: string): string => {
        const keys = key.split('.');
        let result: any = translations;

        for (const k of keys) {
            if (result && typeof result === 'object') {
                if (k in result) {
                    result = result[k];
                } else {
                    const foundKey = Object.keys(result).find(
                        existingKey => existingKey.toLowerCase() === k.toLowerCase()
                    );
                    if (foundKey) {
                        result = result[foundKey];
                    } else {
                        return key;
                    }
                }
            } else {
                return key;
            }
        }

        return typeof result === 'string' ? result : key;
    };

    return { t, dir, language };
}
