"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export function HashRedirect() {
    const router = useRouter();

    useEffect(() => {
        // Redirect legacy hash routes to their path equivalent
        // e.g. /#/admin/orders -> /admin/orders
        if (typeof window !== 'undefined' && window.location.hash.startsWith('#/')) {
            const newPath = window.location.hash.slice(1);
            router.replace(newPath);
        }
    }, [router]);

    return null;
}
