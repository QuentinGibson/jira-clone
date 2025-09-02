import { UserButton } from "@clerk/nextjs";

export function Navbar() {
  return (
    <nav className="flex w-full items-end justify-end px-6 pt-4 lg:items-center lg:justify-between">
      <div className="hidden flex-col lg:flex">
        <h1 className="text-2xl font-semibold">Home</h1>
        <p className="text-muted-foreground">
          {" "}
          Monitor all of your projects and tasks here
        </p>
      </div>
      <div>
        <UserButton />
      </div>
    </nav>
  );
}
