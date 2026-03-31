import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useUser } from "@/contexts/UserContext";
import EventCard from "@/components/EventCard";
import EventCardSkeleton from "@/components/EventCardSkeleton";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Sparkles, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const CATEGORIES = ["all", "music", "tech", "sports", "food", "art", "business", "general"];

export default function Index() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const { currentUser } = useUser();

  const { data: events, isLoading } = useQuery({
    queryKey: ["events"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("events")
        .select("*")
        .order("date", { ascending: true });
      if (error) throw error;
      return data;
    },
  });

  const filtered = useMemo(() => {
    if (!events) return [];
    return events.filter((e) => {
      const matchesSearch =
        e.title.toLowerCase().includes(search.toLowerCase()) ||
        (e.location && e.location.toLowerCase().includes(search.toLowerCase()));
      const matchesCategory = category === "all" || e.category === category;
      return matchesSearch && matchesCategory;
    });
  }, [events, search, category]);

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative overflow-hidden py-20 md:py-32">
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
          <div className="absolute top-20 left-1/4 h-72 w-72 rounded-full bg-primary/10 blur-3xl animate-pulse" />
          <div className="absolute bottom-10 right-1/4 h-64 w-64 rounded-full bg-accent/10 blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />
        </div>
        <div className="container mx-auto px-4 text-center space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary animate-fade-in">
            <Sparkles className="h-4 w-4" />
            Discover · Book · Experience
          </div>
          <h1 className="font-display text-4xl font-bold tracking-tight sm:text-5xl md:text-7xl animate-fade-in" style={{ animationDelay: "0.1s" }}>
            Your next <span className="gradient-text">unforgettable</span>
            <br />experience awaits
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-muted-foreground animate-fade-in" style={{ animationDelay: "0.2s" }}>
            Browse curated events, book tickets instantly, and create memories that last a lifetime.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 animate-fade-in" style={{ animationDelay: "0.3s" }}>
            <a href="#events" className="inline-block">
              <Button className="gradient-btn px-8 h-12 text-base">
                Explore Events <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </a>
            {!currentUser && (
              <Link to="/login">
                <Button variant="outline" className="h-12 px-8 text-base">
                  Fast Login
                </Button>
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Events grid */}
      <section id="events" className="container mx-auto px-4 pb-20">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <h2 className="font-display text-2xl font-bold">
            {search ? "Search results" : "Upcoming Events"}
          </h2>
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search events..."
              className="pl-9 glass-card"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* Category filter */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-2 scrollbar-hide">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`shrink-0 rounded-full px-4 py-1.5 text-sm font-medium transition-all capitalize ${
                category === cat
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <EventCardSkeleton key={i} />
            ))}
          </div>
        ) : filtered.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((event) => (
              <EventCard
                key={event.id}
                id={event.id}
                title={event.title}
                date={event.date}
                location={event.location}
                price={Number(event.price)}
                image_url={event.image_url}
                available_slots={event.available_slots}
                category={event.category}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 text-muted-foreground">
            <p className="text-lg font-display">No events found</p>
            <p className="text-sm mt-1">Check back later or try a different search</p>
          </div>
        )}
      </section>
    </div>
  );
}
