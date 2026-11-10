# Hawa Distribution & Trading — Architectural Design System (`DESIGN.md`)

This document codifies the visual, typographic, and structural design system established across the **Home Page** and **Product Details Page** of **Hawa Distribution & Trading (`حوا للتوزيع والتجارة`)**. Every remaining storefront page (`/products`, `/brands`, `/categories/[slug]`, `/about-us`, `/shipping-returns`, `/blog`, `/contact`, `/cart`, `/place-order`, `/account/*`) must strictly follow these rules.

---

## 1. Core Anti-Slop Principles (Non-Negotiable)

1. **No AI-Slop Eyebrow Badges or Dot Pills**:
   - Never use small uppercase pill badges with colored dots (`<span class="h-1.5 w-1.5 rounded-full bg-current" />`) or shield/layer icon pills above section headings.
   - Where metadata precedes a title (e.g., on the Product Page), use a clean typographic link line separated by a middle dot (`وكالة روكافيرا المعتمدة · عناية بالجسم والشعر`).
2. **No Box-Inside-Box / Shadow-Next-to-Shadow Clutter**:
   - Never place two floating drop-shadowed cards side-by-side on a white background, and never nest bordered sub-cards inside a bordered parent card.
   - Use **unboxed editorial columns** paired with a single framed stage, **connected architectural tracks** (`border border-[#0B192C]/[0.09] rounded-[18px] overflow-hidden` with `border-e` cell dividers), or **asymmetric Bento stages** (1 Royal Navy flagship stage + 2×2 clean white companion cells).
3. **No Button Glows, Gradients, or Neon Pastel Boxes**:
   - Buttons must be **flat, crisp, and decisive**—zero `box-shadow` glow effects.
   - Never use pastel green (`bg-emerald-50 border-emerald-500`) WhatsApp bars or neon-green WhatsApp icons inside buttons. Use clean editorial links with a directional gold underline sweep (`استفسر عن تسعير الجملة عبر واتساب ↗`).
4. **No Decorative Dividers or Flanking Bars Around Titles**:
   - Do not add short horizontal gold bars under centered titles or flanking gold lines (`—— عنوان القسم ——`) on either side of headings. Let typography, scale, and two-tone color contrast carry the hierarchy.
5. **No Redundant Copy**:
   - Never repeat the product or section title inside an accordion or subtitle. Replace generic accordions with structured **2×2 Specification Ledgers** (`border-b border-[#0B192C]/[0.09]`).

---

## 2. Color Palette & Surface Architecture

### 2.1 Core Brand & Surface Tokens
| Token / Role | Hex / Tailwind | Usage |
| :--- | :--- | :--- |
| **Royal Navy (Header / Stage)** | `#0F2138` / `#0B192C` | Monolithic Header (`118px`), Partner Pride Signature Stage, Flagship Service Stage, Primary Dark Pills |
| **Royal Navy Elevated** | `#162E4D` | Hover state for dark navy capsules and secondary stages |
| **Warm Ivory Studio Ground** | `#FAF7F0` | Alternating homepage bands, Product Gallery Studio Stage, Connected Track hover surface |
| **Pure White Surface** | `#FFFFFF` | Primary page canvas, Connected Track cells, Companion Bento cards |
| **Heritage Gold (Flat CTA)** | `#C59329` (Hover: `#D4A134`) | Signature flat capsule primary buttons (`حساب تجاري`, `تصفح المنتجات ←`, `إضافة للطلبية ←`) with `#0B192C` text |
| **Editorial Gold (Light BG Text)** | `#8A6305` | Two-tone headline accents on light backgrounds (`بالنجاح والتوزيع`), brand links, active borders |
| **Luminous Gold (Dark BG Text)** | `#E5B54A` | Two-tone headline accents on `#0F2138` dark stages (`شركة بيتنجانة إخوان`), underline sweeps on dark surfaces |
| **Architectural Hairline** | `rgba(11, 25, 44, 0.09)` (`border-[#0B192C]/[0.09]`) | All card borders, connected track dividers, and specification ledger lines |

---

## 3. Typography System

### 3.1 Font Pairing (`app/layout.tsx` & `app/globals.css`)
- **Arabic Primary (`--font-arabic`)**: **`IBM Plex Sans Arabic`** (`weights: 300, 400, 500, 600, 700`) — open counters, architectural stems, and high legibility across both large display headings and dense B2B catalog UI.
- **Latin & Numerals (`--font-latin`)**: **`Plus Jakarta Sans`** (`weights: 400, 500, 600, 700, 800`) — geometric precision for English text, SKUs, weights (`400 ML`), and `tabular-nums` phone numbers.
- **RTL Letter-Spacing Rule**: All `[dir="rtl"]` headings and body text enforce `letter-spacing: 0 !important` so cursive Arabic ligatures never pinch or separate.

