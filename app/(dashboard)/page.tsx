import { DataCharts } from "@/components/data-charts";
import { DataGrid } from "@/components/data-grid";
import { RecurringTransactionsCard } from "@/components/recurring-transactions-card";

export default function DashboardPage() {
  return (
    <div className="max-w-screen-2xl mx-auto w-full pb-10 -mt-24">
      <div className="space-y-8">
        <DataGrid />
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-6">
          <div className="col-span-1 lg:col-span-3 xl:col-span-4">
            <DataCharts />
          </div>
          <div className="col-span-1 lg:col-span-3 xl:col-span-2">
            <RecurringTransactionsCard />
          </div>
        </div>
      </div>
    </div>
  );
};