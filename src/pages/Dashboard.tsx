import { useUser } from "@/contexts/UserContext";
import { Navigate } from "react-router-dom";
import ParticipantDashboard from "@/components/dashboard/ParticipantDashboard";
import OrganizerDashboard from "@/components/dashboard/OrganizerDashboard";
import AdminDashboard from "@/components/dashboard/AdminDashboard";
import { Skeleton } from "@/components/ui/skeleton";

export default function Dashboard() {
  const { currentUser, loading } = useUser();

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12 space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!currentUser) return <Navigate to="/login" replace />;

  return (
    <div className="container mx-auto px-4 py-8 animate-fade-in">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Welcome back, <span className="text-primary font-medium">@{currentUser.username}</span>{" "}
          <span className="capitalize text-xs bg-accent/10 text-accent px-2 py-0.5 rounded-full">{currentUser.role}</span>
        </p>
      </div>

      {currentUser.role === "admin" && <AdminDashboard />}
      {currentUser.role === "organizer" && <OrganizerDashboard />}
      {currentUser.role === "participant" && <ParticipantDashboard />}
    </div>
  );
}
