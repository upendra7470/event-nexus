import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Skeleton } from "@/components/ui/skeleton";
import { Ticket, CalendarDays, MapPin } from "lucide-react";
import { format } from "date-fns";
import { Link } from "react-router-dom";

export default function ParticipantDashboard() {
  const { user } = useAuth();

  const { data: tickets, isLoading } = useQuery({
    queryKey: ["myTickets", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tickets")
        .select("*, events(*)")
        .eq("participant_username", user!.id)
        .order("booking_date", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-24 w-full rounded-xl" />)}
      </div>
    );
  }

  return (
    <div>
      <h2 className="font-display text-xl font-semibold mb-4 flex items-center gap-2">
        <Ticket className="h-5 w-5 text-primary" /> My Tickets
      </h2>
      {tickets && tickets.length > 0 ? (
        <div className="space-y-3">
          {tickets.map((t: any) => (
            <Link key={t.id} to={`/events/${t.event_id}`} className="block glass-card p-4 hover:scale-[1.01] transition-transform">
              <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <h3 className="font-display font-semibold truncate">{t.events?.title}</h3>
                  <div className="flex items-center gap-3 mt-1">
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <CalendarDays className="h-3.5 w-3.5" />
                      {t.events?.date ? format(new Date(t.events.date), "MMM d, yyyy") : "TBD"}
                    </p>
                    {t.events?.location && (
                      <p className="text-sm text-muted-foreground flex items-center gap-1 truncate">
                        <MapPin className="h-3.5 w-3.5 shrink-0" />
                        <span className="truncate">{t.events.location}</span>
                      </p>
                    )}
                  </div>
                </div>
                <span className="shrink-0 text-xs font-medium bg-accent/10 text-accent px-3 py-1 rounded-full">
                  Booked
                </span>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 text-muted-foreground">
          <Ticket className="h-12 w-12 mx-auto mb-3 opacity-30" />
          <p className="font-display">No tickets yet</p>
          <Link to="/" className="text-primary text-sm hover:underline mt-1 inline-block">Browse events →</Link>
        </div>
      )}
    </div>
  );
}
