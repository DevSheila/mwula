"use client";

import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { Button } from "./ui/button";
import { ThemeToggle } from "./theme-toggle";
import { UserButton } from "@clerk/nextjs";
import {
  LayoutDashboard,
  Receipt,
  Wallet,
  Tags,
  Target,
  Settings,
  ChevronRight,
  Menu,
} from "lucide-react";
import { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useMedia } from "react-use";
import { Logo } from "./logo";
import Image from "next/image";

const routes = [
  {
    href: "/",
    label: "Overview",
    icon: LayoutDashboard,
  },
  {
    href: "/transactions",
    label: "Transactions",
    icon: Receipt,
  },
  {
    href: "/accounts",
    label: "Accounts",
    icon: Wallet,
  },
  {
    href: "/categories",
    label: "Categories",
    icon: Tags,
  },
  {
    href: "/budgets",
    label: "Budgets",
    icon: Target,
  },
  {
    href: "/settings",
    label: "Settings",
    icon: Settings,
  },
];

const NavContent = () => {
  const pathname = usePathname();

  return (
    <>
      <div className="flex h-14 items-center border-b px-4">
        <Link href="/" className="flex items-center">
          <Logo className="text-[#0004E8] dark:text-white" size={28} />
          <span className="ml-2 text-xl font-semibold text-[#0004E8] dark:text-white">Vuno</span>
        </Link>
      </div>

      <div className="flex-1 overflow-auto py-4">
        <nav className="grid gap-1 px-2">
          {routes.map((route) => {
            const Icon = route.icon;
            const isActive = pathname === route.href;

            return (
              <Link
                key={route.href}
                href={route.href}
                className={cn(
                  "group flex items-center gap-x-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-blue-700 text-white dark:bg-blue-700"
                    : "text-muted-foreground hover:bg-[#0004E8]/10 hover:text-[#0004E8] dark:hover:bg-[#0004E8]/20 dark:hover:text-white"
                )}
              >

                <Icon className={cn(
                  "h-4 w-4",
                  isActive
                    ? "text-white"
                    : "text-gray-500 group-hover:text-[#0004E8] dark:group-hover:text-white"
                )} />
                <span className="ms-3">{route.label}</span>

              </Link>
            );
          })}
        </nav>
      </div>

      <div
        className="mt-auto p-4 m-4  rounded-xl bg-cover bg-center dark:bg-gray-700 relative overflow-hidden"
        style={{
          backgroundImage: "url('/white-curved.jpeg')",
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        <Button className="rounded-xl mb-3 w-full bg-blue-700 text-white hover:bg-blue-500 dark:bg-blue-700 dark:hover:bg-blue-600
        ">
          <a href="#">Upgrade to Pro</a>
        </Button>
        <p className="text-sm dark:text-gray-800 ">
          Unlock exclusive tools and advanced  features.
        </p>
      </div>

      <div className="mt-auto border-t p-2">
        <div className="flex items-center gap-x-4">
          <UserButton afterSignOutUrl="/" />
          <ThemeToggle />
        </div>
      </div>
    </>
  );
};

export const SideNav = () => {
  const [isOpen, setIsOpen] = useState(false);
  const isMobile = useMedia("(max-width: 1024px)", false);

  if (isMobile) {
    return (
      <>
        <div className="fixed top-0 left-0 right-0 z-50 flex h-14 items-center border-b bg-background px-4 lg:hidden">
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="mr-4 hover:bg-[#0004E8]/10 hover:text-[#0004E8] dark:hover:bg-[#0004E8]/20"
              >
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle navigation menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 p-0">
              <NavContent />
            </SheetContent>
          </Sheet>

          <Link href="/" className="flex items-center">
            <Logo className="text-[#0004E8] dark:text-white" size={24} />
            <span className="ml-2 text-lg font-semibold text-[#0004E8] dark:text-white">Vuno</span>
          </Link>
        </div>
        <div className="h-14" /> {/* Spacer for fixed header */}
      </>
    );
  }

  return (
    <div className="fixed inset-y-0 left-0 z-50 hidden h-full w-64 flex-col border-r bg-background lg:flex">
      <NavContent />
    </div>
  );
}; 