const fs = require('fs');
const path = require('path');

const enPath = path.join(__dirname, '..', 'app', 'locales', 'en.json');
const arPath = path.join(__dirname, '..', 'app', 'locales', 'ar.json');

const enData = JSON.parse(fs.readFileSync(enPath, 'utf8'));
const arData = JSON.parse(fs.readFileSync(arPath, 'utf8'));

const newEnAdmin = {
    mainCategories: "Main Categories",
    manageMainCategories: "Manage your top-level store departments (e.g. Ruby Beauty, Makeup, Accessories)",
    addMainCategory: "Add Main Category",
    dashboardSubtitle: "Here's what's happening with your store today.",
    allTime: "All time",
    totalProcessed: "Total processed",
    inCatalog: "In catalog",
    activeSections: "Active sections",
    toggleActive: "Toggle active"
};

const newArAdmin = {
    mainCategories: "الأقسام الرئيسية",
    manageMainCategories: "إدارة أقسام متجرك الرئيسية (مثل روبي بيوتي، مكياج، إكسسوارات)",
    addMainCategory: "إضافة قسم رئيسي",
    dashboardSubtitle: "إليك ما يحدث في متجرك اليوم.",
    allTime: "كل الأوقات",
    totalProcessed: "إجمالي المعالجة",
    inCatalog: "في الكتالوج",
    activeSections: "الأقسام النشطة",
    toggleActive: "تفعيل / تعطيل"
};

Object.assign(enData.admin, newEnAdmin);
enData.admin.login.welcomeBack = "Welcome back";
enData.admin.login.subtitle = "Please enter your details to sign in.";

Object.assign(arData.admin, newArAdmin);
if (!arData.admin.login) arData.admin.login = {};
arData.admin.login.welcomeBack = "مرحباً بعودتك";
arData.admin.login.subtitle = "يرجى إدخال بياناتك لتسجيل الدخول.";

fs.writeFileSync(enPath, JSON.stringify(enData, null, 4));
fs.writeFileSync(arPath, JSON.stringify(arData, null, 4));

const replacements = [
    {
        file: 'app/admin/components/AdminSidebar.tsx',
        rules: [
            { regex: /label: "Main Categories"/g, replace: 'label: t("admin.mainCategories")' }
        ]
    },
    {
        file: 'app/admin/(auth)/login/page.tsx',
        rules: [
            { regex: /Welcome back/g, replace: '{t("admin.login.welcomeBack")}' },
            { regex: /Please enter your details to sign in\./g, replace: '{t("admin.login.subtitle")}' }
        ]
    },
    {
        file: 'app/admin/(dashboard)/dashboard/DashboardClient.tsx',
        rules: [
            { regex: />\s*Dashboard\s*<\/h1>/g, replace: '>{t("admin.dashboard")}</h1>' },
            { regex: />\s*Here's what's happening with your store today\.\s*<\/p>/g, replace: '>{t("admin.dashboardSubtitle")}</p>' },
            { regex: />\s*All time\s*<\/span>/g, replace: '>{t("admin.allTime")}</span>' },
            { regex: />\s*Total processed\s*<\/span>/g, replace: '>{t("admin.totalProcessed")}</span>' },
            { regex: />\s*In catalog\s*<\/span>/g, replace: '>{t("admin.inCatalog")}</span>' },
            { regex: />\s*Active sections\s*<\/span>/g, replace: '>{t("admin.activeSections")}</span>' }
        ]
    },
    {
        file: 'app/admin/(dashboard)/main-categories/MainCategoriesClient.tsx',
        rules: [
            // Add import
            { regex: /import \{ useSession \} from "@\/lib\/admin-session";/g, replace: 'import { useSession } from "@/lib/admin-session";\nimport { useLanguage } from "@/app/context/LanguageContext";' },
            // Add hook
            { regex: /const \{ data: session \} = useSession\(\);/g, replace: 'const { data: session } = useSession();\n    const { t, dir } = useLanguage();' },
            // Replacements
            { regex: /title="Main Categories"/g, replace: 'title={t("admin.mainCategories")}' },
            { regex: />\s*Main Categories\s*<\/h2>/g, replace: '>{t("admin.mainCategories")}</h2>' },
            { regex: />\s*Manage your top-level store departments \(e\.g\. Ruby Beauty, Makeup, Accessories\)\s*<\/p>/g, replace: '>{t("admin.manageMainCategories")}</p>' },
            { regex: /placeholder="Search\.\.\."/g, replace: 'placeholder={t("common.searchProducts") || t("common.search") || "Search..."}' },
            { regex: />\s*Add Main Category\s*<\/button>/g, replace: '>{t("admin.addMainCategory")}</button>' },
            { regex: /"Active" : "Draft"/g, replace: 't("admin.active") : t("admin.draft")' },
            { regex: /"No description"/g, replace: 't("admin.noDescription")' },
            { regex: />\s*Brands\s*<\/span>/g, replace: '>{t("admin.brands")}</span>' },
            { regex: />\s*Categories\s*<\/span>/g, replace: '>{t("admin.categories")}</span>' },
            { regex: />\s*Products\s*<\/span>/g, replace: '>{t("admin.products")}</span>' },
            { regex: /title="Toggle active"/g, replace: 'title={t("admin.toggleActive")}' },
            { regex: /title="Edit"/g, replace: 'title={t("admin.edit") || "Edit"}' },
            { regex: /title="Delete"/g, replace: 'title={t("admin.delete") || "Delete"}' },
            // Confirm delete alert
            { regex: /\`Are you sure you want to delete "\\\$\{mc\.name\}\"\?\`/g, replace: 't("admin.confirmDeleteMainCategory")?.replace("{name}", mc.name) || `Are you sure you want to delete "${mc.name}"?`' },
            // Toast notifications
            { regex: /toast\.success\("Main category deleted"\)/g, replace: 'toast.success(t("admin.mainCategoryDeleted") || "Deleted")' },
            { regex: /toast\.success\("Updated"\)/g, replace: 'toast.success(t("admin.mainCategoryUpdated") || "Updated")' }
        ]
    }
];

replacements.forEach(({ file, rules }) => {
    const fullPath = path.join(__dirname, '..', file);
    if (!fs.existsSync(fullPath)) {
        console.log(`Skipped missing file: ${fullPath}`);
        return;
    }
    let content = fs.readFileSync(fullPath, 'utf8');
    let modified = false;
    rules.forEach(rule => {
        const newContent = content.replace(rule.regex, rule.replace);
        if (newContent !== content) {
            content = newContent;
            modified = true;
        }
    });
    if (modified) {
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log(`Updated translations in: ${file}`);
    }
});
