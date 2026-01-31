import { Navbar } from "@/src/components/Navbar";
import { Footer } from "@/src/components/Footer";

export default function StoreLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950 dark:text-gray-100 flex flex-col transition-colors duration-200">
            <Navbar />
            <main className="flex-1">
                {children}
            </main>
            <Footer />
        </div>
    );
}
