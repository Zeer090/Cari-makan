import { createContext, useState, useEffect, useContext } from 'react';
import api from '../services/api';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(() => {
    const savedCart = localStorage.getItem('cart');
    return savedCart ? JSON.parse(savedCart) : { restaurant_id: null, items: [] };
  });

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  const addToCart = (menuItem, restaurantId) => {
    setCart((prevCart) => {
      // If adding item from a different restaurant, reset the cart
      if (prevCart.restaurant_id && prevCart.restaurant_id !== restaurantId) {
        if (!window.confirm('Adding this item will clear your current cart from another restaurant. Continue?')) {
          return prevCart;
        }
        return {
          restaurant_id: restaurantId,
          items: [{ menu_id: menuItem.id, quantity: 1, ...menuItem }]
        };
      }

      const existingItemIndex = prevCart.items.findIndex(item => item.menu_id === menuItem.id);
      let newItems = [...prevCart.items];
      
      if (existingItemIndex >= 0) {
        newItems[existingItemIndex].quantity += 1;
      } else {
        newItems.push({ menu_id: menuItem.id, quantity: 1, ...menuItem });
      }

      return {
        restaurant_id: restaurantId,
        items: newItems
      };
    });
  };

  const removeFromCart = (menuId) => {
    setCart(prevCart => {
      const newItems = prevCart.items.filter(item => item.menu_id !== menuId);
      return {
        restaurant_id: newItems.length > 0 ? prevCart.restaurant_id : null,
        items: newItems
      };
    });
  };

  const updateQuantity = (menuId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(menuId);
      return;
    }

    setCart(prevCart => ({
      ...prevCart,
      items: prevCart.items.map(item => 
        item.menu_id === menuId ? { ...item, quantity } : item
      )
    }));
  };

  const clearCart = () => {
    setCart({ restaurant_id: null, items: [] });
  };

  const cartTotal = cart.items.reduce((total, item) => total + (item.price * item.quantity), 0);
  const cartItemCount = cart.items.reduce((count, item) => count + item.quantity, 0);

  const value = {
    cart,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    cartTotal,
    cartItemCount
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};
