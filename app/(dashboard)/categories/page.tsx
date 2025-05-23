"use client";

import { Button } from "@/components/ui/button";
import { 
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { useNewCategory } from "@/features/categories/hooks/use-new-category";
import { Loader2, Plus } from "lucide-react";
import { columns } from "./columns";
import { DataTable } from "@/components/data-table";
import { useGetCategories } from "@/features/categories/api/use-get-categories";
import { Skeleton } from "@/components/ui/skeleton";
import { useBulkDeleteCategories } from "@/features/categories/api/use-bulk-delete-categories";
import { TypeFilter } from "./type-filter";
import { useState } from "react";

const CategoriesPage = () => {
    const newCategory = useNewCategory();
    const deleteCategories = useBulkDeleteCategories();
    const categoriesQuery = useGetCategories();
    const [typeFilter, setTypeFilter] = useState("all");

    const categories = categoriesQuery.data || [];
    const filteredCategories = categories.filter(category => {
        if (typeFilter === "all") return true;
        if (typeFilter === "user") return category.isUniversal === 0;
        if (typeFilter === "universal") return category.isUniversal === 1;
        return true;
    });

    const isDisabled =
        categoriesQuery.isLoading ||
        deleteCategories.isPending;

    if (categoriesQuery.isLoading) {
        return (
            <div className="mx-auto -mt-6 w-full max-w-screen-2xl pb-10">
                <Card className="border-none drop-shadow-sm">
                    <CardHeader>
                        <Skeleton className="h-8 w-48" />
                    </CardHeader>
                    <CardContent>
                        <div className="h-[500px] w-full flex items-center justify-center">
                            <Loader2 className="size-6 text-slate-300 animate-spin" />
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="mx-auto -mt-6 w-full max-w-screen-2xl pb-10">
            <Card className="border-none drop-shadow-sm">
                <CardHeader className="gap-y-2 lg:flex-row lg:items-center lg:justify-between">
                    <CardTitle className="text-xl line-clamp-1">
                        Categories 
                    </CardTitle>
                    <Button onClick={newCategory.onOpen} size="sm">
                        <Plus className="size-4 mr-2"/>
                        Add new
                    </Button>
                </CardHeader>
                <CardContent>
                    <div className="mb-4">
                        <TypeFilter value={typeFilter} onChange={setTypeFilter} />
                    </div>
                    <DataTable
                        filterKey="name"
                        columns={columns}
                        data={filteredCategories}
                        onDelete={(row) => {
                            // Filter out universal categories before deletion
                            const userCategories = row.filter(r => !r.original.isUniversal);
                            if (userCategories.length > 0) {
                                const ids = userCategories.map((r) => r.original.id);
                                deleteCategories.mutate({ ids });
                            }
                        }}
                        disabled={isDisabled}
                    />
                </CardContent>
            </Card>
        </div>
    );
};

export default CategoriesPage;