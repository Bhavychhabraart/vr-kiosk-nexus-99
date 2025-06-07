
import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";
import MainLayout from "@/components/layout/MainLayout";
import ManualUserSetup from "@/components/admin/ManualUserSetup";

const UserSetup = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <MainLayout backgroundVariant="grid" withPattern intensity="low">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-vr-primary mx-auto mb-4"></div>
            <p className="text-gray-600">Loading...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <MainLayout backgroundVariant="grid" withPattern intensity="low">
      <div className="max-w-2xl mx-auto space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-vr-primary to-vr-secondary bg-clip-text text-transparent">
            User Setup
          </h1>
          <p className="text-xl text-vr-muted mt-2">
            Configure venue and games for authenticated users
          </p>
        </div>

        <ManualUserSetup />
      </div>
    </MainLayout>
  );
};

export default UserSetup;
