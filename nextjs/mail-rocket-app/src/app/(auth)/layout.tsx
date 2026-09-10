import { MailRocketLogo } from "@/components/foundations/logo/untitledui-logo";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-secondary_alt px-4 py-12">
      <div className="w-full max-w-md rounded-2xl bg-primary p-6 shadow-lg ring-1 ring-secondary sm:p-8">
        <div className="mb-6 flex justify-center">
          <MailRocketLogo />
        </div>
        {children}
      </div>
    </div>
  );
}
