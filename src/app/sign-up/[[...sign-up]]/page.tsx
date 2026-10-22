import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center px-4 py-8 sm:py-12">
      <div className="mb-6 text-center">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          <i>Pleck</i>
        </h1>
        <p className="mt-1.5 text-xs sm:text-sm text-muted-foreground">
          Your family&apos;s private archive of everyday moments.
        </p>
      </div>
      <SignUp />
    </main>
  );
}
