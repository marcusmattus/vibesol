import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Coins, TrendingUp, Calendar } from "lucide-react";

interface TokenUsageProps {
  userId: string;
}

interface Usage {
  id: string;
  model: string;
  total_tokens: number;
  cost_usd: number;
  created_at: string;
}

const TokenUsage = ({ userId }: TokenUsageProps) => {
  const [usage, setUsage] = useState<Usage[]>([]);
  const [totalCost, setTotalCost] = useState(0);
  const [totalTokens, setTotalTokens] = useState(0);

  useEffect(() => {
    loadUsage();
  }, [userId]);

  const loadUsage = async () => {
    const { data, error } = await supabase
      .from("token_usage")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(50);

    if (error) {
      console.error("Error loading usage:", error);
    } else if (data) {
      setUsage(data);
      
      const cost = data.reduce((sum, item) => sum + Number(item.cost_usd), 0);
      const tokens = data.reduce((sum, item) => sum + item.total_tokens, 0);
      
      setTotalCost(cost);
      setTotalTokens(tokens);
    }
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid md:grid-cols-3 gap-6">
        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
              <Coins className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Cost</p>
              <p className="text-2xl font-bold">${totalCost.toFixed(4)}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-secondary/10 flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-secondary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Tokens</p>
              <p className="text-2xl font-bold">{totalTokens.toLocaleString()}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center">
              <Calendar className="w-6 h-6 text-accent" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Requests</p>
              <p className="text-2xl font-bold">{usage.length}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Usage History */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Usage History</h3>
        
        <ScrollArea className="h-[400px]">
          <div className="space-y-3">
            {usage.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Coins className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No usage data yet</p>
                <p className="text-sm">Start chatting with AI to see your token usage</p>
              </div>
            ) : (
              usage.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                >
                  <div className="flex-1">
                    <p className="font-medium text-sm">{item.model}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(item.created_at).toLocaleString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{item.total_tokens.toLocaleString()} tokens</p>
                    <p className="text-sm text-muted-foreground">
                      ${Number(item.cost_usd).toFixed(6)}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </Card>

      {/* Pricing Info */}
      <Card className="p-6 bg-muted/30">
        <h3 className="text-lg font-semibold mb-4">Model Pricing (per 1M tokens)</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span>Gemini Flash</span>
            <span className="font-mono">$0.075 / $0.30</span>
          </div>
          <div className="flex justify-between">
            <span>Gemini Pro</span>
            <span className="font-mono">$1.25 / $5.00</span>
          </div>
          <div className="flex justify-between">
            <span>GPT-5</span>
            <span className="font-mono">$2.50 / $10.00</span>
          </div>
          <p className="text-xs text-muted-foreground mt-4">
            * Prices shown as: Input / Output per million tokens
          </p>
        </div>
      </Card>
    </div>
  );
};

export default TokenUsage;
