import { z } from "zod";
import { Trash } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { insertAccountSchema } from "@/db/schema";
import currencies from "@/lib/currencies";
import { 
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { kenyanFinancialInstitutions } from "@/lib/institutions";
import { useState } from "react";

const formSchema = insertAccountSchema.pick({
    name: true,
    institutionName: true,
    accountNumber: true,
    currency: true,
});

type FormValues = z.input<typeof formSchema>;

type Props = {
    id?: string;
    defaultValues?: FormValues;
    onSubmit: (values: FormValues) => void;
    onDelete?: () => void;
    disabled?: boolean;
};

export const AccountForm = ({
    id,
    defaultValues,
    onSubmit,
    onDelete,
    disabled,
}: Props) => {
    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: defaultValues,
    });

    const [selectedInstitution, setSelectedInstitution] = useState<string>(defaultValues?.institutionName || "");
    const availableAccountNames = selectedInstitution 
        ? kenyanFinancialInstitutions.find(inst => inst.institution_name === selectedInstitution)?.list_of_account_names || []
        : [];

    const handleSubmit = (values: FormValues) => {
        onSubmit(values);
    };

    const handleDelete = () => {
        onDelete?.();
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4 pt-4">
                <FormField
                    name="institutionName"
                    control={form.control}
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Institution</FormLabel>
                            <Select
                                disabled={disabled}
                                onValueChange={(value) => {
                                    field.onChange(value);
                                    setSelectedInstitution(value);
                                    // Reset account name when institution changes
                                    form.setValue("name", "");
                                }}
                                value={field.value}
                                defaultValue={field.value}
                            >
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue 
                                            defaultValue={field.value} 
                                            placeholder="Select an institution" 
                                        />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    {kenyanFinancialInstitutions.map((institution) => (
                                        <SelectItem
                                            key={institution.institution_name}
                                            value={institution.institution_name}
                                        >
                                            {institution.institution_name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    name="name"
                    control={form.control}
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Account Name</FormLabel>
                            <Select
                                disabled={disabled || !selectedInstitution}
                                onValueChange={field.onChange}
                                value={field.value}
                                defaultValue={field.value}
                            >
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue 
                                            defaultValue={field.value} 
                                            placeholder={selectedInstitution ? "Select an account type" : "Select an institution first"} 
                                        />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    {availableAccountNames.map((accountName) => (
                                        <SelectItem
                                            key={accountName}
                                            value={accountName}
                                        >
                                            {accountName}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    name="accountNumber"
                    control={form.control}
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Account Number</FormLabel>
                            <FormControl>
                                <Input
                                    disabled={disabled}
                                    placeholder="Enter your account number"
                                    {...field}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    name="currency"
                    control={form.control}
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Currency</FormLabel>
                            <Select
                                disabled={disabled}
                                onValueChange={field.onChange}
                                value={field.value}
                                defaultValue={field.value}
                            >
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue 
                                            defaultValue={field.value} 
                                            placeholder="Select a currency" 
                                        />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    {currencies.map((currency) => (
                                        <SelectItem
                                            key={currency.code}
                                            value={currency.code}
                                        >
                                            {currency.code} - {currency.name} ({currency.symbol})
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <Button className="w-full" disabled={disabled}>
                    {id ? "Save changes" : "Create Account"}
                </Button>
                {!!id && <Button
                    type="button"
                    disabled={disabled}
                    onClick={handleDelete}
                    className="w-full"
                    variant="outline"
                >
                    <Trash className="size-4 mr-2" />
                    Delete account
                </Button>}
            </form>
        </Form>
    )
};