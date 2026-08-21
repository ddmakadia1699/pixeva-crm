import type { Metadata } from "next";
import "./globals.css";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import { ThemeProvider } from "@/context/ThemeProvider";
import { AuthProvider } from "@/context/AuthContext";

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
    <html lang="en" className="dark">
      <body className="bg-[#0b0f17] text-slate-100 antialiased min-h-screen">
        <ThemeProvider>
          <AuthProvider>
            <div className="flex min-h-screen w-full">
              {/* Persistent Sidebar */}
              <Sidebar />

              {/* Main Content Area */}
              <div className="flex-1 flex flex-col min-w-0 min-h-screen">
                <Header />
                <main className="flex-1 p-6 md:p-8 space-y-6 overflow-y-auto">
                  {children}
                </main>
              </div>
            </div>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
