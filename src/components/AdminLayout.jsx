import AdminSidebar from "./AdminSidebar";
import AdminHeader from "./AdminHeader";

export default function AdminLayout({ children }) {
  return (
    <div className="min-h-screen bg-[#f3f1e8] text-[#101813]">

      {/* ================= ADMIN SIDEBAR ================= */}

      <AdminSidebar />


      {/* ================= MAIN AREA ================= */}

      <div className="min-h-screen lg:ml-[270px]">

        {/* Admin Header */}
        <AdminHeader />

        {/* Page Content */}
        <main className="min-h-[calc(100vh-75px)]">
          {children}
        </main>

      </div>

    </div>
  );
}