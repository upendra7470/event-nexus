import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useUser } from "@/contexts/UserContext";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { Trash2, Users, CalendarDays, Eye, EyeOff } from "lucide-react";
import { format } from "date-fns";
import { useState } from "react";
import { Link } from "react-router-dom";

export default function OrganizerDashboard() {
  const { currentUser } = useUser();
  const qc = useQueryClient();
  const [viewAttendeesId, setViewAttendeesId] = useState<string | null>(null);

  const { data: events, isLoading } = useQuery({
    queryKey: ["myOrgEvents", currentUser?.username],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("events")
        .select("*")
        .eq("organizer_username", currentUser!.username)
        .order("date", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!currentUser,
  });

  const { data: attendees } = useQuery({
    queryKey: ["eventAttendees", viewAttendeesId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tickets")
        .select("*, users!tickets_participant_username_fkey(username, role)")
        .eq("event_id", viewAttendeesId!);
      if (error) throw error;
      return data;
    },
    enabled: !!viewAttendeesId,
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("events").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Event deleted");
      qc.invalidateQueries({ queryKey: ["myOrgEvents"] });
      qc.invalidateQueries({ queryKey: ["events"] });
    },
    onError: (err: Error) => toast.error(err.message),
  });

  if (isLoading) {
    return <div className="space-y-4">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-24 w-full rounded-xl" />)}</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-xl font-semibold">My Hosted Events</h2>
        <Link to="/host">
          <Button className="gradient-btn">+ New Event</Button>
        </Link>
      </div>

      {events && events.length > 0 ? (
        <div className="space-y-3">
          {events.map((ev) => (
            <div key={ev.id} className="glass-card p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <h3 className="font-display font-semibold truncate">{ev.title}</h3>
                  <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <CalendarDays className="h-3.5 w-3.5" />
                      {format(new Date(ev.date), "MMM d, yyyy")}
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="h-3.5 w-3.5" />
                      {ev.available_slots}/{ev.capacity} left
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setViewAttendeesId(viewAttendeesId === ev.id ? null : ev.id)}
                  >
                    {viewAttendeesId === ev.id ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => deleteMutation.mutate(ev.id)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </div>
              {viewAttendeesId === ev.id && (
                <div className="mt-4 pt-4 border-t border-border">
                  <h4 className="text-sm font-medium mb-2">Registered Attendees</h4>
                  {attendees && attendees.length > 0 ? (
                    <div className="space-y-2">
                      {attendees.map((a: any) => (
                        <div key={a.id} className="flex justify-between text-sm bg-secondary/50 rounded-lg px-3 py-2">
                          <span>@{a.participant_username}</span>
                          <span className="text-muted-foreground text-xs">{format(new Date(a.booking_date), "MMM d")}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">No attendees yet</p>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 text-muted-foreground">
          <CalendarDays className="h-12 w-12 mx-auto mb-3 opacity-30" />
          <p className="font-display">No events hosted yet</p>
          <Link to="/host" className="text-primary text-sm hover:underline mt-1 inline-block">Create your first event →</Link>
        </div>
      )}
    </div>
  );
}
