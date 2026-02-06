"use client";

import { useAuth } from "@/src/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import CheckoutClient from "./CheckoutClient";
import { Loader2 } from "lucide-react";

export default function CheckoutPage() {
    const { user, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading && !user) {
            router.replace("/login?from=/checkout");
        }
    }, [loading, user, router]);

    if (loading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-950">
                <Loader2 className="w-12 h-12 text-rose-500 animate-spin mb-4" />
                <h2 className="text-xl font-medium text-gray-800 dark:text-white">Loading checkout...</h2>
                <p className="text-gray-500 dark:text-gray-400 mt-2">Please wait while we prepare your secure checkout.</p>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-950">
                <Loader2 className="w-8 h-8 text-gray-300 animate-spin mb-4" />
                <p className="text-gray-600 dark:text-gray-400">Redirecting to login...</p>
            </div>
        );
    }

    return <CheckoutClient />;
}
