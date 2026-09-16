import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function AdminRoute({ children }) {
    const { user, profile, loading } = useAuth();

    console.log("AdminRoute profile:", profile);

    if (loading) {
        return (
            <div className="min-h-screen bg-[#f7f3ea] text-[#101813] flex items-center justify-center">
                Loading...
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    if (profile?.role !== "admin") {
        return <Navigate to="/dashboard" replace />;
    }

    return children;
}