import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { Users, CalendarDays, Ticket } from "lucide-react";

export default function AdminDashboard() {
  const { data: profiles, isLoading: loadingProfiles } = useQuery({
    queryKey: ["allProfiles"],
    queryFn: async () => {
      const { data, error } = await supabase.from("profiles").select("*, user_roles(role)");
      if (error) throw error;
      return data;
    },
  });

  const { data: events, isLoading: loadingEvents } = useQuery({
    queryKey: ["allEvents"],
    queryFn: async () => {
      const { data, error } = await supabase.from("events").select("*").order("date", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const { data: bookings, isLoading: loadingBookings } = useQuery({
    queryKey: ["allBookings"],
    queryFn: async () => {
      const { data, error } = await supabase.from("bookings").select("*");
      if (error) throw error;
      return data;
    },
  });

  const loading = loadingProfiles || loadingEvents || loadingBookings;

  if (loading) {
    return <div className="space-y-4">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-32 w-full rounded-xl" />)}</div>;
  }

  return (
    <div className="space-y-8">
      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { label: "Total Users", value: profiles?.length ?? 0, icon: Users, color: "text-primary" },
          { label: "Total Events", value: events?.length ?? 0, icon: CalendarDays, color: "text-accent" },
          { label: "Total Bookings", value: bookings?.length ?? 0, icon: Ticket, color: "text-primary" },
        ].map((s) => (
          <div key={s.label} className="glass-card p-6 text-center">
            <s.icon className={`h-8 w-8 mx-auto mb-2 ${s.color}`} />
            <p className="font-display text-3xl font-bold">{s.value}</p>
            <p className="text-sm text-muted-foreground">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Users */}
      <div>
        <h2 className="font-display text-xl font-semibold mb-4">All Users</h2>
        <div className="glass-card divide-y divide-border">
          {profiles?.map((p: any) => (
            <div key={p.id} className="flex items-center justify-between p-4">
              <div>
                <p className="font-medium">{p.full_name || "No name"}</p>
                <p className="text-sm text-muted-foreground">{p.email}</p>
              </div>
              <span className="text-xs font-medium capitalize bg-primary/10 text-primary px-3 py-1 rounded-full">
                {p.user_roles?.[0]?.role || "participant"}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Events */}
      <div>
        <h2 className="font-display text-xl font-semibold mb-4">All Events</h2>
        <div className="glass-card divide-y divide-border">
          {events?.map((ev) => (
            <div key={ev.id} className="flex items-center justify-between p-4">
              <div>
                <p className="font-medium">{ev.title}</p>
                <p className="text-sm text-muted-foreground">{ev.location || "No location"}</p>
              </div>
              <span className="text-sm text-muted-foreground">{new Date(ev.date).toLocaleDateString()}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
