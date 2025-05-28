import { ClerkLoaded, ClerkLoading } from "@clerk/nextjs";
import { Loader2 } from "lucide-react";

import { Filters } from "./filters";
import { WelcomeMsg } from "./welcome-msg";

export const Header = () => {
  return (
    <header className="px-4 py-6 lg:px-8">
      <div className="mx-auto max-w-screen-2xl">
        <div className="mb-4">
          <WelcomeMsg />
        </div>
        <Filters />
      </div>
    </header>
  );
};