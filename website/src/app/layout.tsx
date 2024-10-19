import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import { Loader2 } from "lucide-react";
import { Toaster } from "@/components/ui/toaster";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: "Taskr on SOL",
    description: "Decentralized Task Management on Solana",
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en">
            <body className={inter.className}>
                <Providers>
                    <div className="min-h-screen bg-black text-white">
                        {children}
                        <div
                            id="loading-overlay"
                            className="fixed inset-0 bg-black flex items-center justify-center z-50"
                        >
                            <Loader2
                                size={64}
                                className="animate-spin text-[#14F195]"
                            />
                        </div>
                        <Toaster />
                    </div>
                </Providers>
                <script
                    dangerouslySetInnerHTML={{
                        __html: `
                        window.addEventListener('load', function() {
                            document.getElementById('loading-overlay').style.display = 'none';
                        });
                    `,
                    }}
                />
            </body>
        </html>
    );
}
