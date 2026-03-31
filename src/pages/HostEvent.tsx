import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useUser } from "@/contexts/UserContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { CalendarDays, ArrowLeft } from "lucide-react";
import { Navigate } from "react-router-dom";

const CATEGORIES = ["general", "music", "tech", "sports", "food", "art", "business"];

export default function HostEvent() {
  const { currentUser } = useUser();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [form, setForm] = useState({
    title: "",
    description: "",
    date: "",
    location: "",
    price: "0",
    capacity: "50",
    image_url: "",
    category: "general",
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      const cap = parseInt(form.capacity) || 50;
      const { error } = await supabase.from("events").insert({
        title: form.title,
        description: form.description || null,
        date: form.date,
        location: form.location || null,
        price: parseFloat(form.price) || 0,
        capacity: cap,
        available_slots: cap,
        image_url: form.image_url || null,
        category: form.category,
        organizer_username: currentUser!.username,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Event created successfully! 🎉");
      qc.invalidateQueries({ queryKey: ["events"] });
      qc.invalidateQueries({ queryKey: ["myOrgEvents"] });
      navigate("/dashboard");
    },
    onError: (err: Error) => toast.error(err.message),
  });

  if (!currentUser || (currentUser.role !== "organizer" && currentUser.role !== "admin")) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl animate-fade-in">
      <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors">
        <ArrowLeft className="h-4 w-4" /> Back
      </button>

      <div className="glass-card p-6 md:p-10">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
            <CalendarDays className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="font-display text-2xl font-bold">Host an Event</h1>
            <p className="text-sm text-muted-foreground">Fill in the details below</p>
          </div>
        </div>

        <form onSubmit={(e) => { e.preventDefault(); createMutation.mutate(); }} className="space-y-5">
          <div className="space-y-2">
            <Label>Event Title *</Label>
            <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Enter event title" required />
          </div>

          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="What's this event about?" rows={4} />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Date & Time *</Label>
              <Input type="datetime-local" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} required />
            </div>
            <div className="space-y-2">
              <Label>Category</Label>
              <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((c) => (
                    <SelectItem key={c} value={c} className="capitalize">{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Location</Label>
            <Input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="Event venue or address" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Price ($)</Label>
              <Input type="number" min="0" step="0.01" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Capacity</Label>
              <Input type="number" min="1" value={form.capacity} onChange={(e) => setForm({ ...form, capacity: e.target.value })} />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Image URL</Label>
            <Input value={form.image_url} onChange={(e) => setForm({ ...form, image_url: e.target.value })} placeholder="https://example.com/image.jpg" />
          </div>

          <Button type="submit" className="w-full gradient-btn h-12 text-base" disabled={createMutation.isPending}>
            {createMutation.isPending ? "Creating..." : "Create Event"}
          </Button>
        </form>
      </div>
    </div>
  );
}
