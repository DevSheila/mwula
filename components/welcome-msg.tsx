"use client";

import { useUser } from "@clerk/nextjs";

export const WelcomeMsg = () => {
    const { user, isLoaded } = useUser();

    return (
        <div className="px-4 md:px-8 lg:px-10 max-w-7xl mx-auto w-full ">
            <div className="space-y-2">
                <h2 className="text-xl font-semibold text-gray-800 dark:text-white lg:text-xl">
                    Welcome Back{isLoaded ? ", " : " "}{user?.firstName} 
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                    This is your Financial Overview Report
                </p>
            </div>
        </div>
    )
};