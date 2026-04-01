import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { toast } from "sonner";
import { CalendarDays, MapPin, DollarSign, Users, ArrowLeft, Ticket, CheckCircle2 } from "lucide-react";
import { format } from "date-fns";
import { useState } from "react";

export default function EventDetails() {
  const { id } = useParams<{ id: string }>();
  const { profile, user } = useAuth();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const { data: event, isLoading } = useQuery({
    queryKey: ["event", id],
    queryFn: async () => {
      const { data, error } = await supabase.from("events").select("*").eq("id", id!).single();
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  const { data: existingTicket } = useQuery({
    queryKey: ["myTicket", id, user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tickets")
        .select("*")
        .eq("event_id", id!)
        .eq("participant_username", user!.id)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!id && !!user,
  });

  const bookMutation = useMutation({
    mutationFn: async () => {
      const { error: ticketErr } = await supabase
        .from("tickets")
        .insert({ event_id: id!, participant_username: user!.id });
      if (ticketErr) throw ticketErr;

      const { error: updateErr } = await supabase
        .from("events")
        .update({ available_slots: (event!.available_slots ?? 1) - 1 })
        .eq("id", id!);
      if (updateErr) throw updateErr;
    },
    onSuccess: () => {
      toast.success("🎉 Ticket booked! See you there.", { duration: 4000 });
      setDrawerOpen(false);
      qc.invalidateQueries({ queryKey: ["event", id] });
      qc.invalidateQueries({ queryKey: ["myTicket", id] });
      qc.invalidateQueries({ queryKey: ["events"] });
    },
    onError: (err: Error) => toast.error(err.message),
  });

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-12 max-w-4xl space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="aspect-[2.5/1] w-full rounded-xl" />
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

  const slots = event.available_slots ?? 0;

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
          <div className="flex flex-wrap items-center gap-3">
            {event.category && (
              <span className="text-xs font-medium bg-primary/10 text-primary px-3 py-1 rounded-full capitalize">{event.category}</span>
            )}
            <span className="text-xs text-muted-foreground">by {event.organizer_username}</span>
          </div>

          <h1 className="font-display text-3xl md:text-4xl font-bold">{event.title}</h1>

          <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
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
              {slots} / {event.capacity} spots left
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

            {existingTicket ? (
              <div className="flex items-center gap-2 text-accent font-medium">
                <CheckCircle2 className="h-5 w-5" /> You're booked!
              </div>
            ) : profile ? (
              <Sheet open={drawerOpen} onOpenChange={setDrawerOpen}>
                <SheetTrigger asChild>
                  <Button className="gradient-btn px-8 py-3" disabled={slots <= 0}>
                    {slots <= 0 ? "Sold Out" : "Book Ticket"}
                  </Button>
                </SheetTrigger>
                <SheetContent>
                  <SheetHeader>
                    <SheetTitle className="font-display">Confirm Booking</SheetTitle>
                  </SheetHeader>
                  <div className="mt-6 space-y-6">
                    <div className="glass-card p-4 space-y-3">
                      <h3 className="font-display font-semibold">{event.title}</h3>
                      <p className="text-sm text-muted-foreground">{format(new Date(event.date), "MMMM d, yyyy · h:mm a")}</p>
                      {event.location && <p className="text-sm text-muted-foreground flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> {event.location}</p>}
                      <div className="flex items-center justify-between pt-2 border-t border-border">
                        <span className="text-sm text-muted-foreground">Price</span>
                        <span className="font-display font-bold text-lg">
                          {Number(event.price) > 0 ? `$${Number(event.price)}` : "Free"}
                        </span>
                      </div>
                    </div>
                    <div className="glass-card p-4 flex items-center gap-3">
                      <Ticket className="h-5 w-5 text-primary" />
                      <div>
                        <p className="text-sm font-medium">Booking as {profile.full_name || profile.email}</p>
                        <p className="text-xs text-muted-foreground">1 ticket</p>
                      </div>
                    </div>
                    <Button
                      onClick={() => bookMutation.mutate()}
                      disabled={bookMutation.isPending}
                      className="w-full gradient-btn h-12 text-base"
                    >
                      {bookMutation.isPending ? "Booking..." : "Confirm Booking"}
                    </Button>
                  </div>
                </SheetContent>
              </Sheet>
            ) : (
              <Button onClick={() => navigate("/login")} className="gradient-btn px-8 py-3">
                Sign In to Book
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
