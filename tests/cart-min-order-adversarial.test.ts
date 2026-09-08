import { describe, expect, it } from 'vitest';
import { normalizeCartItem, clampCartQuantity, CartItem } from '@/app/context/CartContext';

// Helper simulating CartContext state transitions
class CartStateHarness {
  private items: CartItem[] = [];

  private getItemKey(item: { id: string; selectedOption?: string | null }): string {
    return `${item.id}:${(item.selectedOption || '').trim()}`;
  }

  getItems(): CartItem[] {
    return [...this.items];
  }

  getItem(id: string, selectedOption?: string): CartItem | undefined {
    const targetKey = `${id}:${(selectedOption || '').trim()}`;
    return this.items.find(i => this.getItemKey(i) === targetKey);
  }

  addItem(newItem: CartItem): void {
    const normalizedItem = normalizeCartItem(newItem);
    const targetKey = this.getItemKey(normalizedItem);
    const existing = this.items.find(item => this.getItemKey(item) === targetKey);

    if (existing) {
      this.items = this.items.map(item =>
        this.getItemKey(item) === targetKey
          ? { ...item, quantity: item.quantity + normalizedItem.quantity }
          : item
      );
    } else {
      this.items = [...this.items, normalizedItem];
    }
  }

  removeItem(id: string, selectedOption?: string): void {
    const targetKey = `${id}:${(selectedOption || '').trim()}`;
    this.items = this.items.filter(item => {
      if (selectedOption !== undefined) {
        return this.getItemKey(item) !== targetKey;
      }
      return item.id !== id;
    });
  }

  updateQuantity(id: string, quantity: number, selectedOption?: string): void {
    if (quantity <= 0) {
      this.removeItem(id, selectedOption);
      return;
    }
    const targetKey = `${id}:${(selectedOption || '').trim()}`;
    this.items = this.items.map(item => {
      const matches = selectedOption !== undefined
        ? this.getItemKey(item) === targetKey
        : item.id === id;
      if (!matches) return item;
      const clampedQty = clampCartQuantity(quantity, item.minOrder);
      return { ...item, quantity: clampedQty };
    });
  }

  // Simulate Card / Row stepper minus
  handleCardDecrease(productId: string, minOrder?: number | null): void {
    const item = this.items.find(i => i.id === productId);
    if (!item) return;
    const minQty = Math.max(1, Number(minOrder ?? item.minOrder) || 1);
    if (item.quantity <= minQty) {
      this.removeItem(productId);
    } else {
      this.updateQuantity(productId, item.quantity - 1);
    }
  }

  // Simulate Card / Row stepper plus
  handleCardIncrease(productId: string): void {
    const item = this.items.find(i => i.id === productId);
    if (!item) return;
    this.updateQuantity(productId, item.quantity + 1);
  }
}

