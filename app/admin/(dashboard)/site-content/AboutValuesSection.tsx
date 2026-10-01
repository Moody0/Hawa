'use client';
export const ABOUT_VALUE_FIELDS = ['aboutValuesTitle','aboutValuesDesc','aboutValue1Title','aboutValue1Desc','aboutValue2Title','aboutValue2Desc','aboutValue3Title','aboutValue3Desc'] as const;
const labels = ['Section title', 'Section description', 'First value title', 'First value description', 'Second value title', 'Second value description', 'Third value title', 'Third value description'];
const arLabels = ['عنوان القيم','وصف القيم','عنوان القيمة الأولى','وصف القيمة الأولى','عنوان القيمة الثانية','وصف القيمة الثانية','عنوان القيمة الثالثة','وصف القيمة الثالثة'];
export default function AboutValuesSection({ value, onChange, isArabic }: { value: Record<string, string>; onChange: (value: Record<string, string>) => void; isArabic: boolean }) {
    return <div className="rounded-2xl bg-white border p-6 dark:bg-slate-900 dark:border-slate-700 space-y-5">
        <h3 className="text-xl font-bold">{isArabic ? 'قيم الشركة في صفحة من نحن' : 'About page: company values'}</h3>
        {ABOUT_VALUE_FIELDS.map((key, i) => <fieldset key={key} className="grid gap-3 sm:grid-cols-2"><legend className="font-semibold mb-2">{isArabic ? arLabels[i] : labels[i]}</legend>
            {['', 'Ar'].map(suffix => <label key={suffix} className="text-sm">{suffix ? 'العربية' : 'English'}<textarea rows={2} maxLength={5000} dir={suffix ? 'rtl' : 'ltr'} className="w-full border rounded-lg p-3 dark:bg-slate-800 dark:border-slate-700" value={value[`${key}${suffix}`] || ''} onChange={e => onChange({ ...value, [`${key}${suffix}`]: e.target.value })} /></label>)}
        </fieldset>)}
    </div>;
}