### 3.2 Typographic Scale & Hierarchy
| Element | Classes / Specs | Pattern |
| :--- | :--- | :--- |
| **Hero Headline (`h1`)** | `text-2xl sm:text-4xl md:text-[54px] font-black text-white leading-[1.12]` | Single-color white over directional dark scrim |
| **Product Page Title (`h1`)** | `text-[24px] sm:text-[30px] lg:text-[34px] font-bold text-[#0B192C] leading-[1.22]` | Preceded by clean typographic agency/category link line |
| **Section Headline (`h2`)** | `text-[22px] sm:text-[30px] md:text-[34px] font-black text-[#0B192C] leading-[1.2]` | Optional two-tone highlight (`text-[#8A6305] dark:text-[#E5B54A]`), zero eyebrow pills |
| **Subsection / Related (`h2`)** | `text-[20px] sm:text-[24px] font-bold text-[#0B192C]` | Clean start-aligned heading paired with end-aligned desktop capsule controller |
| **Body / Subtitle (`p`)** | `text-[13px] sm:text-[15px] font-medium text-slate-600 leading-relaxed` | Concise, plain commercial copy without marketing fluff |

---

## 4. Signature Interactive Components & Micro-Animations

### 4.1 Signature Flat Gold Capsule CTA
Used in the Header (`حساب تجاري`), Hero (`تصفح المنتجات ←`), Partner Pride Stage (`تصفح الأصناف ←`), and Product Page (`إضافة للطلبية ←`):
```tsx
<button className="group/cta inline-flex h-11 sm:h-[50px] items-center justify-center gap-2.5 rounded-full bg-[#C59329] hover:bg-[#D4A134] px-6 sm:px-7 text-[14px] sm:text-[14.5px] font-bold text-[#0B192C] transition-colors cursor-pointer active:translate-y-px">
  <span>إضافة للطلبية</span>
  <span className="inline-block transition-transform duration-250 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover/cta:-translate-x-1" aria-hidden="true">
    ←
  </span>
</button>
```

### 4.2 Right-to-Left Directional Underline Sweep
Used on navigation links, Partner Pride (`شركة بيتنجانة إخوان`), Hero secondary CTA (`طلب جملة عبر واتساب ↗`), and Product Page WhatsApp inquiry link:
```tsx
<span className="relative pb-1">
  {label}
  <span
    aria-hidden="true"
    className="pointer-events-none absolute inset-x-0 bottom-0 h-[1.5px] bg-[#B68012] dark:bg-[#E5B54A] scale-x-0 origin-left group-hover:origin-right group-hover:scale-x-100 transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]"
  />
</span>
```

### 4.3 Connected Architectural Scroller Track (`AgenciesSlider` & `RelatedProducts`)
- **Outer Frame**: `bg-white dark:bg-zinc-900 border border-[#0B192C]/[0.09] dark:border-white/10 rounded-[18px] overflow-hidden` (zero gap between slides, `spaceBetween={0}`).
- **Individual Cell**: Divided by `border-e border-[#0B192C]/[0.08]`, transitions background to `#FAF7F0` on hover, scales inner media slightly (`group-hover:scale-[1.04]`), and sweeps a `2.5px` bottom bar (`bg-[#0F2138] dark:bg-[#E5B54A]`) from right to left.
- **Navigation**: Desktop uses a compact pill controller (`hidden sm:inline-flex items-center gap-1 p-1 rounded-full bg-white border border-[#0B192C]/10`); mobile relies on pure touch scrolling without arrow clutter.

### 4.4 Product Page Architecture (Concept 01 Standard)
- **Top Spacer**: Header spacer is strictly `<div className="w-full h-[68px] xl:h-[118px] bg-[#0F2138]" />` with no secondary grey spacer band below it.
- **Left/Start Column (Studio Gallery Stage)**: `aspect-square lg:aspect-[6/5] rounded-[20px] bg-[#FAF7F0] border border-[#0B192C]/[0.09] overflow-hidden` with `p-0` so the product image (`w-full h-full object-contain`) fills the entire stage.
- **Right/End Column (Unboxed Editorial Dossier)**:
  1. **Typographic Eyebrow**: `وكالة {brand} المعتمدة · {category}`.
  2. **Monumental Product Title (`h1`)**.
  3. **Horizontal Wholesale Price Gate Row**: `border-y border-[#0B192C]/[0.09] py-4.5` with `تسعير الجملة المعتمد للتجار` on the start side and a Royal Navy capsule `تسجيل دخول التاجر ←` + `فتح حساب تاجر` on the end side (no blurred USD, no lock icon box, no green dot).
  4. **Capsule Stepper + Flat Gold Capsule CTA**: `h-[50px] rounded-full` stepper paired with `h-[50px] rounded-full bg-[#C59329]` primary button.
  5. **Editorial WhatsApp Link + Clickable Phone Numbers**: Editorial link (`استفسر عن تسعير الجملة عبر واتساب ↗`) paired with clickable `tel:` links (`المبيعات: 0993443901` and `الإدارة: 0994166000`).
  6. **2×2 Architectural Specification Ledger**: 4-cell grid (`العلامة التجارية`, `القسم التجاري`, `الحجم / الخيار`, `وحدة التوريد بالجملة`) separated by `1px` hairlines.
  7. **Monochrome-to-Gold Share Row (`مشاركة المنتج:`)**: Clean `w-9 h-9 rounded-full border border-[#0B192C]/12` buttons that invert to `#0B192C` background with `#E5B54A` icon on hover.
