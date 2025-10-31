import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Check } from "lucide-react";

const plans = [
  {
    name: "Pay-As-You-Go",
    price: "$0",
    period: "start free",
    description: "Only pay for what you use",
    features: [
      "Claude Sonnet 4.5: $3/M input",
      "Gemini Flash: $0.075/M tokens",
      "Gemini Pro: $1.25/M tokens",
      "No monthly fees",
      "Full feature access",
    ],
    highlighted: true,
  },
  {
    name: "Starter Pack",
    price: "$10",
    period: "one-time",
    description: "Perfect to get started",
    features: [
      "~333K Claude input tokens",
      "~133K Gemini Flash tokens",
      "~8K Gemini Pro tokens",
      "Never expires",
      "Add more anytime",
    ],
  },
  {
    name: "Pro Bundle",
    price: "$50",
    period: "one-time",
    description: "For serious builders",
    features: [
      "~1.6M Claude input tokens",
      "~666K Gemini Flash tokens",
      "~40K Gemini Pro tokens",
      "Priority processing",
      "Email support",
    ],
  },
];

const Pricing = () => {
  return (
    <section className="py-24 relative gradient-sunset-soft">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Simple, Transparent Pricing
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Choose the plan that fits your needs. Pay with SOL, USDC, or fiat.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan, index) => (
            <Card
              key={index}
              className={`p-8 relative ${
                plan.highlighted
                  ? "border-primary border-2 shadow-xl scale-105"
                  : ""
              }`}
            >
              {plan.highlighted && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground px-4 py-1 rounded-full text-sm font-medium">
                  Most Popular
                </div>
              )}

              <div className="mb-6">
                <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                <p className="text-muted-foreground text-sm mb-4">
                  {plan.description}
                </p>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  <span className="text-muted-foreground">/{plan.period}</span>
                </div>
              </div>

              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <Button
                className={`w-full ${
                  plan.highlighted
                    ? "gradient-sunset text-white hover:opacity-90"
                    : ""
                }`}
                variant={plan.highlighted ? "default" : "outline"}
                size="lg"
              >
                {plan.price === "Custom" ? "Contact Sales" : "Get Started"}
              </Button>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Pricing;
