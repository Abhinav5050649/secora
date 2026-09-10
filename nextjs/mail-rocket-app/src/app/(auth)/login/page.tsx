"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Mail01, Lock01 } from "@untitledui/icons";
import { Input } from "@/components/base/input/input";
import { Button } from "@/components/base/buttons/button";
import { signinSchema, type SigninFormValues } from "@/lib/validation/authSchema";
import { useSigninMutation } from "@/features/auth";
import { getApiErrorMessage } from "@/lib/redux/api/errors";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [signin, { isLoading, error }] = useSigninMutation();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<SigninFormValues>({ resolver: zodResolver(signinSchema), defaultValues: { email: "", password: "" } });

  const onSubmit = async (values: SigninFormValues) => {
    const result = await signin(values);
    if (!("error" in result)) {
      router.push(searchParams.get("next") || "/orgs");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-6">
      <div className="flex flex-col gap-1 text-center">
        <h1 className="text-lg font-semibold text-primary">Sign in</h1>
        <p className="text-sm text-tertiary">Welcome back to Mail Rocket.</p>
      </div>

      {error && <p className="rounded-lg bg-error-primary px-3 py-2 text-sm text-error-primary ring-1 ring-error_subtle">{getApiErrorMessage(error)}</p>}

      <div className="flex flex-col gap-4">
        <Controller
          control={control}
          name="email"
          render={({ field }) => (
            <Input {...field} label="Email" type="email" icon={Mail01} isInvalid={!!errors.email} hint={errors.email?.message} />
          )}
        />
        <Controller
          control={control}
          name="password"
          render={({ field }) => (
            <Input {...field} label="Password" type="password" icon={Lock01} isInvalid={!!errors.password} hint={errors.password?.message} />
          )}
        />
      </div>

      <Button type="submit" size="lg" isLoading={isLoading}>
        Sign in
      </Button>

      <p className="text-center text-sm text-tertiary">
        Don&apos;t have an account?{" "}
        <Link href="/signup" className="font-semibold text-brand-secondary hover:text-brand-secondary_hover">
          Sign up
        </Link>
      </p>
    </form>
  );
}

export default function LoginPage() {
  return (
    <React.Suspense>
      <LoginForm />
    </React.Suspense>
  );
}
