import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { Button } from "@/components/ui";

export default function AuthButton() {
  const [user, setUser] = useState<any>(null);
  const navigate = useNavigate();
  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser();
      setUser(data.user);
    };
    getUser();
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => { listener.subscription.unsubscribe(); };
  }, []);

  const signIn = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { queryParams: { prompt: "select_account" } }
    });
  };
  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    navigate("/");
  };

  if (user) {
    const displayName = user.user_metadata?.full_name || user.user_metadata?.name || user.email;
    return (
      <div className="flex items-center gap-2">
        <span>ようこそ、{displayName} さん</span>
        <Button variant="outline" onClick={signOut}>ログアウト</Button>
      </div>
    );
  }
  return (
    <Button onClick={signIn} variant="outline">
      Googleでログイン
    </Button>
  );
}
