import { Header } from "@/components/header";

type Props = {
    children: React.ReactNode;
}

const DashboardLayout = ({ children }: Props) => {
    return (
        <>
            <main className="flex-1 lg:pl-64">

                <Header />
                <main className="px-3 lg:px-14 ">

                    {children}
                </main>
            </main>
        </>
    );
};

export default DashboardLayout;