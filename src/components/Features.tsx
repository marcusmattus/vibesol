import { Wallet, Smartphone, Zap, Code, Cloud, DollarSign } from "lucide-react";
import { Card } from "@/components/ui/card";

const features = [
  {
    icon: Wallet,
    title: "Native Solana Integration",
    description: "Built-in wallet adapter, Solana Pay, and full web3.js support for seamless blockchain interactions.",
  },
  {
    icon: Smartphone,
    title: "Mobile-First Development",
    description: "Expo Go preview, instant hot reload, and automated app store deployment for iOS and Android.",
  },
  {
    icon: Zap,
    title: "AI-Powered Building",
    description: "Intelligent code generation, smart templates, and automated optimization for rapid development.",
  },
  {
    icon: Code,
    title: "Token Creation Suite",
    description: "Launch meme coins, create liquidity pools, and manage tokenomics with one-click deployment.",
  },
  {
    icon: Cloud,
    title: "Decentralized Backend",
    description: "Walrus storage integration, IPFS support, and on-chain data management without centralized servers.",
  },
  {
    icon: DollarSign,
    title: "Flexible Payments",
    description: "Accept SOL, USDC, or fiat with Stripe. Subscription management via RevenueCat integration.",
  },
];

const Features = () => {
  return (
    <section className="py-24 relative">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Everything You Need
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            A complete platform for building, deploying, and monetizing Solana mobile applications.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <Card
              key={index}
              className="p-6 hover:shadow-lg transition-all duration-300 hover:translate-y-[-4px] border-2 group"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <feature.icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
