import { Logo } from "@/components/logo";
import { SignIn, SignUp, ClerkLoaded, ClerkLoading } from "@clerk/nextjs";
import { Loader2 } from "lucide-react";
import Image from "next/image";

export default function Page() {
    return (
        <div className="lg:grid lg:min-h-screen lg:grid-cols-12">
            <section className="relative flex h-32 items-end bg-blue-900 lg:col-span-5 lg:h-full xl:col-span-6">
                <img
                    alt=""
                    src="/auth/signup.jpg"
                    className="absolute inset-0 h-full w-full object-cover opacity-80"
                />

                <div className="hidden lg:relative lg:block lg:p-12">
                    <a className="block text-white" href="#">
                        <span className="sr-only">Home</span>
                    </a>

                    <h2 className="mt-6 text-2xl font-bold text-white sm:text-3xl md:text-4xl">
                        Welcome  To Mwula.
                    </h2>

                    <p className="mt-4 leading-relaxed text-white/90">
                        Take full control of your finances with Mwula. Start managing your money smarter, saving better, and reaching your goals faster.
                    </p>
                </div>
            </section>

            <div className="flex items-center justify-center px-8 py-8 sm:px-12 lg:col-span-7 lg:px-16 lg:py-12 xl:col-span-6">
                <div className="max-w-xl lg:max-w-3xl">
                    <div className="relative -mt-16 block lg:hidden">
                        <a
                            className="inline-flex size-16 items-center justify-center rounded-full bg-white text-blue-600 sm:size-20"
                            href="/"
                        >
                            <span className="sr-only">Home</span>

                            <Logo className="text-[#0004E8] dark:text-white" size={28} />

                        </a>

                        <h1 className="mt-2 text-lg font-bold  sm:text-3xl md:text-4xl">
                            Welcome  To Mwula
                        </h1>


                    </div>

                    <ClerkLoaded>
                        <SignUp path="/sign-up" />
                    </ClerkLoaded>
                    <ClerkLoading>
                        <Loader2 className="animate-spin text-muted-foreground" />
                    </ClerkLoading>
                </div>
            </div>


        </div>

    );
}