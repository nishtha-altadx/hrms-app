import { RequireAuth } from "@/components/shared/RequireAuth";
import { DashboardHome } from "@/components/shared/DashboardHome";

export default function DashboardPage() {
  return (
    <RequireAuth>
      <DashboardHome />
    </RequireAuth>
  );
}
