// components/UpdateOldPartDelivery.tsx
import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface UpdatePartRequestModalProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    formData: any;
    onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onSubmit: (e: React.FormEvent) => void;
}

const UpdatePartRequestModal: React.FC<UpdatePartRequestModalProps> = ({
                                                                           isOpen,
                                                                           onOpenChange,
                                                                           formData,
                                                                           onInputChange,
                                                                           onSubmit,
                                                                       }) => {
    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="w-[90%] md:max-w-[40%] h-[90vh] md:h-auto">
                <DialogHeader>
                    <DialogTitle>Update Part Request</DialogTitle>
                </DialogHeader>
                <form onSubmit={onSubmit} className="overflow-y-auto">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="model">Model</Label>
                            <Input id="model" name="model" value={formData.model} onChange={onInputChange} />
                        </div>
                        <div>
                            <Label htmlFor="ye_bale_nibret_sim">Ye Bale Nibret Sim</Label>
                            <Input id="ye_bale_nibret_sim" name="ye_bale_nibret_sim" value={formData.ye_bale_nibret_sim} onChange={onInputChange} />
                        </div>
                        <div>
                            <Label htmlFor="shanci_kutir">Shanci Kutir</Label>
                            <Input id="shanci_kutir" name="shanci_kutir" value={formData.shanci_kutir} onChange={onInputChange} />
                        </div>
                        <div>
                            <Label htmlFor="motor_kutir">Motor Kutir</Label>
                            <Input id="motor_kutir" name="motor_kutir" value={formData.motor_kutir} onChange={onInputChange} />
                        </div>
                        <div>
                            <Label htmlFor="targa_kutir">Targa Kutir</Label>
                            <Input id="targa_kutir" name="targa_kutir" value={formData.targa_kutir} onChange={onInputChange} />
                        </div>
                        <div>
                            <Label htmlFor="silk_kutir">Silk Kutir</Label>
                            <Input id="silk_kutir" name="silk_kutir" value={formData.silk_kutir} onChange={onInputChange} />
                        </div>
                        <div>
                            <Label htmlFor="tin_kutir">Tin Kutir</Label>
                            <Input id="tin_kutir" name="tin_kutir" value={formData.tin_kutir} onChange={onInputChange} />
                        </div>
                        <div>
                            <Label htmlFor="ken">Ken</Label>
                            <Input id="ken" name="ken" type="date" value={formData.ken} onChange={onInputChange} />
                        </div>
                        <div>
                            <Label htmlFor="asrekabi_sim">Asrekabi Sim</Label>
                            <Input id="asrekabi_sim" name="asrekabi_sim" value={formData.asrekabi_sim} onChange={onInputChange} />
                        </div>
                        <div>
                            <Label htmlFor="terekabi_sim">Terekabi Sim</Label>
                            <Input id="terekabi_sim" name="terekabi_sim" value={formData.terekabi_sim} onChange={onInputChange} />
                        </div>
                    </div>
                    <Button type="submit" className="mt-4 w-auto">
                        Update
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default UpdatePartRequestModal;
