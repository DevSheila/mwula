import { AccountFilter } from "./account-filter";
import { DateFilter } from "./date-filter";

export const Filters = () => {
  return (
    // <div className="flex flex-col items-center gap-y-2 lg:flex-row lg:gap-x-2 lg:gap-y-0">
    <div className="flex flex-col items-center lg:flex-row lg:gap-x-2 px-4 md:px-8 lg:px-10 max-w-7xl mx-auto w-full py-1">
      <AccountFilter />
      <DateFilter />
    </div>
  );
};