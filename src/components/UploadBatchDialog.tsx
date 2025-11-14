import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Upload } from "lucide-react";

interface UploadBatchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isWalletConnected: boolean;
  onUpload: (batch: any) => void;
}

export const UploadBatchDialog = ({ open, onOpenChange, isWalletConnected, onUpload }: UploadBatchDialogProps) => {
  const [formData, setFormData] = useState({
    name: "",
    brand: "",
    category: "",
    quantity: "",
    productionDate: "",
    notes: ""
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isWalletConnected) {
      toast.error("Please connect your wallet to upload batch data");
      return;
    }

    if (!formData.name || !formData.brand || !formData.category || !formData.quantity || !formData.productionDate) {
      toast.error("Please fill in all required fields");
      return;
    }

    // Generate encrypted quantity hash (simulated)
    const encryptedQuantity = `0x${Math.random().toString(16).slice(2, 34)}...${Math.random().toString(16).slice(2, 10)}`;
    
    const newBatch = {
      id: `BATCH-${Date.now().toString(36).toUpperCase()}`,
      name: formData.name,
      brand: formData.brand,
      category: formData.category,
      productionDate: formData.productionDate,
      encryptedQuantity,
      actualQuantity: parseInt(formData.quantity),
      status: "encrypted" as const,
    };

    onUpload(newBatch);
    toast.success("Batch uploaded and encrypted successfully!");
    
    // Reset form
    setFormData({
      name: "",
      brand: "",
      category: "",
      quantity: "",
      productionDate: "",
      notes: ""
    });
    
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl flex items-center gap-2">
            <Upload className="h-6 w-6 text-primary" />
            Upload Garment Batch
          </DialogTitle>
          <DialogDescription>
            Upload encrypted production data to the blockchain. Your production quantities will be secured.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="name">Batch Name *</Label>
            <Input
              id="name"
              placeholder="e.g., Spring Collection T-Shirts"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="brand">Brand Name *</Label>
            <Input
              id="brand"
              placeholder="e.g., Fashion Brand Co."
              value={formData.brand}
              onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">Category *</Label>
              <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                <SelectTrigger id="category">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="T-Shirts">T-Shirts</SelectItem>
                  <SelectItem value="Jackets">Jackets</SelectItem>
                  <SelectItem value="Dresses">Dresses</SelectItem>
                  <SelectItem value="Pants">Pants</SelectItem>
                  <SelectItem value="Accessories">Accessories</SelectItem>
                  <SelectItem value="Shoes">Shoes</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="quantity">Production Quantity *</Label>
              <Input
                id="quantity"
                type="number"
                placeholder="e.g., 5000"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                required
                min="1"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="productionDate">Production Date *</Label>
            <Input
              id="productionDate"
              type="date"
              value={formData.productionDate}
              onChange={(e) => setFormData({ ...formData, productionDate: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Additional Notes</Label>
            <Textarea
              id="notes"
              placeholder="Any additional information about this batch..."
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="min-h-[100px]"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="submit" variant="hero" className="flex-1">
              <Upload className="h-4 w-4" />
              Upload & Encrypt
            </Button>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
