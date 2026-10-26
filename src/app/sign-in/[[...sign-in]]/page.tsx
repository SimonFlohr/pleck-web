import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center px-4 py-8 sm:py-12">
      <SignIn />
    </main>
  );
}
