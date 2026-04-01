import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";
import ParticipantDashboard from "@/components/dashboard/ParticipantDashboard";
import OrganizerDashboard from "@/components/dashboard/OrganizerDashboard";
import AdminDashboard from "@/components/dashboard/AdminDashboard";
import { Skeleton } from "@/components/ui/skeleton";

export default function Dashboard() {
  const { profile, loading } = useAuth();

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12 space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!profile) return <Navigate to="/login" replace />;

  return (
    <div className="container mx-auto px-4 py-8 animate-fade-in">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Welcome back, <span className="text-primary font-medium">{profile.full_name || profile.email}</span>{" "}
          <span className="capitalize text-xs bg-accent/10 text-accent px-2 py-0.5 rounded-full">{profile.role}</span>
        </p>
      </div>

      {profile.role === "admin" && <AdminDashboard />}
      {profile.role === "organizer" && <OrganizerDashboard />}
      {profile.role === "participant" && <ParticipantDashboard />}
    </div>
  );
}
