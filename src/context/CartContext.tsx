"use client";
import { createContext, useContext, useState, ReactNode } from 'react';
import { Product } from '../api/api';

interface CartItem extends Product {
  quantity: number;
  selectedVariations?: { [key: string]: string };
  finalPrice: number; // Price including variation adjustments
  uniqueId: string;   // Unique ID for cart management (id + variations)
}

interface CartContextType {
  items: CartItem[];
  addToCart: (product: Product, quantity?: number, variations?: { [key: string]: string }) => void;
  removeFromCart: (uniqueId: string) => void;
  updateQuantity: (uniqueId: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  const addToCart = (product: Product, quantity = 1, variations: { [key: string]: string } = {}) => {
    setItems(prev => {
      // Create a deterministic key for variations
      const variationKey = JSON.stringify(variations || {});

      // Calculate final price based on variations
      let finalPrice = product.price;
      if (product.variations && variations) {
        Object.entries(variations).forEach(([varName, option]) => {
          const variant = product.variations?.find(v => v.name === varName);
          if (variant && variant.priceAdjustments[option]) {
            finalPrice += variant.priceAdjustments[option];
          }
        });
      }

      const existingRequestUniqueId = `${product.id}-${variationKey}`;
      const existing = prev.find(item => item.uniqueId === existingRequestUniqueId);

      if (existing) {
        return prev.map(item =>
          item.uniqueId === existingRequestUniqueId
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }

      return [...prev, {
        ...product,
        quantity,
        selectedVariations: variations,
        finalPrice,
        uniqueId: existingRequestUniqueId
      }];
    });
  };

  const removeFromCart = (uniqueId: string) => {
    setItems(prev => prev.filter(item => item.uniqueId !== uniqueId));
  };

  const updateQuantity = (uniqueId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(uniqueId);
      return;
    }
    setItems(prev =>
      prev.map(item =>
        item.uniqueId === uniqueId ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => setItems([]);

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = items.reduce((sum, item) => sum + item.finalPrice * item.quantity, 0);

  return (
    <CartContext.Provider value={{
      items,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      totalItems,
      totalPrice
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
