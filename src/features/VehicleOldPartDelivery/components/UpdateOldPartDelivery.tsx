import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { toast } from "react-hot-toast";
import { Trash2 } from 'lucide-react';

// Define the schema for a single item
const itemSchema = z.object({
    item_name: z.string().max(100, "Item name must be less than 100 characters"),
    quantity: z.number().min(1, "Quantity must be at least 1"),
});

// Define the schema for the entire form
const vehicleInformationSchema = z.object({
    model: z.string().max(100, "Model must be less than 100 characters"),
    ye_bale_nibret_sim: z.string().max(100, "Ye Bale Nibret Sim must be less than 100 characters"),
    shanci_kutir: z.string().max(100, "Shanci Kutir must be less than 100 characters"),
    motor_kutir: z.string().max(100, "Motor Kutir must be less than 100 characters"),
    targa_kutir: z.string().max(100, "Targa Kutir must be less than 100 characters"),
    silk_kutir: z.string().max(100, "Silk Kutir must be less than 100 characters"),
    tin_kutir: z.string().max(100, "Tin Kutir must be less than 100 characters"),
    ken: z.string(),
    asrekabi_sim: z.string().max(100, "Asrekabi Sim must be less than 100 characters"),
    terekabi_sim: z.string().max(100, "Terekabi Sim must be less than 100 characters"),
    items: z.array(itemSchema),
});

type VehicleInformationFormData = z.infer<typeof vehicleInformationSchema>;

interface UpdateOldPartDeliveryModalProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    formData: VehicleInformationFormData;
    onSubmit: (data: VehicleInformationFormData) => void;
}

const UpdateOldPartDelivery: React.FC<UpdateOldPartDeliveryModalProps> = ({
                                                                              isOpen,
                                                                              onOpenChange,
                                                                              formData,
                                                                              onSubmit,
                                                                          }) => {
    const form = useForm<VehicleInformationFormData>({
        resolver: zodResolver(vehicleInformationSchema),
        defaultValues: formData,
    });

    const { reset } = form;

    useEffect(() => {
        reset(formData);
    }, [formData, reset]);

    const { fields, append, remove } = useForm({
        defaultValues: {
            items: formData.items,
        },
    });

    const handleSubmit = (values: VehicleInformationFormData) => {
        onSubmit(values);
    };

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="w-[90%] md:max-w-[40%] h-[90vh] md:h-auto">
                <DialogHeader>
                    <DialogTitle>Update Part Request</DialogTitle>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleSubmit)} className="overflow-y-auto space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="model"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Model</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Model" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="ye_bale_nibret_sim"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Ye Bale Nibret Sim</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Ye Bale Nibret Sim" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="shanci_kutir"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Shanci Kutir</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Shanci Kutir" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="motor_kutir"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Motor Kutir</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Motor Kutir" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="targa_kutir"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Targa Kutir</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Targa Kutir" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="silk_kutir"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Silk Kutir</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Silk Kutir" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="tin_kutir"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Tin Kutir</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Tin Kutir" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="ken"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Ken</FormLabel>
                                        <FormControl>
                                            <Input type="date" placeholder="Ken" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="asrekabi_sim"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Asrekabi Sim</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Asrekabi Sim" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="terekabi_sim"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Terekabi Sim</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Terekabi Sim" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                        <div className="mt-4">
                            <h4 className="text-lg font-medium mb-4">Items</h4>
                            {fields?.map((_, index) => (
                                <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 items-center">
                                    <FormField
                                        control={form.control}
                                        name={`items.${index}.item_name`}
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Item Name</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="Item Name" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name={`items.${index}.quantity`}
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Quantity</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        type="number" onWheel={(event) => event.currentTarget.blur()}
                                                        placeholder="Quantity"
                                                        {...field}
                                                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <Button type="button" variant="ghost" onClick={() => remove(index)}>
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            ))}
                            <Button type="button" onClick={() => append({ item_name: '', quantity: 1 })} className="mt-4">
                                Add More
                            </Button>
                        </div>
                        <Button type="submit" className="w-full sm:w-auto mt-6">
                            Update
                        </Button>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
};

export default UpdateOldPartDelivery;
