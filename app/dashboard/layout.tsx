// app/(withSession)/layout.tsx
"use client";
import Nav from "@/components/nav/nav";
import Header from "@/components/ui/Header/header";
import { profile } from "console";
import { SessionProvider } from "next-auth/react";

export default function WithSessionLayout({ children }: { children: React.ReactNode }) {
  return <SessionProvider>
    <div className="flex w-full p-5">
      <Nav />
      <div className="flex flex-col w-full pl-6">
        <Header />
        {children}
      </div>
    </div>
  </SessionProvider>;
}
