"use client";

import { useEffect, useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/Button/button";
import { AuthCard } from "@/components/ui/Card/authCard";

export default function SignInPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");


  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const res = await signIn("credentials", {
      redirect: false,
      email,
      password,
      callbackUrl,
    });

    if (res?.error) {
      setError("Invalid email or password");
    } else if (res?.ok) {
      router.push(callbackUrl);
    }
  }

  return (
    <div>
      <div className="absolute inset-0 -z-10 h-full w-full bg-[linear-gradient(to_right,#3b82f620_1px,transparent_1px),linear-gradient(to_bottom,#3b82f620_1px,transparent_1px)] bg-[size:64px_64px]">
        <div className="flex items-center justify-center min-h-screen">
          <AuthCard className="w-full max-w-md" title="Sign In">
            {error && <div className="mb-4 p-2 bg-red-200 text-red-800 rounded">{error}</div>}
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <input
                  id="email"
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full bg-[#EDEDEA] p-4 rounded-md  focus:outline-none focus:ring-2 focus:ring-transparent error:focus:ring-red-400"
                  />
              </div>
              <div>
                <input
                  id="password"
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full bg-[#EDEDEA] p-4 rounded-md  focus:outline-none focus:ring-2 focus:ring-transparent error:focus:ring-red-400"
                  />
              </div>
              <Button type="submit" variant="primary" className="w-full">
                Sign In
              </Button>
              <div className="text-center">
                <a href="/auth/register" className="text-sm hover:underline">
                  Don't have an account? Register
                </a>
              </div>
            </form>
          </AuthCard>
        </div>
        <div className="absolute bottom-4 w-full text-center text-sm text-gray-600">
          <div>
            Demo Account - Email: <span className="font-mono">test@mail.com</span>
          </div>
        </div>
      </div>
    </div>
  );
}
