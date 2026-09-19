import { Routes, Route } from "react-router-dom";

// Public Pages
import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import HowItWorks from "./pages/HowItWorks";
import Charities from "./pages/Charities";

// User Pages
import Dashboard from "./pages/Dashboard";
import Scores from "./pages/Scores";
import Charity from "./pages/Charity";
import Subscription from "./pages/Subscription";
import Draw from "./pages/Draw";
import Winnings from "./pages/Winnings";

// Admin Pages
import AdminDashboard from "./pages/AdminDashboard";
import AdminDraws from "./pages/AdminDraws";
import AdminWinners from "./pages/AdminWinners";
import AdminUsers from "./pages/AdminUsers";
import AdminCharities from "./pages/AdminCharities";
import AdminReports from "./pages/AdminReports";

// Route Guards
import ProtectedRoute from "./components/ProtectedRoute";
import AdminRoute from "./components/AdminRoute";

// Layout Components
import Header from "./components/Header";
import Footer from "./components/Footer";
import UserHeader from "./components/UserHeader";
import AdminHeader from "./components/AdminHeader";
import DemoPayment from "./pages/DemoPayment";


/* =========================================
   PUBLIC LAYOUT
========================================= */

function PublicLayout({ children }) {
  return (
    <div className="min-h-screen bg-[#f3f1e8] text-[#101813]">
      <Header />

      <main>
        {children}
      </main>

      <Footer />
    </div>
  );
}


/* =========================================
   USER LAYOUT
========================================= */

function UserLayout({ children }) {
  return (
    <div className="min-h-screen bg-[#f3f1e8] text-[#101813]">
      <UserHeader />

      <main>
        {children}
      </main>
    </div>
  );
}

function AdminLayout({ children }) {
  return (
    <div className="min-h-screen bg-[#f3f1e8] text-[#101813]">
      <AdminHeader />
      <main>{children}</main>
    </div>
  );
}

function AdminOnlyRoute({ element }) {
  return (
    <AdminRoute>
      <AdminLayout>
        {element}
      </AdminLayout>
    </AdminRoute>
  );
}


/* =========================================
   USER ROUTE
========================================= */

function UserRoute({ children }) {
  return (
    <ProtectedRoute>
      <UserLayout>
        {children}
      </UserLayout>
    </ProtectedRoute>
  );
}

/* =========================================
   ADMIN ROUTE
========================================= */




/* =========================================
   APP
========================================= */

function App() {
  return (
    <Routes>

      {/* =====================================
          PUBLIC PAGES
      ====================================== */}

      <Route
        path="/"
        element={
          <PublicLayout>
            <Home />
          </PublicLayout>
        }
      />

      <Route
        path="/login"
        element={
          <PublicLayout>
            <Login />
          </PublicLayout>
        }
      />

      <Route
        path="/signup"
        element={
          <PublicLayout>
            <Signup />
          </PublicLayout>
        }
      />

      <Route
        path="/how-it-works"
        element={
          <PublicLayout>
            <HowItWorks />
          </PublicLayout>
        }
      />

      <Route
        path="/charities"
        element={
          <PublicLayout>
            <Charities />
          </PublicLayout>
        }
      />




      {/* =====================================
          USER PAGES
      ====================================== */}

      <Route
        path="/dashboard"
        element={
          <UserRoute>
            <Dashboard />
          </UserRoute>
        }
      />

      <Route
        path="/dashboard/scores"
        element={
          <UserRoute>
            <Scores />
          </UserRoute>
        }
      />

      <Route
        path="/demo-payment"
        element={
          <ProtectedRoute>
            <DemoPayment />
          </ProtectedRoute>
        }
      />

      <Route
        path="/dashboard/charity"
        element={
          <UserRoute>
            <Charity />
          </UserRoute>
        }
      />

      <Route
        path="/dashboard/subscription"
        element={
          <UserRoute>
            <Subscription />
          </UserRoute>
        }
      />

      <Route
        path="/dashboard/draw"
        element={
          <UserRoute>
            <Draw />
          </UserRoute>
        }
      />

      <Route
        path="/dashboard/winnings"
        element={
          <UserRoute>
            <Winnings />
          </UserRoute>
        }
      />


      {/* =====================================
          ADMIN PAGES
      ====================================== */}

      <Route
        path="/admin"
        element={
          <AdminOnlyRoute element={<AdminDashboard />} />
        }
      />

      <Route
        path="/admin/draws"
        element={
          <AdminOnlyRoute element={<AdminDraws />} />
        }
      />

      <Route
        path="/admin/winners"
        element={
          <AdminOnlyRoute element={<AdminWinners />} />
        }
      />

      <Route
        path="/admin/users"
        element={
          <AdminOnlyRoute element={<AdminUsers />} />
        }
      />

      <Route
        path="/admin/charities"
        element={
          <AdminOnlyRoute element={<AdminCharities />} />
        }
      />

      <Route
        path="/admin/reports"
        element={
          <AdminOnlyRoute element={<AdminReports />} />
        }
      />


      {/* =====================================
          FALLBACK
      ====================================== */}

      <Route
        path="*"
        element={<Login />}
      />

    </Routes>
  );
}

export default App;