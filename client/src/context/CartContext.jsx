import React, { createContext, useContext, useState, useEffect } from 'react';
import { useToast } from './ToastContext';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState(() => {
    try {
      const savedCart = localStorage.getItem('food_cart');
      return savedCart ? JSON.parse(savedCart) : [];
    } catch (e) {
      return [];
    }
  });

  const { addToast } = useToast();

  useEffect(() => {
    try {
      localStorage.setItem('food_cart', JSON.stringify(cartItems));
    } catch (e) {
      console.error('Failed to save cart to localStorage', e);
    }
  }, [cartItems]);

  const addToCart = (food, quantity = 1) => {
    const foodId = String(food.id || food._id);
    setCartItems((prevItems) => {
      const existingIndex = prevItems.findIndex(
        (item) => String(item.food) === foodId || String(item._id) === foodId || String(item.id) === foodId
      );
      if (existingIndex > -1) {
        const updated = [...prevItems];
        updated[existingIndex].quantity += quantity;
        addToast(`Updated ${food.name} quantity in basket`, 'success');
        return updated;
      } else {
        addToast(`Added ${food.name} to basket`, 'success');
        return [
          ...prevItems,
          {
            food: foodId,
            id: foodId,
            _id: foodId,
            name: food.name,
            price: food.price,
            image: food.image,
            category: food.category,
            quantity: quantity
          }
        ];
      }
    });
  };

  const updateQuantity = (foodId, quantity) => {
    const targetId = String(foodId);
    if (quantity < 1) return;
    setCartItems((prevItems) =>
      prevItems.map((item) =>
        String(item.food) === targetId || String(item._id) === targetId || String(item.id) === targetId
          ? { ...item, quantity: Math.max(1, quantity) }
          : item
      )
    );
  };

  const removeFromCart = (foodId) => {
    const targetId = String(foodId);
    setCartItems((prevItems) => {
      const itemToRemove = prevItems.find(
        (item) => String(item.food) === targetId || String(item._id) === targetId || String(item.id) === targetId
      );
      if (itemToRemove) {
        addToast(`Removed ${itemToRemove.name} from basket`, 'info');
      }
      return prevItems.filter(
        (item) => String(item.food) !== targetId && String(item._id) !== targetId && String(item.id) !== targetId
      );
    });
  };

  const clearCart = () => {
    setCartItems([]);
    addToast('Basket cleared', 'info');
  };

  // Calculations
  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const deliveryFee = cartItems.length > 0 ? 3.99 : 0;
  const tax = parseFloat((subtotal * 0.08).toFixed(2));
  const total = parseFloat((subtotal + deliveryFee + tax).toFixed(2));
  const totalCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        subtotal: parseFloat(subtotal.toFixed(2)),
        deliveryFee,
        tax,
        total,
        totalCount
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
