import { describe, it, expect } from "vitest";
import { reconcileCategoriesWithBrands, FilterBrand, FilterCategory } from "@/app/components/ProductsPageComponents/ProductsSidebarFilter";

describe("Department and Catalog Brand/Category Isolation", () => {
    const mockBrands: FilterBrand[] = [
        {
            id: "brand-bufalo",
            name: "Bufalo",
            slug: "bufalo",
            mainCategoryId: "dept-detergents",
            mainCategory: { id: "dept-detergents", name: "منظفات", slug: "detergents" },
            categories: [
                { id: "cat-soap", name: "صابون", slug: "buffalo-soap", mainCategoryId: "dept-detergents" },
                { id: "cat-dish", name: "جلي", slug: "buffalo-dish", mainCategoryId: "dept-detergents" },
            ],
        },
        {
            id: "brand-alreef",
            name: "الريف",
            slug: "alreef",
            mainCategoryId: "dept-food",
            mainCategory: { id: "dept-food", name: "غذائيات", slug: "food" },
            categories: [
                { id: "cat-oil", name: "سمن وزيت", slug: "alreef-oil", mainCategoryId: "dept-food" },
                { id: "cat-legumes", name: "بقوليات", slug: "alreef-legumes", mainCategoryId: "dept-food" },
            ],
        },
    ];

    it("scopes brands strictly to department when department is active", () => {
        const activeDepartmentId = "dept-detergents";
        const scopedBrands = mockBrands.filter(
            (b) =>
                !b.mainCategoryId ||
                b.mainCategoryId === activeDepartmentId ||
                b.mainCategory?.id === activeDepartmentId ||
                (b.categories && b.categories.some((c) => c.mainCategoryId === activeDepartmentId))
        );

        expect(scopedBrands.length).toBe(1);
        expect(scopedBrands[0].id).toBe("brand-bufalo");
        expect(scopedBrands[0].slug).toBe("bufalo");
        expect(scopedBrands.find((b) => b.id === "brand-alreef")).toBeUndefined();
    });

    it("reconciles category selections correctly when brand is selected", () => {
        const currentCategories: FilterCategory[] = [
            { id: "cat-soap", name: "صابون", slug: "buffalo-soap" },
            { id: "cat-oil", name: "سمن وزيت", slug: "alreef-oil" },
        ];

        // If Bufalo is selected, food category (cat-oil) should be dropped
        const reconciled = reconcileCategoriesWithBrands(
            ["cat-soap", "cat-oil"],
            ["brand-bufalo"],
            mockBrands,
            currentCategories
        );

        expect(reconciled).toEqual(["cat-soap"]);
        expect(reconciled).not.toContain("cat-oil");
    });

    it("prevents cross-department category leakage", () => {
        const detergentBrands = mockBrands.filter((b) => b.mainCategoryId === "dept-detergents");
        const allDetergentCategoryIds = detergentBrands.flatMap((b) => b.categories?.map((c) => c.id) || []);

        expect(allDetergentCategoryIds).toContain("cat-soap");
        expect(allDetergentCategoryIds).toContain("cat-dish");
        expect(allDetergentCategoryIds).not.toContain("cat-oil");
        expect(allDetergentCategoryIds).not.toContain("cat-legumes");
    });
});
