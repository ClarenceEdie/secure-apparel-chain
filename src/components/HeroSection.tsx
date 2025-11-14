import { Shield, Lock, Verified } from "lucide-react";
import { Button } from "@/components/ui/button";
import heroBg from "@/assets/hero-bg.jpg";

export const HeroSection = () => {
  return (
    <section className="relative min-h-[600px] flex items-center justify-center overflow-hidden">
      {/* Background with overlay */}
      <div className="absolute inset-0">
        <img 
          src={heroBg} 
          alt="Hero background" 
          className="w-full h-full object-cover opacity-30"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/50 via-background/80 to-background" />
      </div>

      {/* Content */}
      <div className="container relative z-10 px-4 py-20">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <div className="space-y-4">
            <h1 className="text-5xl md:text-7xl font-bold bg-clip-text text-transparent bg-gradient-primary animate-in fade-in slide-in-from-bottom-4 duration-1000">
              Trace Fashion, Protect Data
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-150">
              Secure blockchain authentication for fashion brands. Upload encrypted production data, protect your business intelligence, and let buyers verify authenticity.
            </p>
          </div>

          <div className="flex flex-wrap gap-4 justify-center animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-300">
            <Button variant="hero" size="lg">
              <Shield className="h-5 w-5" />
              Upload Batch
            </Button>
            <Button variant="outline" size="lg">
              <Verified className="h-5 w-5" />
              Verify Authenticity
            </Button>
          </div>

          {/* Features */}
          <div className="grid md:grid-cols-3 gap-6 pt-12 animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-500">
            <div className="flex flex-col items-center gap-3 p-6 rounded-lg bg-card border border-border hover:border-primary transition-all duration-300">
              <div className="p-3 rounded-full bg-gradient-primary">
                <Lock className="h-6 w-6 text-primary-foreground" />
              </div>
              <h3 className="font-semibold text-lg">Encrypted Data</h3>
              <p className="text-sm text-muted-foreground">
                Production quantities secured with blockchain encryption
              </p>
            </div>

            <div className="flex flex-col items-center gap-3 p-6 rounded-lg bg-card border border-border hover:border-primary transition-all duration-300">
              <div className="p-3 rounded-full bg-gradient-primary">
                <Shield className="h-6 w-6 text-primary-foreground" />
              </div>
              <h3 className="font-semibold text-lg">Competitor Protection</h3>
              <p className="text-sm text-muted-foreground">
                Keep sensitive business data hidden from competitors
              </p>
            </div>

            <div className="flex flex-col items-center gap-3 p-6 rounded-lg bg-card border border-border hover:border-primary transition-all duration-300">
              <div className="p-3 rounded-full bg-gradient-primary">
                <Verified className="h-6 w-6 text-primary-foreground" />
              </div>
              <h3 className="font-semibold text-lg">Buyer Verification</h3>
              <p className="text-sm text-muted-foreground">
                Enable customers to verify product authenticity instantly
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
