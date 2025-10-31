import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { LogOut, MessageSquare, Code, Coins } from "lucide-react";
import AIChat from "@/components/AIChat";
import ProjectBuilder from "@/components/ProjectBuilder";
import TokenUsage from "@/components/TokenUsage";

const Dashboard = () => {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const navigate = useNavigate();
  const { toast } = useToast();
  const wallet = useWallet();

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate("/auth");
      } else {
        setUser(session.user);
        loadProfile(session.user.id);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        navigate("/auth");
      } else {
        setUser(session.user);
        loadProfile(session.user.id);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  // Sync wallet address to profile
  useEffect(() => {
    if (wallet.publicKey && user) {
      updateWalletAddress(wallet.publicKey.toBase58());
    }
  }, [wallet.publicKey, user]);

  const loadProfile = async (userId: string) => {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .maybeSingle();

    if (error) {
      console.error("Error loading profile:", error);
    } else {
      setProfile(data);
    }
  };

  const updateWalletAddress = async (walletAddress: string) => {
    if (!user) return;

    const { error } = await supabase
      .from("profiles")
      .update({ wallet_address: walletAddress })
      .eq("id", user.id);

    if (error) {
      console.error("Error updating wallet:", error);
    } else {
      setProfile({ ...profile, wallet_address: walletAddress });
      toast({
        title: "Wallet Connected",
        description: "Your Solana wallet has been linked to your account.",
      });
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b glass-effect sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg gradient-sunset" />
              <div>
                <h1 className="text-xl font-bold">SolanaBuilder</h1>
                <p className="text-sm text-muted-foreground">
                  {profile?.username || user.email}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <WalletMultiButton />
              <Button variant="ghost" size="icon" onClick={handleSignOut}>
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <Tabs defaultValue="chat" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 lg:w-[400px]">
            <TabsTrigger value="chat" className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              AI Chat
            </TabsTrigger>
            <TabsTrigger value="builder" className="flex items-center gap-2">
              <Code className="w-4 h-4" />
              Builder
            </TabsTrigger>
            <TabsTrigger value="usage" className="flex items-center gap-2">
              <Coins className="w-4 h-4" />
              Usage
            </TabsTrigger>
          </TabsList>

          <TabsContent value="chat">
            <AIChat userId={user.id} />
          </TabsContent>

          <TabsContent value="builder">
            <ProjectBuilder userId={user.id} />
          </TabsContent>

          <TabsContent value="usage">
            <TokenUsage userId={user.id} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Dashboard;
