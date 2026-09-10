"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Mail01, Lock01, User01 } from "@untitledui/icons";
import { Input } from "@/components/base/input/input";
import { Button } from "@/components/base/buttons/button";
import { signupSchema, type SignupFormValues } from "@/lib/validation/authSchema";
import { useSignupMutation } from "@/features/auth";
import { getApiErrorMessage } from "@/lib/redux/api/errors";

export default function SignupPage() {
  const router = useRouter();
  const [signup, { isLoading, error }] = useSignupMutation();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: { first_name: "", last_name: "", email: "", password: "" },
  });

  const onSubmit = async (values: SignupFormValues) => {
    const result = await signup(values);
    if (!("error" in result)) {
      router.push("/orgs");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-6">
      <div className="flex flex-col gap-1 text-center">
        <h1 className="text-lg font-semibold text-primary">Create your account</h1>
        <p className="text-sm text-tertiary">Start sending campaigns with Mail Rocket.</p>
      </div>

      {error && <p className="rounded-lg bg-error-primary px-3 py-2 text-sm text-error-primary ring-1 ring-error_subtle">{getApiErrorMessage(error)}</p>}

      <div className="flex flex-col gap-4">
        <div className="flex gap-3">
          <Controller
            control={control}
            name="first_name"
            render={({ field }) => <Input {...field} label="First name" icon={User01} isInvalid={!!errors.first_name} hint={errors.first_name?.message} />}
          />
          <Controller
            control={control}
            name="last_name"
            render={({ field }) => <Input {...field} label="Last name" isInvalid={!!errors.last_name} hint={errors.last_name?.message} />}
          />
        </div>
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
        Sign up
      </Button>

      <p className="text-center text-sm text-tertiary">
        Already have an account?{" "}
        <Link href="/login" className="font-semibold text-brand-secondary hover:text-brand-secondary_hover">
          Sign in
        </Link>
      </p>
    </form>
  );
}
