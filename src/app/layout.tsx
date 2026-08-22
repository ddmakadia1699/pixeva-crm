import type { Metadata } from "next";
import "./globals.css";
import AppShell from "@/components/layout/AppShell";
import { ThemeProvider } from "@/context/ThemeProvider";
import { AuthProvider } from "@/context/AuthContext";
import { SidebarProvider } from "@/context/SidebarContext";
import AuthGuard from "@/components/auth/AuthGuard";

export const metadata: Metadata = {
  title: "Pixeva CRM | Tri-Cloud Enterprise CRM",
  description: "World-Class CRM powered by Vercel Edge, Supabase PostgreSQL, and AWS Lambda Serverless Workers.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="light" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                const theme = localStorage.getItem('pixeva_theme') || 'light';
                if (theme === 'dark') {
                  document.documentElement.classList.add('dark');
                  document.documentElement.classList.remove('light');
                  document.documentElement.setAttribute('data-theme', 'dark');
                } else {
                  document.documentElement.classList.remove('dark');
                  document.documentElement.classList.add('light');
                  document.documentElement.setAttribute('data-theme', 'light');
                }
              } catch (e) {}
            `,
          }}
        />
      </head>
      <body className="bg-slate-50 dark:bg-[#0b0f17] text-slate-900 dark:text-slate-100 antialiased min-h-screen">
        <ThemeProvider>
          <AuthProvider>
            <SidebarProvider>
              <AuthGuard>
                <AppShell>
                  {children}
                </AppShell>
              </AuthGuard>
            </SidebarProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
