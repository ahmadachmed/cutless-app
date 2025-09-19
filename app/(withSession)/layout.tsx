// app/(withSession)/layout.tsx
"use client";
import { SessionProvider } from "next-auth/react";

export default function WithSessionLayout({ children }: { children: React.ReactNode }) {
  return <SessionProvider>{children}</SessionProvider>;
}
