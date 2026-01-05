"use client";

import { useEffect, useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/Button/button";
import { AuthCard } from "@/components/ui/Card/authCard";
import { SigninFormSchema } from "@/app/lib/definitions";
import { CgSpinner } from "react-icons/cg";

type FormState = {
  errors?: {
    email?: string[];
    password?: string[];
  };
}

export default function SignInPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState<FormState["errors"]>({});
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrors({});
    setError(null);
    setIsLoading(true);

    // Client-side validation
    const result = SigninFormSchema.safeParse(formData);
    if (!result.success) {
      const formatted = result.error.format();
      setErrors({
        email: formatted.email?._errors,
        password: formatted.password?._errors,
      });
      setIsLoading(false);
      return;
    }

    const res = await signIn("credentials", {
      redirect: false,
      email: formData.email,
      password: formData.password,
      callbackUrl,
    });

    const CREDENTIALS_SIGNIN_ERROR = "CredentialsSignin";
    if (res?.error === CREDENTIALS_SIGNIN_ERROR) {
      setError("Invalid email or password");
      setIsLoading(false);
    } else if (res?.ok) {
      router.push(callbackUrl);
    } else {
      setIsLoading(false);
    }
  }

  return (
    <div>
      <div className="absolute inset-0 -z-10 h-full w-full bg-[linear-gradient(to_right,#3b82f620_1px,transparent_1px),linear-gradient(to_bottom,#3b82f620_1px,transparent_1px)] bg-[size:64px_64px]">
        <div className="flex items-center justify-center min-h-screen">
          <AuthCard className="w-full max-w-md" title="Sign In">
            {errors?.email && <div className="mb-4 p-2 bg-red-200 text-red-800 rounded">{errors.email}</div>}
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <input
                  id="email"
                  type="email"
                  placeholder="Email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  className="w-full bg-[#EDEDEA] p-4 rounded-md  focus:outline-none focus:ring-2 focus:ring-transparent error:focus:ring-red-400"
                />
              </div>
              {errors?.password && <div className="mb-4 p-2 bg-red-200 text-red-800 rounded">{errors.password}</div>}
              <div>
                <input
                  id="password"
                  type="password"
                  placeholder="Password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                  className="w-full bg-[#EDEDEA] p-4 rounded-md  focus:outline-none focus:ring-2 focus:ring-transparent error:focus:ring-red-400"
                />
              </div>
              <Button type="submit" variant="primary" className="w-full flex justify-center items-center" disabled={isLoading}>
                {isLoading ? <CgSpinner className="animate-spin text-xl" /> : "Sign In"}
              </Button>
              {error && <div className="mb-4 p-2 bg-red-200 text-red-800 rounded">{error}</div>}
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
