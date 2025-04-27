"use client";

import type { Product } from '@/types/product';
import React, { createContext, useState, ReactNode, useEffect } from 'react';

export type CartItem = {
  product: Product;
  quantity: number;
};

type CartState = {
  items: CartItem[];
  addToCart: (product: Product, quantity?: number) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  removeFromCart: (productId: string) => void;
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
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);

  // Load cart from localStorage on initial mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedCart = localStorage.getItem(CART_STORAGE_KEY);
      if (storedCart) {
        try {
           setCartItems(JSON.parse(storedCart));
        } catch (error) {
            console.error("Failed to parse cart from localStorage", error);
            localStorage.removeItem(CART_STORAGE_KEY); // Clear invalid data
        }
      }
      setIsInitialized(true); // Mark as initialized after attempting to load
    }
  }, []);

  // Save cart to localStorage whenever it changes (after initialization)
  useEffect(() => {
    if (isInitialized && typeof window !== 'undefined') {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems));
    }
  }, [cartItems, isInitialized]);

  const addToCart = (product: Product, quantity = 1) => {
    setCartItems((prevItems) => {
      const existingItemIndex = prevItems.findIndex(
        (item) => item.product.id === product.id
      );
      if (existingItemIndex > -1) {
        // Product exists, update quantity
        const updatedItems = [...prevItems];
        updatedItems[existingItemIndex].quantity += quantity;
        return updatedItems;
      } else {
        // Product doesn't exist, add new item
        return [...prevItems, { product, quantity }];
      }
    });
  };

  const updateQuantity = (productId: string, quantity: number) => {
    setCartItems((prevItems) => {
       const updatedItems = prevItems.map((item) =>
         item.product.id === productId
           ? { ...item, quantity: Math.max(0, quantity) } // Ensure quantity doesn't go below 0
           : item
       );
       // Remove item if quantity is 0
       return updatedItems.filter(item => item.quantity > 0);
    });
  };


  const removeFromCart = (productId: string) => {
    setCartItems((prevItems) =>
      prevItems.filter((item) => item.product.id !== productId)
    );
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const getTotalItems = () => {
     // Calculates the total number of individual items (sum of quantities)
     return cartItems.reduce((total, item) => total + item.quantity, 0);
    // If you want the count of unique product types: return cartItems.length;
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
