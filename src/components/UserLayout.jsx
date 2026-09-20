import Sidebar from "./Sidebar";
import UserHeader from "./UserHeader";

export default function UserLayout({ children }) {
  return (
    <div className="min-h-screen bg-[#f3f1e8] text-[#101813]">

      {/* Sidebar */}
      <Sidebar />

      {/* Main application area */}
      <div className="lg:ml-[270px] min-h-screen">

        {/* Header */}
        <UserHeader />

        {/* Page content */}
        <main>
          {children}
        </main>

      </div>
    </div>
  );
}