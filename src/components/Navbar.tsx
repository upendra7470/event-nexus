import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { CalendarDays, LogOut, LayoutDashboard, Menu, X, PlusCircle } from "lucide-react";
import { useState } from "react";

export default function Navbar() {
  const { profile, signOut } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const handleLogout = async () => {
    await signOut();
    navigate("/");
  };

  const isOrganizer = profile?.role === "organizer" || profile?.role === "admin";

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
          {profile && (
            <>
              <Link to="/dashboard" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1">
                <LayoutDashboard className="h-4 w-4" /> Dashboard
              </Link>
              {isOrganizer && (
                <Link to="/host" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1">
                  <PlusCircle className="h-4 w-4" /> Host Event
                </Link>
              )}
            </>
          )}
          {profile ? (
            <div className="flex items-center gap-3">
              <span className="text-xs rounded-full bg-primary/10 text-primary px-3 py-1 font-medium">{profile.full_name || profile.email}</span>
              <span className="text-xs rounded-full bg-accent/10 text-accent px-2 py-1 font-medium capitalize">{profile.role}</span>
              <Button variant="ghost" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-1" /> Sign Out
              </Button>
            </div>
          ) : (
            <Link to="/login">
              <Button size="sm" className="gradient-btn">Sign In</Button>
            </Link>
          )}
        </div>

        {/* Mobile toggle */}
        <button className="md:hidden" onClick={() => setOpen(!open)}>
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {open && (
        <div className="md:hidden glass-card border-t px-4 pb-4 space-y-3">
          <Link to="/" onClick={() => setOpen(false)} className="block text-sm font-medium py-2">Events</Link>
          {profile && (
            <>
              <Link to="/dashboard" onClick={() => setOpen(false)} className="block text-sm font-medium py-2">Dashboard</Link>
              {isOrganizer && (
                <Link to="/host" onClick={() => setOpen(false)} className="block text-sm font-medium py-2">Host Event</Link>
              )}
            </>
          )}
          {profile ? (
            <Button variant="ghost" size="sm" className="w-full justify-start" onClick={() => { handleLogout(); setOpen(false); }}>
              <LogOut className="h-4 w-4 mr-1" /> Sign Out
            </Button>
          ) : (
            <Link to="/login" onClick={() => setOpen(false)}>
              <Button size="sm" className="w-full gradient-btn">Sign In</Button>
            </Link>
          )}
        </div>
      )}
    </nav>
  );
}
