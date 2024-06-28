import { validateRequest } from "@/lib/auth";

export default async function Page() {
  const { user } = await validateRequest();

  return (
    <div className="container p-8 flex justify-center">
      <h1 className="text-4xl font-bold">{user ? `Welcome back, ${user.displayName}!` : "Welcome to OCOM Bruh!"}</h1>
    </div>
  );
}