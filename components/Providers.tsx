"use client";

import { AuthProvider } from '../src/context/AuthContext';
import { CartProvider } from '../src/context/CartContext';
import { ThemeProvider } from '../src/context/ThemeContext';

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <AuthProvider>
            <CartProvider>
                <ThemeProvider>
                    {children}
                </ThemeProvider>
            </CartProvider>
        </AuthProvider>
    );
}
