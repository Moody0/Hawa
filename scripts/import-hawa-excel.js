const { PrismaClient } = require('@prisma/client');
const xlsx = require('xlsx');
const bcrypt = require('bcryptjs');
const slugify = require('slugify');

const prisma = new PrismaClient();
const excelPath = "C:\\Users\\moham\\Downloads\\شركة حوا.xlsx";

const brandSlugMap = {
  'زوان': 'zwan',
  'حليبنا': 'haleebna',
  'صن بل': 'sunbell',
  'سيلفر فيش': 'silver-fish',
  'المغربي': 'almaghrabi',
  'الريف': 'alreef',
  'روكافيرا': 'rocavera',
  'بوفالو': 'buffalo'
};

const brandDescMap = {
  'زوان': 'أجود أنواع اللحوم المعلبة واللانشون الفاخر',
  'حليبنا': 'منتجات الحليب ومشتقات الألبان عالية الجودة',
  'صن بل': 'تونة ومعلبات بحرية ممتازة',
  'سيلفر فيش': 'أفضل المنتجات البحرية والأسماك المعلبة',
  'المغربي': 'بقوليات ومواد غذائية أساسية منتقاة بعناية',
  'الريف': 'زيوت وسمن ومواد غذائية بجودة استثنائية',
  'روكافيرا': 'منظفات ومطهرات ومعقمات منزلية وصناعية عالية الفعالية',
  'بوفالو': 'منتجات استهلاكية ومواد نظافة فاخرة ومتطورة'
};

