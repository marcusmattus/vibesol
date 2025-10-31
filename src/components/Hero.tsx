import { Button } from "@/components/ui/button";
import { Sparkles, Rocket, Zap } from "lucide-react";

const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Animated gradient background */}
      <div className="absolute inset-0 gradient-sunset animate-gradient -z-10" />
      
      {/* Floating orbs */}
      <div className="absolute top-20 left-10 w-32 h-32 bg-primary/20 rounded-full blur-3xl animate-float" />
      <div className="absolute bottom-20 right-10 w-40 h-40 bg-secondary/20 rounded-full blur-3xl animate-float" style={{ animationDelay: "2s" }} />
      <div className="absolute top-1/2 left-1/3 w-24 h-24 bg-accent/20 rounded-full blur-3xl animate-float" style={{ animationDelay: "4s" }} />

      <div className="container mx-auto px-4 z-10">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 glass-effect px-4 py-2 rounded-full text-sm font-medium animate-fade-in">
            <Sparkles className="w-4 h-4 text-primary" />
            <span>AI-Powered Solana Mobile Development</span>
          </div>

          {/* Main heading */}
          <h1 className="text-5xl md:text-7xl font-bold leading-tight animate-fade-in text-white drop-shadow-2xl" style={{ animationDelay: "0.1s" }}>
            Build Solana dApps
            <br />
            <span className="bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">
              At Lightning Speed
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-xl md:text-2xl text-white/90 max-w-2xl mx-auto animate-fade-in drop-shadow-lg" style={{ animationDelay: "0.2s" }}>
            Create, preview, and deploy mobile dApps with AI assistance. 
            From token creation to app store deployment—all in one platform.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-fade-in" style={{ animationDelay: "0.3s" }}>
            <Button 
              size="lg" 
              className="bg-white text-primary hover:bg-white/90 shadow-2xl text-lg px-8 py-6 rounded-xl group"
            >
              <Rocket className="w-5 h-5 mr-2 group-hover:translate-y-[-2px] transition-transform" />
              Start Building
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              className="glass-effect text-white border-white/30 hover:bg-white/10 text-lg px-8 py-6 rounded-xl"
            >
              <Zap className="w-5 h-5 mr-2" />
              View Demo
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-8 max-w-2xl mx-auto pt-12 animate-fade-in" style={{ animationDelay: "0.4s" }}>
            <div className="glass-effect p-6 rounded-2xl">
              <div className="text-3xl md:text-4xl font-bold text-white mb-2">10K+</div>
              <div className="text-sm text-white/80">Apps Built</div>
            </div>
            <div className="glass-effect p-6 rounded-2xl">
              <div className="text-3xl md:text-4xl font-bold text-white mb-2">50K+</div>
              <div className="text-sm text-white/80">Developers</div>
            </div>
            <div className="glass-effect p-6 rounded-2xl">
              <div className="text-3xl md:text-4xl font-bold text-white mb-2">$2M+</div>
              <div className="text-sm text-white/80">Deployed</div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
    </section>
  );
};

export default Hero;
