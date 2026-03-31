import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { CalendarDays, LogOut, LayoutDashboard, Menu, X } from "lucide-react";
import { useState } from "react";

export default function Navbar() {
  const { user, role, signOut } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <nav className="sticky top-0 z-50 glass-card border-b">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2 font-display text-xl font-bold">
          <CalendarDays className="h-6 w-6 text-primary" />
          <span className="gradient-text">Eventix</span>
        </Link>

        {/* Desktop */}
        <div className="hidden items-center gap-4 md:flex">
          <Link to="/" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Events</Link>
          {user && (
            <Link to="/dashboard" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1">
              <LayoutDashboard className="h-4 w-4" /> Dashboard
            </Link>
          )}
          {user ? (
            <div className="flex items-center gap-3">
              <span className="text-xs rounded-full bg-primary/10 text-primary px-3 py-1 font-medium capitalize">{role}</span>
              <Button variant="ghost" size="sm" onClick={handleSignOut}>
                <LogOut className="h-4 w-4 mr-1" /> Sign out
              </Button>
            </div>
          ) : (
            <Link to="/auth">
              <Button size="sm">Sign in</Button>
            </Link>
          )}
        </div>

        {/* Mobile toggle */}
        <button className="md:hidden" onClick={() => setOpen(!open)}>
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden glass-card border-t px-4 pb-4 space-y-3">
          <Link to="/" onClick={() => setOpen(false)} className="block text-sm font-medium py-2">Events</Link>
          {user && (
            <Link to="/dashboard" onClick={() => setOpen(false)} className="block text-sm font-medium py-2">Dashboard</Link>
          )}
          {user ? (
            <Button variant="ghost" size="sm" className="w-full justify-start" onClick={() => { handleSignOut(); setOpen(false); }}>
              <LogOut className="h-4 w-4 mr-1" /> Sign out
            </Button>
          ) : (
            <Link to="/auth" onClick={() => setOpen(false)}>
              <Button size="sm" className="w-full">Sign in</Button>
            </Link>
          )}
        </div>
      )}
    </nav>
  );
}
