import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "@/contexts/UserContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { CalendarDays, Zap } from "lucide-react";

export default function Login() {
  const [username, setUsername] = useState("");
  const [role, setRole] = useState<"participant" | "organizer">("participant");
  const [loading, setLoading] = useState(false);
  const { login } = useUser();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) return;
    setLoading(true);
    const ok = await login(username, role);
    setLoading(false);
    if (ok) {
      toast.success(`Welcome, @${username.trim().toLowerCase()}!`);
      navigate("/");
    } else {
      toast.error("Something went wrong. Try again.");
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4">
      <div className="glass-card w-full max-w-md p-8 space-y-6 animate-fade-in">
        <div className="text-center space-y-2">
          <div className="mx-auto w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
            <Zap className="h-7 w-7 text-primary-foreground" />
          </div>
          <h1 className="font-display text-2xl font-bold">Fast Login</h1>
          <p className="text-sm text-muted-foreground">
            Enter a unique username to get started instantly
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">@</span>
              <Input
                id="username"
                className="pl-8"
                value={username}
                onChange={(e) => setUsername(e.target.value.replace(/\s/g, ""))}
                placeholder="yourname"
                required
                minLength={3}
                maxLength={24}
              />
            </div>
            <p className="text-xs text-muted-foreground">3-24 characters, no spaces. Returning? Just enter your username.</p>
          </div>

          <div className="space-y-2">
            <Label>I want to</Label>
            <div className="grid grid-cols-2 gap-3">
              {[
                { value: "participant" as const, label: "Attend Events", icon: CalendarDays },
                { value: "organizer" as const, label: "Host Events", icon: Zap },
              ].map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setRole(opt.value)}
                  className={`flex flex-col items-center gap-2 rounded-xl border p-4 text-sm font-medium transition-all ${
                    role === opt.value
                      ? "border-primary bg-primary/10 text-primary shadow-sm"
                      : "border-border hover:border-primary/40"
                  }`}
                >
                  <opt.icon className="h-5 w-5" />
                  {opt.label}
                </button>
              ))}
            </div>
            <p className="text-xs text-muted-foreground">Role only applies for new accounts</p>
          </div>

          <Button type="submit" className="w-full gradient-btn h-11" disabled={loading}>
            {loading ? "Entering..." : "Enter Eventix →"}
          </Button>
        </form>
      </div>
    </div>
  );
}
