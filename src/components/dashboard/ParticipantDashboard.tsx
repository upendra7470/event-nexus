import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Skeleton } from "@/components/ui/skeleton";
import { Ticket, CalendarDays } from "lucide-react";
import { format } from "date-fns";
import { Link } from "react-router-dom";

export default function ParticipantDashboard() {
  const { user } = useAuth();

  const { data: bookings, isLoading } = useQuery({
    queryKey: ["myBookings", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("bookings")
        .select("*, events(*)")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-24 w-full rounded-xl" />
        ))}
      </div>
    );
  }

  return (
    <div>
      <h2 className="font-display text-xl font-semibold mb-4 flex items-center gap-2">
        <Ticket className="h-5 w-5 text-primary" /> My Tickets
      </h2>
      {bookings && bookings.length > 0 ? (
        <div className="space-y-3">
          {bookings.map((b: any) => (
            <Link key={b.id} to={`/events/${b.event_id}`} className="block glass-card p-4 hover:scale-[1.01] transition-transform">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-display font-semibold">{b.events?.title}</h3>
                  <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                    <CalendarDays className="h-3.5 w-3.5" />
                    {b.events?.date ? format(new Date(b.events.date), "MMM d, yyyy · h:mm a") : "TBD"}
                  </p>
                </div>
                <span className={`text-xs font-medium px-3 py-1 rounded-full ${b.status === "confirmed" ? "bg-accent/10 text-accent" : "bg-muted text-muted-foreground"}`}>
                  {b.status}
                </span>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 text-muted-foreground">
          <Ticket className="h-12 w-12 mx-auto mb-3 opacity-30" />
          <p>No tickets yet</p>
          <Link to="/" className="text-primary text-sm hover:underline mt-1 inline-block">Browse events</Link>
        </div>
      )}
    </div>
  );
}
