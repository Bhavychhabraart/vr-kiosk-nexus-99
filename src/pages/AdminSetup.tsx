
import MainLayout from "@/components/layout/MainLayout";
import UserSetupCheck from "@/components/admin/UserSetupCheck";

const AdminSetup = () => {
  return (
    <MainLayout>
      <div className="container mx-auto py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Admin Setup Tools</h1>
          <p className="text-vr-muted">
            Tools for checking and fixing user setups
          </p>
        </div>

        <UserSetupCheck />
      </div>
    </MainLayout>
  );
};

export default AdminSetup;
