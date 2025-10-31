import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { LogOut, Coins } from "lucide-react";
import AIChat from "@/components/AIChat";

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
    <div className="flex flex-col h-screen bg-background">
      {/* Minimal Header */}
      <header className="border-b backdrop-blur-sm bg-background/80 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded gradient-sunset" />
              <h1 className="text-lg font-semibold">AI Builder</h1>
            </div>

            <div className="flex items-center gap-2">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => navigate('/usage')}
                className="text-xs"
              >
                <Coins className="w-3 h-3 mr-1" />
                Usage
              </Button>
              <WalletMultiButton />
              <Button variant="ghost" size="icon" onClick={handleSignOut}>
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Chat Interface - Full Height */}
      <main className="flex-1 overflow-hidden">
        <AIChat userId={user.id} />
      </main>
    </div>
  );
};

export default Dashboard;
