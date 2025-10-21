"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AuthCard } from "@/components/ui/Card/authCard";
import { Button } from "@/components/ui/Button/button";
import { Input } from "@/components/ui/Field/input";
import { Select } from "@/components/ui/Field/select";

type FormState = {
  errors?: {
    name?: string[];
    email?: string[];
    password?: string[];
    role?: string[];
  };
};

export default function RegisterPage() {
  const router = useRouter();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [formData, setFormData] = useState({ name: "", email: "", password: "", role: "customer" });
  const [errors, setErrors] = useState<FormState["errors"]>({});
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });

    const data = await res.json();

    if (!res.ok) {
      if (data.errors) {
        setErrors(data.errors);
      } else if (data.error) {
        setErrorMessage(data.error);
      }
    } else {
      router.push("/auth/signin");
    }
    setLoading(false);
  }

  return (
    <div className="absolute inset-0 -z-10 h-full w-full bg-[linear-gradient(to_right,#3b82f620_1px,transparent_1px),linear-gradient(to_bottom,#3b82f620_1px,transparent_1px)] bg-[size:64px_64px]">
      <div className="flex items-center justify-center min-h-screen">
        <AuthCard className="w-full max-w-md" title="Register">
          {/* {state?.errors?.name && <div className="mb-4 p-2 bg-red-200 text-red-800 rounded">{state.errors.name}</div>} */}
          {/* {error && <div className="mb-4 p-2 bg-red-200 text-red-800 rounded">{error}</div>} */}
          {errors?.name && errors.name.map((err, idx) => (
            <div key={idx} className="mb-2 p-2 bg-red-200 text-red-800 rounded">
              {err}
            </div>
          ))}
          <form onSubmit={handleSubmit} className="space-y-6">
            <Input
              id="name"
              name="name"
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              placeholder="Name" />
            <Input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
              placeholder="Email" />
            {errors?.email && errors.email.map((err, idx) => (
              <div key={idx} className="mb-2 p-2 bg-red-200 text-red-800 rounded">
                {err}
              </div>
            ))}
            <Input
              type="password"
              placeholder="Password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
            />
            {errors?.password && errors.password.map((err, idx) => (
              <div key={idx} className="mb-2 p-2 bg-red-200 text-red-800 rounded">
                {err}
              </div>
            ))}
            <Select onChange={e => setFormData({ ...formData, role: e.target.value })} value={formData.role}  >
              <option value="customer">Customer</option>
              <option value="capster">Capster</option>
              <option value="owner">Owner</option>
            </Select>
            {errorMessage && <div className="mb-4 p-2 bg-red-200 text-red-800 rounded">{errorMessage}</div>}

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
