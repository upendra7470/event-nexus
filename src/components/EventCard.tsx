import { Link } from "react-router-dom";
import { CalendarDays, MapPin, DollarSign } from "lucide-react";
import { format } from "date-fns";

interface EventCardProps {
  id: string;
  title: string;
  date: string;
  location: string | null;
  price: number;
  image_url: string | null;
  capacity: number;
}

export default function EventCard({ id, title, date, location, price, image_url, capacity }: EventCardProps) {
  return (
    <Link to={`/events/${id}`} className="group block">
      <div className="glass-card overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:shadow-lg">
        <div className="aspect-[16/10] overflow-hidden bg-muted">
          {image_url ? (
            <img src={image_url} alt={title} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/20 to-accent/20">
              <CalendarDays className="h-12 w-12 text-muted-foreground/50" />
            </div>
          )}
        </div>
        <div className="p-5 space-y-3">
          <h3 className="font-display text-lg font-semibold line-clamp-1 group-hover:text-primary transition-colors">{title}</h3>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <CalendarDays className="h-3.5 w-3.5" />
              {format(new Date(date), "MMM d, yyyy")}
            </span>
            {location && (
              <span className="flex items-center gap-1 truncate">
                <MapPin className="h-3.5 w-3.5 shrink-0" />
                <span className="truncate">{location}</span>
              </span>
            )}
          </div>
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1 font-display font-semibold text-primary">
              {price > 0 ? (
                <><DollarSign className="h-4 w-4" />{price}</>
              ) : (
                <span className="text-accent font-semibold">Free</span>
              )}
            </span>
            <span className="text-xs text-muted-foreground">{capacity} spots</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
