
"use client";

import type { Product } from '@/types/product';
import React, { createContext, ReactNode, useEffect } from 'react';

export type CartItem = {
  product: Product;
  quantity: number;
  note?: string; // Added note field
};

type CartState = {
  items: CartItem[];
  addToCart: (product: Product, quantity: number, note?: string) => void; // Updated signature: quantity is now required
  updateQuantity: (productId: string, newQuantity: number, itemNote?: string) => void; // Added itemNote to identify specific item
  removeFromCart: (productId: string, itemNote?: string) => void; // Added itemNote
  clearCart: () => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;
};

const defaultCartState: CartState = {
  items: [],
  addToCart: () => {},
  updateQuantity: () => {},
  removeFromCart: () => {},
  clearCart: () => {},
  getTotalItems: () => 0,
  getTotalPrice: () => 0,
};

export const CartContext = createContext<CartState>(defaultCartState);

type CartProviderProps = {
  children: ReactNode;
};

const CART_STORAGE_KEY = 'beyou_cart';

export const CartProvider: React.FC<CartProviderProps> = ({ children }) => {
  const [cartItems, setCartItems] = React.useState<CartItem[]>([]);
  const [isInitialized, setIsInitialized] = React.useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedCart = localStorage.getItem(CART_STORAGE_KEY);
      if (storedCart) {
        try {
           setCartItems(JSON.parse(storedCart));
        } catch (error) {
            console.error("Failed to parse cart from localStorage", error);
            localStorage.removeItem(CART_STORAGE_KEY);
        }
      }
      setIsInitialized(true);
    }
  }, []);

  useEffect(() => {
    if (isInitialized && typeof window !== 'undefined') {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems));
    }
  }, [cartItems, isInitialized]);

  const addToCart = (product: Product, quantity: number, note = '') => {
    setCartItems((prevItems) => {
      const normalizedNote = note || ''; // Ensure note is a string for comparison
      const existingItemIndex = prevItems.findIndex(
        (item) => item.product.id === product.id && (item.note || '') === normalizedNote
      );

      if (existingItemIndex > -1) {
        const updatedItems = [...prevItems];
        updatedItems[existingItemIndex].quantity += quantity;
        return updatedItems;
      } else {
        return [...prevItems, { product, quantity, note: normalizedNote }];
      }
    });
  };

  const updateQuantity = (productId: string, newQuantity: number, itemNote?: string) => {
    const normalizedItemNote = itemNote || '';
    setCartItems((prevItems) => {
       const updatedItems = prevItems.map((item) =>
         item.product.id === productId && (item.note || '') === normalizedItemNote
           ? { ...item, quantity: Math.max(0, newQuantity) } // Ensure quantity is not negative
           : item
       );
       return updatedItems.filter(item => item.quantity > 0); // Remove if quantity is 0
    });
  };

  const removeFromCart = (productId: string, itemNote?: string) => {
    const normalizedItemNote = itemNote || '';
    setCartItems((prevItems) =>
      prevItems.filter(
        (item) => !(item.product.id === productId && (item.note || '') === normalizedItemNote)
      )
    );
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const getTotalItems = () => {
     return cartItems.reduce((total, item) => total + item.quantity, 0);
  };

  const getTotalPrice = () => {
    return cartItems.reduce(
      (total, item) => total + item.product.price * item.quantity,
      0
    );
  };

  const contextValue: CartState = {
    items: cartItems,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    getTotalItems,
    getTotalPrice,
  };

  return (
    <CartContext.Provider value={contextValue}>
      {children}
    </CartContext.Provider>
  );
};
