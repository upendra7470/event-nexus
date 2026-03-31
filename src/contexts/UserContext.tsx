import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";

type UserRole = "participant" | "organizer" | "admin";

interface UserData {
  id: string;
  username: string;
  role: UserRole;
}

interface UserContextType {
  currentUser: UserData | null;
  loading: boolean;
  login: (username: string, role: UserRole) => Promise<boolean>;
  logout: () => void;
}

const UserContext = createContext<UserContextType>({
  currentUser: null,
  loading: true,
  login: async () => false,
  logout: () => {},
});

export const useUser = () => useContext(UserContext);

export function UserProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem("eventix_user");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        // Verify user still exists in DB
        supabase
          .from("users")
          .select("*")
          .eq("username", parsed.username)
          .single()
          .then(({ data }) => {
            if (data) {
              setCurrentUser(data as UserData);
            } else {
              localStorage.removeItem("eventix_user");
            }
            setLoading(false);
          });
      } catch {
        localStorage.removeItem("eventix_user");
        setLoading(false);
      }
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (username: string, role: UserRole): Promise<boolean> => {
    const trimmed = username.trim().toLowerCase();
    if (!trimmed) return false;

    // Try to find existing user
    const { data: existing } = await supabase
      .from("users")
      .select("*")
      .eq("username", trimmed)
      .single();

    if (existing) {
      const user = existing as UserData;
      setCurrentUser(user);
      localStorage.setItem("eventix_user", JSON.stringify(user));
      return true;
    }

    // Create new user
    const { data: created, error } = await supabase
      .from("users")
      .insert({ username: trimmed, role })
      .select()
      .single();

    if (error || !created) return false;

    const user = created as UserData;
    setCurrentUser(user);
    localStorage.setItem("eventix_user", JSON.stringify(user));
    return true;
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem("eventix_user");
  };

  return (
    <UserContext.Provider value={{ currentUser, loading, login, logout }}>
      {children}
    </UserContext.Provider>
  );
}
