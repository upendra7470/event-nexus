import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { CalendarDays, MapPin, DollarSign, Users, ArrowLeft, Ticket } from "lucide-react";
import { format } from "date-fns";

export default function EventDetails() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const qc = useQueryClient();

  const { data: event, isLoading } = useQuery({
    queryKey: ["event", id],
    queryFn: async () => {
      const { data, error } = await supabase.from("events").select("*").eq("id", id!).single();
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  const { data: bookingCount } = useQuery({
    queryKey: ["bookingCount", id],
    queryFn: async () => {
      const { count, error } = await supabase.from("bookings").select("*", { count: "exact", head: true }).eq("event_id", id!).eq("status", "confirmed");
      if (error) throw error;
      return count ?? 0;
    },
    enabled: !!id,
  });

  const { data: existingBooking } = useQuery({
    queryKey: ["myBooking", id, user?.id],
    queryFn: async () => {
      const { data, error } = await supabase.from("bookings").select("*").eq("event_id", id!).eq("user_id", user!.id).maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!id && !!user,
  });

  const bookMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("bookings").insert({ user_id: user!.id, event_id: id! });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("🎉 Booking confirmed! See you there.");
      qc.invalidateQueries({ queryKey: ["bookingCount", id] });
      qc.invalidateQueries({ queryKey: ["myBooking", id] });
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const spotsLeft = event ? (event.capacity ?? 100) - (bookingCount ?? 0) : 0;

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-12 max-w-4xl space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="aspect-[2/1] w-full rounded-xl" />
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <p className="text-lg text-muted-foreground">Event not found</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl animate-fade-in">
      <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors">
        <ArrowLeft className="h-4 w-4" /> Back
      </button>

      <div className="glass-card overflow-hidden">
        <div className="aspect-[2.5/1] overflow-hidden bg-muted">
          {event.image_url ? (
            <img src={event.image_url} alt={event.title} className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/20 to-accent/20">
              <CalendarDays className="h-20 w-20 text-muted-foreground/30" />
            </div>
          )}
        </div>

        <div className="p-6 md:p-10 space-y-6">
          <h1 className="font-display text-3xl md:text-4xl font-bold">{event.title}</h1>

          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5 bg-secondary px-3 py-1.5 rounded-full">
              <CalendarDays className="h-4 w-4 text-primary" />
              {format(new Date(event.date), "EEEE, MMMM d, yyyy · h:mm a")}
            </span>
            {event.location && (
              <span className="flex items-center gap-1.5 bg-secondary px-3 py-1.5 rounded-full">
                <MapPin className="h-4 w-4 text-primary" />
                {event.location}
              </span>
            )}
            <span className="flex items-center gap-1.5 bg-secondary px-3 py-1.5 rounded-full">
              <Users className="h-4 w-4 text-primary" />
              {spotsLeft} spots left
            </span>
          </div>

          {event.description && (
            <p className="text-muted-foreground leading-relaxed whitespace-pre-line">{event.description}</p>
          )}

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-4 border-t border-border">
            <div className="font-display text-2xl font-bold">
              {Number(event.price) > 0 ? (
                <span className="flex items-center gap-1"><DollarSign className="h-6 w-6" />{Number(event.price)}</span>
              ) : (
                <span className="text-accent">Free</span>
              )}
            </div>

            {existingBooking ? (
              <div className="flex items-center gap-2 text-accent font-medium">
                <Ticket className="h-5 w-5" /> You're booked!
              </div>
            ) : user ? (
              <Button
                onClick={() => bookMutation.mutate()}
                disabled={bookMutation.isPending || spotsLeft <= 0}
                className="gradient-btn px-8 py-3"
              >
                {spotsLeft <= 0 ? "Sold out" : bookMutation.isPending ? "Booking..." : "Book Now"}
              </Button>
            ) : (
              <Button onClick={() => navigate("/auth")} className="gradient-btn px-8 py-3">
                Sign in to book
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
