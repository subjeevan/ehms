"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import AppLayout from "@/components/AppLayout";
import Loading from "@/components/Loading";

export default function ProtectedLayout({ children }) {
  const { ready, isAuthenticated } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (ready && !isAuthenticated) {
      router.replace(`/login?from=${encodeURIComponent(pathname)}`);
    }
  }, [ready, isAuthenticated, pathname, router]);

  if (!ready || !isAuthenticated) {
    return (
      <main className="center-page">
        <section className="center-card">
          <Loading label="Opening secure workspace..." />
        </section>
      </main>
    );
  }

  return <AppLayout>{children}</AppLayout>;
}
