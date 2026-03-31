import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Plus, Trash2, Users, Edit, CalendarDays } from "lucide-react";
import { format } from "date-fns";

export default function OrganizerDashboard() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ title: "", description: "", date: "", location: "", price: "0", capacity: "100", image_url: "" });
  const [viewAttendeesId, setViewAttendeesId] = useState<string | null>(null);

  const { data: events, isLoading } = useQuery({
    queryKey: ["myEvents", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase.from("events").select("*").eq("organizer_id", user!.id).order("date", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const { data: attendees } = useQuery({
    queryKey: ["attendees", viewAttendeesId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("bookings")
        .select("*, profiles!bookings_user_id_fkey(full_name, email)")
        .eq("event_id", viewAttendeesId!);
      if (error) throw error;
      return data;
    },
    enabled: !!viewAttendeesId,
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        title: form.title,
        description: form.description,
        date: form.date,
        location: form.location,
        price: parseFloat(form.price) || 0,
        capacity: parseInt(form.capacity) || 100,
        image_url: form.image_url || null,
        organizer_id: user!.id,
      };
      if (editId) {
        const { error } = await supabase.from("events").update(payload).eq("id", editId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("events").insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      toast.success(editId ? "Event updated!" : "Event created!");
      qc.invalidateQueries({ queryKey: ["myEvents"] });
      qc.invalidateQueries({ queryKey: ["events"] });
      resetForm();
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("events").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Event deleted");
      qc.invalidateQueries({ queryKey: ["myEvents"] });
      qc.invalidateQueries({ queryKey: ["events"] });
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const resetForm = () => {
    setForm({ title: "", description: "", date: "", location: "", price: "0", capacity: "100", image_url: "" });
    setEditId(null);
    setOpen(false);
  };

  const openEdit = (ev: any) => {
    setForm({
      title: ev.title,
      description: ev.description || "",
      date: ev.date ? new Date(ev.date).toISOString().slice(0, 16) : "",
      location: ev.location || "",
      price: String(ev.price || 0),
      capacity: String(ev.capacity || 100),
      image_url: ev.image_url || "",
    });
    setEditId(ev.id);
    setOpen(true);
  };

  if (isLoading) {
    return <div className="space-y-4">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-24 w-full rounded-xl" />)}</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-xl font-semibold">My Events</h2>
        <Dialog open={open} onOpenChange={(v) => { if (!v) resetForm(); setOpen(v); }}>
          <DialogTrigger asChild>
            <Button className="gradient-btn"><Plus className="h-4 w-4 mr-1" /> New Event</Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="font-display">{editId ? "Edit Event" : "Create Event"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={(e) => { e.preventDefault(); saveMutation.mutate(); }} className="space-y-4">
              <div className="space-y-2"><Label>Title</Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required /></div>
              <div className="space-y-2"><Label>Description</Label><Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} /></div>
              <div className="space-y-2"><Label>Date & Time</Label><Input type="datetime-local" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} required /></div>
              <div className="space-y-2"><Label>Location</Label><Input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} /></div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label>Price ($)</Label><Input type="number" min="0" step="0.01" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} /></div>
                <div className="space-y-2"><Label>Capacity</Label><Input type="number" min="1" value={form.capacity} onChange={(e) => setForm({ ...form, capacity: e.target.value })} /></div>
              </div>
              <div className="space-y-2"><Label>Image URL</Label><Input value={form.image_url} onChange={(e) => setForm({ ...form, image_url: e.target.value })} placeholder="https://..." /></div>
              <Button type="submit" className="w-full gradient-btn" disabled={saveMutation.isPending}>
                {saveMutation.isPending ? "Saving..." : editId ? "Update Event" : "Create Event"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {events && events.length > 0 ? (
        <div className="space-y-3">
          {events.map((ev) => (
            <div key={ev.id} className="glass-card p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <h3 className="font-display font-semibold truncate">{ev.title}</h3>
                  <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                    <CalendarDays className="h-3.5 w-3.5" />
                    {format(new Date(ev.date), "MMM d, yyyy")}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Button variant="ghost" size="icon" onClick={() => setViewAttendeesId(viewAttendeesId === ev.id ? null : ev.id)}>
                    <Users className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => openEdit(ev)}>
                    <Edit className="h-4 w-4" />
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
                          <span>{a.profiles?.full_name || "Unknown"}</span>
                          <span className="text-muted-foreground">{a.profiles?.email}</span>
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
          <p>No events created yet</p>
        </div>
      )}
    </div>
  );
}
