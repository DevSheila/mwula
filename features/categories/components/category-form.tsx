import { z } from "zod";
import { Trash } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { insertCategorySchema } from "@/db/schema";
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
import { iconMap } from "../lib/icons";

const formSchema = insertCategorySchema.pick({
  name: true,
  description: true,
  icon: true,
});

type FormValues = z.infer<typeof formSchema>;

type CategoryFormProps = {
  id?: string;
  defaultValues?: FormValues;
  onSubmit: (values: FormValues) => void;
  onDelete?: () => void;
  disabled?: boolean;
};

export const CategoryForm = ({
  id,
  defaultValues,
  onSubmit,
  onDelete,
  disabled,
}: CategoryFormProps) => {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      icon: "more-horizontal",
      ...defaultValues,
    },
  });

  const handleSubmit = (values: FormValues) => {
    onSubmit(values);
  };

  const handleDelete = () => {
    onDelete?.();
  };

  const iconOptions = Object.keys(iconMap);

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleSubmit)}
        autoCapitalize="off"
        autoComplete="off"
        className="space-y-4 pt-4"
      >
        <FormField
          name="name"
          control={form.control}
          disabled={disabled}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input placeholder="e.g. Food, Travel, etc." {...field} value={field.value || ""} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          name="description"
          control={form.control}
          disabled={disabled}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Input placeholder="e.g. Expenses for food and groceries" {...field} value={field.value || ""} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          name="icon"
          control={form.control}
          disabled={disabled}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Icon</FormLabel>
              <Select
                disabled={disabled}
                onValueChange={field.onChange}
                value={field.value || "more-horizontal"}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select an icon" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {iconOptions.map((icon) => {
                    const IconComponent = iconMap[icon];
                    return (
                      <SelectItem key={icon} value={icon}>
                        <div className="flex items-center gap-2">
                          <IconComponent className="h-4 w-4" />
                          <span>{icon}</span>
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button className="w-full" disabled={disabled}>
          {id ? "Save changes" : "Create category"}
        </Button>

        {!!id && (
          <Button
            type="button"
            disabled={disabled}
            onClick={handleDelete}
            className="w-full"
            variant="outline"
          >
            <Trash className="mr-2 size-4" />
            Delete category
          </Button>
        )}
      </form>
    </Form>
  );
};