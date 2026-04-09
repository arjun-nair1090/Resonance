import type { Metadata } from 'next';
import './globals.css';
import { ReactNode } from 'react';
import { AuthProvider } from '@/lib/AuthContext';
import { AudioProvider } from '@/lib/AudioContext';
import { AppShell } from '@/components/AppShell';

export const metadata: Metadata = {
    title: 'Resonance | Next-Gen Music',
    description: 'AI powered music recommendations',
};

export default function RootLayout({
    children,
}: {
    children: ReactNode;
}) {
    return (
        <html lang="en" className="dark">
            <body suppressHydrationWarning className="bg-background text-foreground antialiased min-h-screen selection:bg-primary/30 relative">
                <AuthProvider>
                    <AudioProvider>
                        <AppShell>
                            {children}
                        </AppShell>
                    </AudioProvider>
                </AuthProvider>
            </body>
        </html>
    );
}
