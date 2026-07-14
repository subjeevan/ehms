"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import Loading from "@/components/Loading";

export default function AdminGuard({ children }) {
  const { ready, isAdmin } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (ready && !isAdmin) {
      router.replace("/access-denied");
    }
  }, [ready, isAdmin, router]);

  if (!ready || !isAdmin) {
    return <Loading label="Checking administrator permission..." />;
  }

  return children;
}
