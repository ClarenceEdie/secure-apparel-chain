import { GarmentBatchCard } from "./GarmentBatchCard";

const mockBatches = [
  {
    id: "SAF-2024-001",
    name: "Premium Cotton T-Shirts",
    productionDate: "2024-01-15",
    encryptedQuantity: "0x7a8f3d2e9c4b1a5f6e3d8c2a9b4f7e1c",
    actualQuantity: 5280,
    brand: "Urban Essence",
    status: "encrypted" as const,
    category: "Apparel",
  },
  {
    id: "SAF-2024-002",
    name: "Denim Jacket Collection",
    productionDate: "2024-01-20",
    encryptedQuantity: "0x4b9c2f8a1d5e3c7b9f2a6e1d8c4b7f3a",
    actualQuantity: 2150,
    brand: "Denim Dreams",
    status: "encrypted" as const,
    category: "Outerwear",
  },
  {
    id: "SAF-2024-003",
    name: "Organic Hoodies",
    productionDate: "2024-01-25",
    encryptedQuantity: "0x9f3a7c2e1b5d8f4a6c9e2d1b7f3c8a5e",
    actualQuantity: 3720,
    brand: "EcoWear",
    status: "verified" as const,
    category: "Apparel",
  },
  {
    id: "SAF-2024-004",
    name: "Athletic Shorts Series",
    productionDate: "2024-02-01",
    encryptedQuantity: "0x2c5f8a9d3e7b1c4f9a6d2e8b5c1f7a3d",
    actualQuantity: 4890,
    brand: "FitMotion",
    status: "encrypted" as const,
    category: "Sportswear",
  },
  {
    id: "SAF-2024-005",
    name: "Silk Scarf Collection",
    productionDate: "2024-02-05",
    encryptedQuantity: "0x8d4a9c2f5e7b3a1d6c9f2e8b4a7c1f5e",
    actualQuantity: 1560,
    brand: "Luxe Accessories",
    status: "encrypted" as const,
    category: "Accessories",
  },
  {
    id: "SAF-2024-006",
    name: "Formal Dress Shirts",
    productionDate: "2024-02-10",
    encryptedQuantity: "0x5e9b3c1f7a4d2e8c6f9a1d5b3c7e2f8a",
    actualQuantity: 6340,
    brand: "Executive Attire",
    status: "verified" as const,
    category: "Formal Wear",
  },
];

interface GarmentBatchGridProps {
  isWalletConnected: boolean;
}

export const GarmentBatchGrid = ({ isWalletConnected }: GarmentBatchGridProps) => {
  return (
    <section className="py-16 bg-background">
      <div className="container mx-auto px-4">
        <div className="mb-12 text-center space-y-4">
          <h2 className="text-3xl md:text-4xl font-bold">Active Garment Batches</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Explore encrypted production batches from verified fashion brands. Connect your wallet to verify authenticity and decrypt production details.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mockBatches.map((batch) => (
            <GarmentBatchCard 
              key={batch.id} 
              batch={batch} 
              isWalletConnected={isWalletConnected}
            />
          ))}
        </div>
      </div>
    </section>
  );
};
