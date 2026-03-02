import { createContext, useContext, useState, useEffect } from 'react';
import { getSession, getCart, login as dbLogin, logout as dbLogout, signup as dbSignup, addToCart as dbAddToCart, removeFromCart as dbRemoveFromCart } from '../utils/db';

const AppContext = createContext(null);

export function AppProvider({ children }) {
    const [user, setUser] = useState(() => getSession());
    const [cart, setCart] = useState(() => getCart());
    const [cartOpen, setCartOpen] = useState(false);

    const refreshCart = () => setCart(getCart());

    const login = (userData) => { dbLogin(userData); setUser(userData); };
    const logout = () => { dbLogout(); setUser(null); };
    const signup = (userData) => { const u = dbSignup(userData); setUser(u); return u; };

    const addToCart = (item) => { dbAddToCart(item); refreshCart(); };
    const removeFromCart = (id) => { dbRemoveFromCart(id); refreshCart(); };

    const isMember = user && (user.membershipTier === 'plus' || user.membershipTier === 'premium');
    const cartCount = cart.reduce((acc, i) => acc + i.qty, 0);

    return (
        <AppContext.Provider value={{ user, login, logout, signup, cart, cartCount, cartOpen, setCartOpen, addToCart, removeFromCart, isMember }}>
            {children}
        </AppContext.Provider>
    );
}

export const useApp = () => useContext(AppContext);
