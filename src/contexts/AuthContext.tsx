import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

interface SubscriptionInfo {
  subscribed: boolean;
  product_id?: string | null;
  subscription_end?: string | null;
  token_used?: number;
  token_limit?: number;
  token_extras?: number;
  webhook_used?: number;
  webhook_limit?: number;
  locked?: boolean;
  lock_reason?: string | null;
}

const ADMIN_EMAIL = "jadjiski.ia@gmail.com";

interface AuthContextType {
  session: Session | null;
  user: User | null;
  loading: boolean;
  subscription: SubscriptionInfo;
  isAdmin: boolean;
  checkSubscription: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [subscription, setSubscription] = useState<SubscriptionInfo>({ subscribed: false });

  const isAdmin = user?.email === ADMIN_EMAIL;

  const checkSubscription = useCallback(async () => {
    try {
      const { data, error } = await supabase.functions.invoke("check-subscription");
      if (!error && data) {
        const tokenTotal = (data.token_limit ?? 0) + (data.token_extras ?? 0);
        const tokensExhausted = tokenTotal > 0 && (data.token_used ?? 0) >= tokenTotal;
        const webhooksExhausted = (data.webhook_limit ?? 0) > 0 && (data.webhook_used ?? 0) >= (data.webhook_limit ?? 0);
        const locked = tokensExhausted || webhooksExhausted;
        let lock_reason: string | null = null;
        if (tokensExhausted) lock_reason = "tokens";
        else if (webhooksExhausted) lock_reason = "webhooks";

        setSubscription({
          subscribed: data.subscribed ?? false,
          product_id: data.product_id,
          subscription_end: data.subscription_end,
          token_used: data.token_used,
          token_limit: data.token_limit,
          token_extras: data.token_extras,
          webhook_used: data.webhook_used,
          webhook_limit: data.webhook_limit,
          locked,
          lock_reason,
        });
      }
    } catch (e) {
      console.error("Error checking subscription:", e);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    const { data: { subscription: authSub } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (!isMounted) return;
        setSession(session);
        setUser(session?.user ?? null);
        if (session?.user) {
          setTimeout(() => {
            void checkSubscription();
          }, 0);
        } else {
          setSubscription({ subscribed: false });
        }
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!isMounted) return;
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
      if (session?.user) {
        void checkSubscription();
      } else {
        setSubscription({ subscribed: false });
      }
    });

    return () => {
      isMounted = false;
      authSub.unsubscribe();
    };
  }, [checkSubscription]);

  useEffect(() => {
    if (!user) return;
    const interval = setInterval(checkSubscription, 60000);
    return () => clearInterval(interval);
  }, [user, checkSubscription]);

  const signOut = async () => {
    await supabase.auth.signOut();
    setSubscription({ subscribed: false });
  };

  return (
    <AuthContext.Provider value={{ session, user, loading, subscription, isAdmin, checkSubscription, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}
