"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AuthCard } from "@/components/ui/Card/authCard";
import { Button } from "@/components/ui/Button/button";
import { Input } from "@/components/ui/Field/input";
import { Select } from "@/components/ui/Field/select";

export default function RegisterPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("customer");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password, role }),
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.error || "Something went wrong");
      setLoading(false);
      return;
    }

    router.push("/auth/signin");
  }

  return (
    <div className="absolute inset-0 -z-10 h-full w-full bg-[linear-gradient(to_right,#3b82f620_1px,transparent_1px),linear-gradient(to_bottom,#3b82f620_1px,transparent_1px)] bg-[size:64px_64px]">
      <div className="flex items-center justify-center min-h-screen">
        <AuthCard className="w-full max-w-md" title="Register">
          {error && <div className="mb-4 p-2 bg-red-200 text-red-800 rounded">{error}</div>}
          <form onSubmit={handleSubmit} className="space-y-6">
            <Input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="Name" />
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="Email" />
            <Input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <Select onChange={(e) => setRole(e.target.value)} value={role} >
              <option value="customer">Customer</option>
              <option value="capster">Capster</option>
              <option value="owner">Owner</option>
            </Select>

            <Button variant="primary" type="submit" className="w-full">
              {loading ? "Registering..." : "Register"}
            </Button>
          </form>
          <div className="text-center mt-4">
                <a href="/auth/signin" className="text-sm hover:underline">
                  Already have an account? Sign In
                </a>
              </div>
        </AuthCard>
      </div>
    </div>
  );
}
