import React from 'react';
import { Package } from 'lucide-react';

export default function EidNotice() {
    return (
        <div className="mb-6 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border border-amber-200 dark:border-amber-700/50 rounded-2xl p-4 sm:p-5 shadow-sm flex items-start sm:items-center gap-4 transition-all hover:shadow-md">
            <div className="p-3 bg-amber-100 dark:bg-amber-900/50 rounded-xl flex-shrink-0">
                <span role="img" aria-label="mosque" className="text-2xl block sm:hidden">🕌</span>
                <span role="img" aria-label="mosque" className="text-3xl hidden sm:block">🕌</span>
            </div>
            <div className="flex-1">
                <h3 className="text-base sm:text-lg font-bold text-amber-900 dark:text-amber-100 flex items-center gap-2">
                    Eid Delivery Notice
                </h3>
                <p className="text-sm sm:text-base text-amber-800/80 dark:text-amber-200/80 mt-1 font-medium leading-relaxed">
                    Eid Mubarak! Orders placed now will be delivered after Eid. Thank you for your patience.
                </p>
            </div>
        </div>
    );
}
