import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Send, Sparkles } from "lucide-react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface AIChatProps {
  userId: string;
}

const AIChat = ({ userId }: AIChatProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [model, setModel] = useState("claude-sonnet-4-5");
  const [totalCost, setTotalCost] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMessage: Message = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke("ai-chat", {
        body: {
          messages: [...messages, userMessage],
          model: model,
          userId: userId,
        },
      });

      if (error) throw error;

      const assistantMessage: Message = {
        role: "assistant",
        content: data.choices[0].message.content,
      };

      setMessages((prev) => [...prev, assistantMessage]);

      // Update cost tracking
      if (data.cost) {
        setTotalCost((prev) => prev + data.cost.cost_usd);
        
        // Save to database
        await supabase.from("token_usage").insert({
          user_id: userId,
          model: model,
          prompt_tokens: data.cost.input_tokens,
          completion_tokens: data.cost.output_tokens,
          total_tokens: data.cost.total_tokens,
          cost_usd: data.cost.cost_usd,
        });
      }
    } catch (error: any) {
      console.error("Error sending message:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to send message",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Model selector bar */}
      <div className="border-b px-6 py-3 bg-muted/20 flex items-center justify-between">
        <Select value={model} onValueChange={setModel}>
          <SelectTrigger className="w-[260px] h-9 text-sm border-0 bg-background/80">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="claude-sonnet-4-5">Claude Sonnet 4.5 • Best for Code</SelectItem>
            <SelectItem value="google/gemini-2.5-flash">Gemini Flash • Fast & Cheap</SelectItem>
            <SelectItem value="google/gemini-2.5-pro">Gemini Pro • Powerful</SelectItem>
            <SelectItem value="openai/gpt-5">GPT-5 • Premium</SelectItem>
          </SelectContent>
        </Select>
        
        {totalCost > 0 && (
          <div className="text-xs text-muted-foreground">
            ${totalCost.toFixed(4)}
          </div>
        )}
      </div>

      {/* Chat messages */}
      <ScrollArea className="flex-1 px-4">
        <div className="max-w-4xl mx-auto py-8 space-y-6">
          {messages.length === 0 && (
            <div className="text-center py-20 space-y-3">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 mx-auto flex items-center justify-center">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-3xl font-bold">What would you like to build?</h2>
              <p className="text-muted-foreground max-w-md mx-auto">
                I'm your AI coding assistant. Describe your app idea and I'll help you build it with clean, production-ready code.
              </p>
            </div>
          )}
          
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex gap-4 ${message.role === "user" ? "justify-end" : "justify-start"}`}
            >
              {message.role === "assistant" && (
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex-shrink-0 flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
              )}
              
              <div
                className={`flex-1 max-w-3xl rounded-2xl px-5 py-4 ${
                  message.role === "user"
                    ? "bg-primary text-primary-foreground ml-12"
                    : "bg-muted/60 mr-12"
                }`}
              >
                <p className="text-[15px] leading-relaxed whitespace-pre-wrap">{message.content}</p>
              </div>
              
              {message.role === "user" && (
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex-shrink-0" />
              )}
            </div>
          ))}
          
          {loading && (
            <div className="flex gap-4">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex-shrink-0 animate-pulse flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div className="bg-muted/60 rounded-2xl px-5 py-4 mr-12">
                <div className="flex gap-1">
                  <div className="w-2 h-2 rounded-full bg-foreground/30 animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-2 h-2 rounded-full bg-foreground/30 animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-2 h-2 rounded-full bg-foreground/30 animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}
          
          <div ref={scrollRef} />
        </div>
      </ScrollArea>

      {/* Input area */}
      <div className="border-t px-4 py-4 bg-background">
        <div className="max-w-4xl mx-auto">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              sendMessage();
            }}
            className="flex gap-3"
          >
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Describe what you want to build..."
              disabled={loading}
              className="flex-1 h-12 px-5 rounded-xl border-muted-foreground/20 focus-visible:ring-1 text-[15px]"
            />
            <Button 
              type="submit" 
              disabled={loading || !input.trim()}
              size="lg"
              className="rounded-xl px-6 h-12"
            >
              <Send className="w-5 h-5" />
            </Button>
          </form>
          <p className="text-xs text-muted-foreground text-center mt-2">
            Powered by {model === 'claude-sonnet-4-5' ? 'Claude Sonnet 4.5' : model.includes('gemini') ? 'Google Gemini' : 'OpenAI GPT-5'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default AIChat;
