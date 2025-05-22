"use client";

import { useUser } from "@clerk/nextjs";

export const WelcomeMsg = () => {
    const { user, isLoaded } = useUser();

    return (
        <div className="space-y-1">
            <h2 className="text-xl font-medium text-white lg:text-2xl">
                Welcome Back{isLoaded ? ", " : " "}{user?.firstName} 👋
            </h2>
            <p className="text-sm text-white/70">
                This is your Financial Overview Report
            </p>
        </div>
    )
};