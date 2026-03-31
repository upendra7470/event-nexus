import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";
import ParticipantDashboard from "@/components/dashboard/ParticipantDashboard";
import OrganizerDashboard from "@/components/dashboard/OrganizerDashboard";
import AdminDashboard from "@/components/dashboard/AdminDashboard";
import { Skeleton } from "@/components/ui/skeleton";

export default function Dashboard() {
  const { user, role, loading, profile } = useAuth();

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12 space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!user) return <Navigate to="/auth" replace />;

  return (
    <div className="container mx-auto px-4 py-8 animate-fade-in">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Welcome, {profile?.full_name || profile?.email || "there"}!{" "}
          <span className="capitalize text-primary font-medium">({role})</span>
        </p>
      </div>

      {role === "admin" && <AdminDashboard />}
      {role === "organizer" && <OrganizerDashboard />}
      {(role === "participant" || !role) && <ParticipantDashboard />}
    </div>
  );
}
