import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { Button } from "@/components/ui";

export default function AuthButton() {
  const [user, setUser] = useState<any>(null);
  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser();
      setUser(data.user);
    };
    getUser();
    const { data: listener } = supabase.auth.onAuthStateChange(() => getUser());
    return () => { listener.subscription.unsubscribe(); };
  }, []);

  const signIn = async () => {
    await supabase.auth.signInWithOAuth({ provider: "google" });
  };
  const signOut = async () => {
    await supabase.auth.signOut();
  };

  if (user) {
    const displayName = user.user_metadata?.full_name || user.user_metadata?.name || user.email;
    return (
      <div className="flex items-center gap-2">
        <span>{displayName}</span>
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
