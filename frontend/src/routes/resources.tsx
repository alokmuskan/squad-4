import { useNavigate } from "@tanstack/react-router";
import { useAuth } from "@/features/authentication/hooks/use-auth";
import DashboardNavbar from "@/features/dashboard/components/dashboard-navbar";
import ResourceList from "@/features/resources/components/resource-list";

export default function ResourcesPage() {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F8F6E8] flex items-center justify-center">
        <p className="text-gray-500 font-bold">Loading...</p>
      </div>
    );
  }

  if (!user) {
    navigate({ to: "/login" });
    return null;
  }

  return (
    <div className="min-h-screen bg-[#F8F6E8]">
      <DashboardNavbar />
      <ResourceList />
    </div>
  );
}
