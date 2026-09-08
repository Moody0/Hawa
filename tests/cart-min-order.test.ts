import { describe, expect, it } from "vitest";
import { normalizeCartItem, clampCartQuantity, CartItem } from "@/app/context/CartContext";

describe("Cart minOrder normalization and clamping", () => {
  it("initializes quantity to minOrder when quantity is less than minOrder", () => {
    const rawItem: CartItem = {
      id: "prod-1",
      name: "Product 1",
      price: 100,
      image: "/img.jpg",
      slug: "prod-1",
      quantity: 1,
      minOrder: 5,
    };

    const normalized = normalizeCartItem(rawItem);
    expect(normalized.quantity).toBe(5);
    expect(normalized.minOrder).toBe(5);
  });

  it("retains quantity when quantity is greater than minOrder", () => {
    const rawItem: CartItem = {
      id: "prod-2",
      name: "Product 2",
      price: 100,
      image: "/img.jpg",
      slug: "prod-2",
      quantity: 10,
      minOrder: 5,
    };

    const normalized = normalizeCartItem(rawItem);
    expect(normalized.quantity).toBe(10);
    expect(normalized.minOrder).toBe(5);
  });

  it("defaults minOrder and quantity to 1 when minOrder is null, 0, or negative", () => {
    const rawItemNull: CartItem = {
      id: "prod-3",
      name: "Product 3",
      price: 100,
      image: "/img.jpg",
      slug: "prod-3",
      quantity: 1,
      minOrder: null,
    };
    expect(normalizeCartItem(rawItemNull).minOrder).toBe(1);
    expect(normalizeCartItem(rawItemNull).quantity).toBe(1);

    const rawItemZero: CartItem = {
      id: "prod-4",
      name: "Product 4",
      price: 100,
      image: "/img.jpg",
      slug: "prod-4",
      quantity: 0,
      minOrder: 0,
    };
    expect(normalizeCartItem(rawItemZero).minOrder).toBe(1);
    expect(normalizeCartItem(rawItemZero).quantity).toBe(1);
  });

  it("cleans empty string options to undefined", () => {
    const rawItem: CartItem = {
      id: "prod-5",
      name: "Product 5",
      price: 50,
      image: "/img.jpg",
      slug: "prod-5",
      quantity: 2,
      minOrder: 2,
      selectedOption: "   ",
    };

    const normalized = normalizeCartItem(rawItem);
    expect(normalized.selectedOption).toBeUndefined();
  });

  it("clamps quantity to minOrder when quantity is less than minOrder", () => {
    // minOrder is 6, request to set to 3 -> clamped to 6
    expect(clampCartQuantity(3, 6)).toBe(6);
    // minOrder is 6, request to set to 6 -> 6
    expect(clampCartQuantity(6, 6)).toBe(6);
    // minOrder is 6, request to set to 8 -> 8
    expect(clampCartQuantity(8, 6)).toBe(8);
  });

  it("clamps to 1 when minOrder is null, undefined, or 0", () => {
    expect(clampCartQuantity(0, null)).toBe(1);
    expect(clampCartQuantity(0, undefined)).toBe(1);
    expect(clampCartQuantity(0, 0)).toBe(1);
    expect(clampCartQuantity(3, null)).toBe(3);
  });
});