describe('Cart minOrder Adversarial Test Suite (Challenger 1)', () => {
  describe('1. Boundary Conditions & Edge Cases for minOrder', () => {
    const testCases: Array<{
      desc: string;
      minOrder: any;
      expectedMinOrder: number;
    }> = [
      { desc: 'minOrder = undefined', minOrder: undefined, expectedMinOrder: 1 },
      { desc: 'minOrder = null', minOrder: null, expectedMinOrder: 1 },
      { desc: 'minOrder = 0', minOrder: 0, expectedMinOrder: 1 },
      { desc: 'minOrder = 1', minOrder: 1, expectedMinOrder: 1 },
      { desc: 'minOrder = 5', minOrder: 5, expectedMinOrder: 5 },
      { desc: 'minOrder = 50', minOrder: 50, expectedMinOrder: 50 },
      { desc: 'minOrder = 999', minOrder: 999, expectedMinOrder: 999 },
      { desc: 'minOrder = negative (-5)', minOrder: -5, expectedMinOrder: 1 },
      { desc: 'minOrder = negative (-100)', minOrder: -100, expectedMinOrder: 1 },
      { desc: 'minOrder = string numeric ("15")', minOrder: '15', expectedMinOrder: 15 },
      { desc: 'minOrder = string non-numeric ("abc")', minOrder: 'abc', expectedMinOrder: 1 },
      { desc: 'minOrder = NaN', minOrder: NaN, expectedMinOrder: 1 },
    ];

    testCases.forEach(({ desc, minOrder, expectedMinOrder }) => {
      it(`normalizeCartItem handles ${desc} correctly`, () => {
        const item: CartItem = {
          id: 'test-id',
          name: 'Test Product',
          price: 50,
          image: '/img.png',
          slug: 'test-product',
          quantity: 1,
          minOrder,
        };

        const normalized = normalizeCartItem(item);
        expect(normalized.minOrder).toBe(expectedMinOrder);
        expect(normalized.quantity).toBe(expectedMinOrder);
      });

      it(`clampCartQuantity handles ${desc} correctly when below threshold`, () => {
        const clamped0 = clampCartQuantity(0, minOrder);
        expect(clamped0).toBe(expectedMinOrder);

        if (expectedMinOrder > 1) {
          const clampedBelow = clampCartQuantity(expectedMinOrder - 1, minOrder);
          expect(clampedBelow).toBe(expectedMinOrder);
        }

        const clampedEqual = clampCartQuantity(expectedMinOrder, minOrder);
        expect(clampedEqual).toBe(expectedMinOrder);

        const clampedAbove = clampCartQuantity(expectedMinOrder + 5, minOrder);
        expect(clampedAbove).toBe(expectedMinOrder + 5);
      });
    });
  });

  describe('2. Initial Quantity Logic Across Entry Points', () => {
    it('ProductCard initial add sets quantity to max(1, minOrder)', () => {
      const minOrders = [undefined, null, 0, 1, 5, 50, 999];
      minOrders.forEach(mo => {
        const minQuantity = Math.max(1, Number(mo) || 1);
        const itemToAdd: CartItem = {
          id: `prod-${mo}`,
          name: 'Product Card Test',
          price: 100,
          image: '/test.jpg',
          slug: `prod-${mo}`,
          quantity: minQuantity,
          minOrder: minQuantity,
        };
        const normalized = normalizeCartItem(itemToAdd);
        expect(normalized.quantity).toBe(minQuantity);
        expect(normalized.quantity).toBeGreaterThanOrEqual(1);
      });
    });

    it('WholesaleProductRow initial add sets quantity to max(1, minOrder)', () => {
      const minOrders = [undefined, null, 0, 1, 5, 50, 999];
      minOrders.forEach(mo => {
        const minQuantity = Math.max(1, Number(mo) || 1);
        const itemToAdd: CartItem = {
          id: `row-${mo}`,
          name: 'Wholesale Row Test',
          price: 80,
          image: '/test.jpg',
          slug: `row-${mo}`,
          quantity: minQuantity,
          selectedOption: 'Default Option',
          minOrder: minQuantity,
        };
        const normalized = normalizeCartItem(itemToAdd);
        expect(normalized.quantity).toBe(minQuantity);
        expect(normalized.minOrder).toBe(minQuantity);
      });
    });

    it('QuickViewModal initial quantity defaults to max(1, minOrder) and prevents decrement below it', () => {
      const testCases = [
        { minOrder: undefined, expected: 1 },
        { minOrder: null, expected: 1 },
        { minOrder: 0, expected: 1 },
        { minOrder: 1, expected: 1 },
        { minOrder: 7, expected: 7 },
        { minOrder: 50, expected: 50 },
      ];

      testCases.forEach(({ minOrder, expected }) => {
        const minQuantity = Math.max(1, Number(minOrder) || 1);
        let modalQuantity = minQuantity;

        expect(modalQuantity).toBe(expected);

        const decrementAction = () => {
          if (modalQuantity > minQuantity) {
            modalQuantity -= 1;
          }
        };

        decrementAction();
        expect(modalQuantity).toBe(expected);

        modalQuantity += 3;
        expect(modalQuantity).toBe(expected + 3);

        modalQuantity = Math.max(minQuantity, modalQuantity - 1);
        expect(modalQuantity).toBe(expected + 2);

        modalQuantity = Math.max(minQuantity, modalQuantity - 2);
        expect(modalQuantity).toBe(expected);

        modalQuantity = Math.max(minQuantity, modalQuantity - 1);
        expect(modalQuantity).toBe(expected);
      });
    });

    it('CartContext normalizeCartItem overrides invalid initial quantity (e.g. 1 when minOrder is 5)', () => {
      const rawItem: CartItem = {
        id: 'bad-qty',
        name: 'Bad Qty Item',
        price: 50,
        image: '/img.png',
        slug: 'bad-qty',
        quantity: 1,
        minOrder: 5,
      };

      const normalized = normalizeCartItem(rawItem);
      expect(normalized.quantity).toBe(5);
    });

    it('CartContext normalizeCartItem respects quantity if caller explicitly requested more than minOrder', () => {
      const rawItem: CartItem = {
        id: 'higher-qty',
        name: 'Higher Qty Item',
        price: 50,
        image: '/img.png',
        slug: 'higher-qty',
        quantity: 12,
        minOrder: 5,
      };

      const normalized = normalizeCartItem(rawItem);
      expect(normalized.quantity).toBe(12);
    });
  });

  describe('3. Stepper Decrement Behavior: Cards/Rows vs CartItem/CartDrawer', () => {
    it('clicking minus on ProductCard/WholesaleRow at minOrder removes item completely (minOrder = 5)', () => {
      const cart = new CartStateHarness();
      cart.addItem({
        id: 'prod-mo5',
        name: 'MOQ 5 Product',
        price: 100,
        image: '/img.png',
        slug: 'moq-5',
        quantity: 5,
        minOrder: 5,
      });

      expect(cart.getItems()).toHaveLength(1);
      expect(cart.getItem('prod-mo5')?.quantity).toBe(5);

      cart.handleCardDecrease('prod-mo5', 5);

      expect(cart.getItems()).toHaveLength(0);
      expect(cart.getItem('prod-mo5')).toBeUndefined();
    });

    it('clicking minus on ProductCard when quantity > minOrder decrements normally until minOrder', () => {
      const cart = new CartStateHarness();
      cart.addItem({
        id: 'prod-mo5-step',
        name: 'MOQ 5 Stepper Product',
        price: 100,
        image: '/img.png',
        slug: 'moq-5-step',
        quantity: 7,
        minOrder: 5,
      });

      cart.handleCardDecrease('prod-mo5-step', 5);
      expect(cart.getItem('prod-mo5-step')?.quantity).toBe(6);

      cart.handleCardDecrease('prod-mo5-step', 5);
      expect(cart.getItem('prod-mo5-step')?.quantity).toBe(5);

      cart.handleCardDecrease('prod-mo5-step', 5);
      expect(cart.getItem('prod-mo5-step')).toBeUndefined();
      expect(cart.getItems()).toHaveLength(0);
    });

    it('clicking minus on ProductCard when minOrder = 1 removes item when at 1', () => {
      const cart = new CartStateHarness();
      cart.addItem({
        id: 'prod-mo1',
        name: 'MOQ 1 Product',
        price: 25,
        image: '/img.png',
        slug: 'moq-1',
        quantity: 2,
        minOrder: 1,
      });

      cart.handleCardDecrease('prod-mo1', 1);
      expect(cart.getItem('prod-mo1')?.quantity).toBe(1);

      cart.handleCardDecrease('prod-mo1', 1);
      expect(cart.getItems()).toHaveLength(0);
    });

    it('CartDrawer / CartItem stepper minus is DISABLED at minOrder (does not remove)', () => {
      const cart = new CartStateHarness();
      cart.addItem({
        id: 'drawer-item',
        name: 'Drawer Item',
        price: 30,
        image: '/img.png',
        slug: 'drawer-item',
        quantity: 5,
        minOrder: 5,
      });

      const item = cart.getItem('drawer-item')!;
      const minQty = Math.max(1, Number(item.minOrder) || 1);

      const cartItemMinusAction = () => {
        if (item.quantity <= minQty) return;
        cart.updateQuantity(item.id, item.quantity - 1);
      };

      cartItemMinusAction();

      expect(cart.getItems()).toHaveLength(1);
      expect(cart.getItem('drawer-item')?.quantity).toBe(5);
    });
  });

  describe('4. updateQuantity Direct Invocation: Clamping vs Rejection', () => {
    it('calling updateQuantity with quantity lower than minOrder (e.g. 3 when minOrder is 5) CLAMPS to minOrder', () => {
      const cart = new CartStateHarness();
      cart.addItem({
        id: 'clamp-test',
        name: 'Clamp Test Item',
        price: 60,
        image: '/img.png',
        slug: 'clamp-test',
        quantity: 8,
        minOrder: 5,
      });

      expect(cart.getItem('clamp-test')?.quantity).toBe(8);

      cart.updateQuantity('clamp-test', 3);

      const item = cart.getItem('clamp-test');
      expect(item).toBeDefined();
      expect(item?.quantity).toBe(5);
    });

    it('calling updateQuantity with quantity 1 when minOrder is 50 CLAMPS to 50', () => {
      const cart = new CartStateHarness();
      cart.addItem({
        id: 'bulk-item',
        name: 'Bulk Item',
        price: 10,
        image: '/img.png',
        slug: 'bulk-item',
        quantity: 60,
        minOrder: 50,
      });

      cart.updateQuantity('bulk-item', 1);
      expect(cart.getItem('bulk-item')?.quantity).toBe(50);
    });

    it('calling updateQuantity with quantity <= 0 REMOVES the item', () => {
      const cart = new CartStateHarness();
      cart.addItem({
        id: 'remove-via-update',
        name: 'Remove Via Update',
        price: 15,
        image: '/img.png',
        slug: 'remove-via-update',
        quantity: 5,
        minOrder: 5,
      });

      cart.updateQuantity('remove-via-update', 0);
      expect(cart.getItem('remove-via-update')).toBeUndefined();
      expect(cart.getItems()).toHaveLength(0);

      cart.addItem({
        id: 'remove-neg',
        name: 'Remove Negative',
        price: 15,
        image: '/img.png',
        slug: 'remove-neg',
        quantity: 5,
        minOrder: 5,
      });
      cart.updateQuantity('remove-neg', -3);
      expect(cart.getItem('remove-neg')).toBeUndefined();
      expect(cart.getItems()).toHaveLength(0);
    });

    it('calling updateQuantity with valid quantity above minOrder updates correctly', () => {
      const cart = new CartStateHarness();
      cart.addItem({
        id: 'valid-update',
        name: 'Valid Update',
        price: 20,
        image: '/img.png',
        slug: 'valid-update',
        quantity: 5,
        minOrder: 5,
      });

      cart.updateQuantity('valid-update', 15);
      expect(cart.getItem('valid-update')?.quantity).toBe(15);
    });
  });

  describe('5. Cart State Integration & Multi-item Stress Scenarios', () => {
    it('handles multiple items with different minOrders concurrently without interference', () => {
      const cart = new CartStateHarness();

      cart.addItem({ id: 'item-1', name: 'Item 1', price: 10, image: '', slug: 'i1', quantity: 1, minOrder: 1 });
      cart.addItem({ id: 'item-5', name: 'Item 5', price: 20, image: '', slug: 'i5', quantity: 5, minOrder: 5 });
      cart.addItem({ id: 'item-50', name: 'Item 50', price: 30, image: '', slug: 'i50', quantity: 50, minOrder: 50 });

      expect(cart.getItems()).toHaveLength(3);
      expect(cart.getItem('item-1')?.quantity).toBe(1);
      expect(cart.getItem('item-5')?.quantity).toBe(5);
      expect(cart.getItem('item-50')?.quantity).toBe(50);

      cart.handleCardDecrease('item-5', 5);
      expect(cart.getItem('item-5')).toBeUndefined();
      expect(cart.getItem('item-1')?.quantity).toBe(1);
      expect(cart.getItem('item-50')?.quantity).toBe(50);
      expect(cart.getItems()).toHaveLength(2);

      cart.updateQuantity('item-50', 25);
      expect(cart.getItem('item-50')?.quantity).toBe(50);

      cart.updateQuantity('item-1', 3);
      expect(cart.getItem('item-1')?.quantity).toBe(3);
    });

    it('correctly manages selectedOption variants with minOrder isolation', () => {
      const cart = new CartStateHarness();

      cart.addItem({
        id: 'multi-opt',
        name: 'Multi Option',
        price: 50,
        image: '',
        slug: 'multi-opt',
        quantity: 4,
        minOrder: 4,
        selectedOption: 'Size XL',
      });

      cart.addItem({
        id: 'multi-opt',
        name: 'Multi Option',
        price: 50,
        image: '',
        slug: 'multi-opt',
        quantity: 4,
        minOrder: 4,
        selectedOption: 'Size M',
      });

      expect(cart.getItems()).toHaveLength(2);

      cart.updateQuantity('multi-opt', 6, 'Size XL');
      expect(cart.getItem('multi-opt', 'Size XL')?.quantity).toBe(6);
      expect(cart.getItem('multi-opt', 'Size M')?.quantity).toBe(4);

      cart.updateQuantity('multi-opt', 2, 'Size M');
      expect(cart.getItem('multi-opt', 'Size M')?.quantity).toBe(4);

      cart.removeItem('multi-opt', 'Size XL');
      expect(cart.getItem('multi-opt', 'Size XL')).toBeUndefined();
      expect(cart.getItem('multi-opt', 'Size M')).toBeDefined();
    });

    it('repeated additions stack correctly based on normalized quantities', () => {
      const cart = new CartStateHarness();

      cart.addItem({
        id: 'repeat-item',
        name: 'Repeat Item',
        price: 40,
        image: '',
        slug: 'repeat-item',
        quantity: 5,
        minOrder: 5,
      });
      expect(cart.getItem('repeat-item')?.quantity).toBe(5);

      cart.addItem({
        id: 'repeat-item',
        name: 'Repeat Item',
        price: 40,
        image: '',
        slug: 'repeat-item',
        quantity: 5,
        minOrder: 5,
      });
      expect(cart.getItem('repeat-item')?.quantity).toBe(10);

      cart.addItem({
        id: 'repeat-item',
        name: 'Repeat Item',
        price: 40,
        image: '',
        slug: 'repeat-item',
        quantity: 1,
        minOrder: 5,
      });
      expect(cart.getItem('repeat-item')?.quantity).toBe(15);
    });
  });
});