const mainCatSlugMap = {
  'غذائيات': { slug: 'food', nameAr: 'غذائيات', nameEn: 'Foodstuffs', order: 1, image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=800' },
  'منظفات': { slug: 'detergents', nameAr: 'منظفات', nameEn: 'Detergents & Cleaning', order: 2, image: 'https://images.unsplash.com/photo-1583947215259-38e31be8751f?w=800' }
};

function makeSafeSlug(text, defaultSlug) {
  if (!text) return defaultSlug || 'item';
  const clean = slugify(text, { lower: true, strict: true });
  if (clean && clean.length > 1) return clean;
  const hash = Buffer.from(text).toString('hex').slice(0, 8);
  return (defaultSlug || 'item') + '-' + hash;
}

async function main() {
  console.log('--- Starting Hawa Data Import ---');

  // 1. Ensure Default Admin
  console.log('1. Seeding Admin User...');
  const existingAdmin = await prisma.user.findUnique({ where: { username: 'admin' } });
  if (!existingAdmin) {
    const hashedPassword = await bcrypt.hash('admin123', 10);
    await prisma.user.create({
      data: {
        username: 'admin',
        password: hashedPassword,
        role: 'SUPER_ADMIN',
        canManageBrands: true,
        canDeleteBrands: true,
        canManageProducts: true,
        canDeleteProducts: true,
        canManageCategories: true,
        canDeleteCategories: true,
        canManageBanners: true,
        canDeleteBanners: true,
        canManageOrders: true,
        canDeleteOrders: true,
        canManagePromoCodes: true,
        canDeletePromoCodes: true,
        canManageReviews: true
      }
    });
    console.log('   Created default admin user: admin / admin123');
  } else {
    console.log('   Admin user already exists.');
  }

  // 2. Ensure Settings
  console.log('2. Seeding Settings...');
  await prisma.settings.upsert({
    where: { id: 'site-settings' },
    update: {
      footerBrandTitle: 'Hawa Distribution',
      footerBrandTitleAr: 'حوا للتوزيع والتجارة',
      footerBrandDescription: 'Your trusted partner in wholesale food and consumer goods distribution.',
      footerBrandDescriptionAr: 'شريككم الموثوق لتوزيع البضائع والمواد الغذائية والاستهلاكية من أفضل الشركات العالمية.',
      footerCopyright: '© 2026 Hawa Distribution & Trading. All rights reserved.',
      footerCopyrightAr: '© 2026 شركة حوا للتوزيع والتجارة. جميع الحقوق محفوظة.',
      whatsappNumber: '+963900000000',
      shippingTitleAr: 'توزيع سريع وموثوق للمحلات',
      finalSaleTitleAr: 'شروط التوزيع والتسليم بالجملة',
      finalSaleDescAr: 'يتم تسليم البضائع بالطرود والكراتين الأصلية المطابقة للمواصفات القياسية.'
    },
    create: {
      id: 'site-settings',
      footerBrandTitle: 'Hawa Distribution',
      footerBrandTitleAr: 'حوا للتوزيع والتجارة',
      footerBrandDescription: 'Your trusted partner in wholesale food and consumer goods distribution.',
      footerBrandDescriptionAr: 'شريككم الموثوق لتوزيع البضائع والمواد الغذائية والاستهلاكية من أفضل الشركات العالمية.',
      footerCopyright: '© 2026 Hawa Distribution & Trading. All rights reserved.',
      footerCopyrightAr: '© 2026 شركة حوا للتوزيع والتجارة. جميع الحقوق محفوظة.',
      whatsappNumber: '+963900000000',
      shippingTitleAr: 'توزيع سريع وموثوق للمحلات',
      finalSaleTitleAr: 'شروط التوزيع والتسليم بالجملة',
      finalSaleDescAr: 'يتم تسليم البضائع بالطرود والكراتين الأصلية المطابقة للمواصفات القياسية.'
    }
  });

  // 3. Ensure Initial Banners
  console.log('3. Seeding Banners...');
  const bannerCount = await prisma.banner.count();
  if (bannerCount === 0) {
    await prisma.banner.createMany({
      data: [
        {
          title: 'Hawa Distribution & Trading',
          titleAr: 'شركة حوا للتوزيع والتجارة',
          subtitle: 'Your trusted wholesale partner connecting premium agencies with retail stores.',
          subtitleAr: 'نوفر أفضل العلامات التجارية ونقدم حلول توزيع متكاملة تغطي الأسواق والمتاجر',
          image: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=1600',
          buttonText: 'Explore Catalog',
          buttonTextAr: 'تصفح المنتجات',
          link: '/products',
          badge: 'B2B Wholesale',
          badgeAr: 'توزيع جملة معتمد',
          isActive: true
        },
        {
          title: 'Direct Wholesale Agencies',
          titleAr: 'وكالات تجارية موثوقة',
          subtitle: 'All your agency products in a single scheduled order.',
          subtitleAr: 'كل منتجات وكالاتك… بطلب واحد وبأفضل شروط التوزيع',
          image: 'https://images.unsplash.com/photo-1578575437130-527eed3abbec?w=1600',
          buttonText: 'View Agencies',
          buttonTextAr: 'اكتشف وكالاتنا',
          link: '/brands',
          badge: 'Exclusive Distribution',
          badgeAr: 'وكالات حصرية',
          isActive: true
        }
      ]
    });
    console.log('   Created 2 initial Hawa B2B banners.');
  }

  // 4. Read Excel File
  console.log('4. Reading Excel Catalog from:', excelPath);
  const workbook = xlsx.readFile(excelPath);
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const rows = xlsx.utils.sheet_to_json(sheet);
  console.log(`   Found ${rows.length} product rows in Excel.`);

  // 5. Create Main Categories
  console.log('5. Upserting Main Categories...');
  const mainCatMap = {};
  for (const [name, meta] of Object.entries(mainCatSlugMap)) {
    const mc = await prisma.mainCategory.upsert({
      where: { slug: meta.slug },
      update: {
        name: name,
        description: meta.nameEn,
        image: meta.image,
        isActive: true,
        showInNav: true,
        navOrder: meta.order,
        isFeatured: true
      },
      create: {
        name: name,
        slug: meta.slug,
        description: meta.nameEn,
        image: meta.image,
        isActive: true,
        showInNav: true,
        navOrder: meta.order,
        isFeatured: true
      }
    });
    mainCatMap[name] = mc;
    console.log(`   Main Category: ${name} -> ${mc.slug}`);
  }

  // 6. Create Brands
  console.log('6. Upserting Brands...');
  const brandMap = {};
  for (const row of rows) {
    const rawBrand = row['اسم الماركة'] ? String(row['اسم الماركة']).trim() : null;
    if (!rawBrand || brandMap[rawBrand]) continue;

    const slug = brandSlugMap[rawBrand] || makeSafeSlug(rawBrand, 'brand');
    const desc = brandDescMap[rawBrand] || `وكالة منتجات ${rawBrand}`;
    const mainCatName = row['القسم الرئيسي'] ? String(row['القسم الرئيسي']).trim() : 'غذائيات';
    const mc = mainCatMap[mainCatName] || mainCatMap['غذائيات'];

    const brand = await prisma.brand.upsert({
      where: { slug: slug },
      update: {
        name: rawBrand,
        description: desc,
        mainCategoryId: mc ? mc.id : null,
        group: 'MAIN',
        isFeatured: true,
        isActive: true
      },
      create: {
        name: rawBrand,
        slug: slug,
        description: desc,
        mainCategoryId: mc ? mc.id : null,
        group: 'MAIN',
        isFeatured: true,
        isActive: true
      }
    });
    brandMap[rawBrand] = brand;
    console.log(`   Brand: ${rawBrand} -> ${brand.slug}`);
  }

  // 7. Create Categories and Products
  console.log('7. Importing Categories & Products...');
  let importedCount = 0;
  let skippedCount = 0;

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const mainCatName = row['القسم الرئيسي'] ? String(row['القسم الرئيسي']).trim() : 'غذائيات';
    const subCatName = row['القسم الفرعي'] ? String(row['القسم الفرعي']).trim() : 'عام';
    const brandName = row['اسم الماركة'] ? String(row['اسم الماركة']).trim() : null;
    const nameAr = row['اسم المنتج بالعربي'] ? String(row['اسم المنتج بالعربي']).trim() : null;
    const nameEn = row['اسم المنتج بالإنجليزي'] ? String(row['اسم المنتج بالإنجليزي']).trim() : null;
    const descAr = row['وصف المنتج بالعربي'] ? String(row['وصف المنتج بالعربي']).trim() : null;
    const descEn = row['وصف المنتج بالإنجليزي'] ? String(row['وصف المنتج بالإنجليزي']).trim() : null;
    const priceVal = parseFloat(row['السعر']) || 0;
    const optionsVal = row['الخيارات'] ? String(row['الخيارات']).trim() : null;
    const imageUrl = row['رابط صورة المنتج'] ? String(row['رابط صورة المنتج']).trim() : '';

    if (!nameAr || !brandName) {
      skippedCount++;
      continue;
    }

    const brand = brandMap[brandName];
    const mc = mainCatMap[mainCatName] || mainCatMap['غذائيات'];

    // Category unique per brand
    const catSlugBase = (brand.slug + '-' + makeSafeSlug(subCatName, 'cat')).toLowerCase();
    let category = await prisma.category.findFirst({
      where: {
        name: subCatName,
        brandId: brand.id
      }
    });

    if (!category) {
      let uniqueCatSlug = catSlugBase;
      let counter = 1;
      while (await prisma.category.findUnique({ where: { slug: uniqueCatSlug } })) {
        uniqueCatSlug = `${catSlugBase}-${counter}`;
        counter++;
      }
      category = await prisma.category.create({
        data: {
          name: subCatName,
          slug: uniqueCatSlug,
          brandId: brand.id,
          mainCategoryId: mc ? mc.id : null,
          isFeatured: true
        }
      });
    }

    // Product Slug
    const prodEnglishBase = nameEn ? slugify(nameEn, { lower: true, strict: true }) : '';
    const safeProdSlugBase = (prodEnglishBase && prodEnglishBase.length > 2)
      ? prodEnglishBase
      : `hawa-${brand.slug}-${i + 1}`;

    let uniqueProdSlug = safeProdSlugBase;
    let prodCounter = 1;
    while (await prisma.product.findUnique({ where: { slug: uniqueProdSlug } })) {
      uniqueProdSlug = `${safeProdSlugBase}-${prodCounter}`;
      prodCounter++;
    }

    await prisma.product.create({
      data: {
        name: nameAr,
        nameAr: nameAr,
        nameEn: nameEn || nameAr,
        slug: uniqueProdSlug,
        description: descAr || descEn,
        descriptionAr: descAr,
        descriptionEn: descEn,
        price: priceVal,
        images: imageUrl || 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=800',
        stock: 50,
        options: optionsVal,
        packaging: 'طرد',
        itemsPerPackage: 'حسب مواصفات المصنع',
        minOrder: 1,
        categoryId: category.id,
        brandId: brand.id,
        mainCategoryId: mc ? mc.id : null,
        isTrending: i < 12
      }
    });

    importedCount++;
  }

  console.log(`✅ Successfully imported ${importedCount} products. Skipped: ${skippedCount}.`);
}

main()
  .catch((e) => {
    console.error('Error during Hawa data import:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
