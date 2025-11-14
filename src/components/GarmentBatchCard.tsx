import { Lock, Unlock, Eye, Package } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { toast } from "sonner";

interface GarmentBatch {
  id: string;
  name: string;
  productionDate: string;
  encryptedQuantity: string;
  actualQuantity?: number;
  brand: string;
  status: "encrypted" | "verified";
  category: string;
}

interface GarmentBatchCardProps {
  batch: GarmentBatch;
  isWalletConnected: boolean;
}

export const GarmentBatchCard = ({ batch, isWalletConnected }: GarmentBatchCardProps) => {
  const [isDecrypted, setIsDecrypted] = useState(false);

  const handleDecrypt = () => {
    if (!isWalletConnected) {
      toast.error("Please connect your wallet to decrypt data");
      return;
    }

    // Simulate decryption
    setIsDecrypted(true);
    toast.success("Authenticity verified successfully!");
  };

  return (
    <Card className="group relative overflow-hidden bg-gradient-card border-border hover:border-primary transition-all duration-300 hover:shadow-glow">
      {/* Animated gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      <div className="relative p-6 space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Package className="h-5 w-5 text-primary" />
              <h3 className="font-semibold text-lg">{batch.name}</h3>
            </div>
            <p className="text-sm text-muted-foreground">{batch.brand}</p>
          </div>
          <Badge 
            variant={batch.status === "verified" ? "default" : "secondary"}
            className="flex items-center gap-1"
          >
            {batch.status === "encrypted" ? (
              <Lock className="h-3 w-3" />
            ) : (
              <Unlock className="h-3 w-3" />
            )}
            {batch.status === "encrypted" ? "Encrypted" : "Verified"}
          </Badge>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-2 gap-4 py-4 border-y border-border">
          <div>
            <p className="text-xs text-muted-foreground mb-1">Category</p>
            <p className="font-medium">{batch.category}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">Production Date</p>
            <p className="font-medium">{batch.productionDate}</p>
          </div>
        </div>

        {/* Encrypted/Decrypted Data */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">Production Quantity</p>
            {!isDecrypted && (
              <Lock className="h-4 w-4 text-primary animate-pulse" />
            )}
          </div>
          
          <div className="p-4 rounded-lg bg-secondary/50 border border-border font-mono text-sm">
            {isDecrypted ? (
              <div className="flex items-center gap-2">
                <Unlock className="h-4 w-4 text-primary" />
                <span className="text-primary font-semibold">
                  {batch.actualQuantity || "5,280"} units
                </span>
              </div>
            ) : (
              <div className="text-muted-foreground">
                {batch.encryptedQuantity}
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          {!isDecrypted ? (
            <Button 
              variant="hero" 
              className="flex-1"
              onClick={handleDecrypt}
            >
              <Eye className="h-4 w-4" />
              Verify Authenticity
            </Button>
          ) : (
            <Button variant="outline" className="flex-1" disabled>
              <Unlock className="h-4 w-4" />
              Verified
            </Button>
          )}
        </div>

        {/* Batch ID */}
        <div className="pt-2 border-t border-border">
          <p className="text-xs text-muted-foreground">
            Batch ID: <span className="font-mono">{batch.id}</span>
          </p>
        </div>
      </div>
    </Card>
  );
};
