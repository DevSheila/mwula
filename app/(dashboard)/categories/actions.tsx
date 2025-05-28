"use client";

import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { useDeleteCategory } from "@/features/categories/api/use-delete-category";
import { useOpenCategory } from "@/features/categories/hooks/use-open-category";
import { Edit, MoreHorizontal, Trash } from "lucide-react";
import { useConfirm } from "@/hooks/use-confirm";
import { useEditCategory } from "@/features/categories/api/use-edit-category";

interface ActionsProps {
    id: string;
    isUniversal?: number;
}

export const Actions = ({ id, isUniversal }: ActionsProps) => {
    const [ConfirmationDialog, confirm] = useConfirm(
        "Are you sure?",
        "You are about to delete this category."
    )
    const deleteMutation = useDeleteCategory(id);
    const { onOpen } = useOpenCategory();
    const editCategory = useEditCategory();

    const handleDelete = async () => {
        const ok = await confirm();

        if (ok) {
            deleteMutation.mutate();
        }
    };

    return (
        <>
            <ConfirmationDialog />
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuItem
                        disabled={isUniversal === 1 || deleteMutation.isPending}
                        onClick={() => onOpen(id)}
                        className={isUniversal === 1 ? "text-muted-foreground cursor-not-allowed" : ""}
                    >
                        <Edit className="size-4 mr-2" />
                        Edit
                        {isUniversal === 1 && <span className="ml-2 text-xs">(Universal)</span>}
                    </DropdownMenuItem>
                    <DropdownMenuItem
                        disabled={isUniversal === 1 || deleteMutation.isPending}
                        onClick={handleDelete}
                        className={isUniversal === 1 ? "text-muted-foreground cursor-not-allowed" : ""}
                    >
                        <Trash className="size-4 mr-2" />
                        Delete
                        {isUniversal === 1 && <span className="ml-2 text-xs">(Universal)</span>}
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </>
    );
};

// TODO: FUCK SHIT UP