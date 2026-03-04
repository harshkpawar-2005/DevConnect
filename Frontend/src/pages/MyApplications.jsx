// src/pages/MyApplications.jsx
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import API from "@/api/axios";
import { Button } from "@/components/ui/button";
import { CalendarDays, MapPin, Briefcase, Clock } from "lucide-react";

const statusStyles = {
  pending: "bg-yellow-500/20 text-yellow-600",
  accepted: "bg-green-500/20 text-green-600",
  rejected: "bg-red-500/20 text-red-600",
};

const filters = [
  { key: "all", label: "All" },
  { key: "pending", label: "Pending" },
  { key: "accepted", label: "Accepted" },
  { key: "rejected", label: "Rejected" },
];

export default function MyApplications() {
  const { user, loading: authLoading } = useAuth();
  const isLoaded = !authLoading;
  const navigate = useNavigate();

  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("all");

  useEffect(() => {
    if (!isLoaded) return;
    if (!user) {
      navigate("/login");
      return;
    }

    let mounted = true;
    (async () => {
      setLoading(true);
      try {
        const res = await API.get("/requests/my-applications");
        if (mounted) setApps(res.data.data || []);
      } catch (e) {
        console.error("Failed to load applications:", e);
        if (mounted) setApps([]);
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => { mounted = false; };
  }, [user, isLoaded]);

  const filteredApps =
    activeFilter === "all"
      ? apps
      : apps.filter((a) => a.status === activeFilter);

  /* ---------- Loading ---------- */
  if (!isLoaded || loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#0072E5]" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-6 py-10">
      {/* Header */}
      <div className="mb-2">
        <h1 className="text-3xl font-bold text-[#0F172A]">My Applications</h1>
        <p className="text-slate-500 mt-1">Track all the projects you've applied to</p>
      </div>

      {/* Filter Bar */}
      <div className="flex gap-6 border-b border-slate-200 pb-3 mb-8 mt-6">
        {filters.map((f) => (
          <button
            key={f.key}
            onClick={() => setActiveFilter(f.key)}
            className={`
              text-sm transition-all duration-200 pb-1 relative
              ${
                activeFilter === f.key
                  ? "text-[#0072E5] font-medium border-b-2 border-[#0072E5]"
                  : "text-slate-500 hover:text-slate-700"
              }
            `}
          >
            {f.label}
            {f.key !== "all" && (
              <span className="ml-1 text-xs">
                ({apps.filter((a) => a.status === f.key).length})
              </span>
            )}
            {f.key === "all" && (
              <span className="ml-1 text-xs">({apps.length})</span>
            )}
          </button>
        ))}
      </div>

      {/* Empty State */}
      {filteredApps.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="text-5xl mb-4">📭</div>
          <h3 className="text-lg font-semibold text-slate-700 mb-1">
            {activeFilter === "all"
              ? "You haven't applied to any projects yet."
              : `No ${activeFilter} applications.`}
          </h3>
          <p className="text-slate-500 text-sm">
            Explore projects on the dashboard and start applying!
          </p>
        </div>
      )}

      {/* Application Cards */}
      <div className="space-y-4">
        {filteredApps.map((a) => {
          const project = a.projectId;
          const appliedDate = a.createdAt
            ? new Date(a.createdAt).toLocaleDateString()
            : "—";
          const deadline = project?.deadline
            ? new Date(project.deadline).toLocaleDateString()
            : "—";
          const sColor = statusStyles[a.status] || "bg-slate-200 text-slate-700";

          return (
            <div
              key={a._id}
              className="
                rounded-xl border border-slate-200 bg-white shadow-sm
                p-5
                transition-all duration-300
                hover:-translate-y-1 hover:shadow-lg
              "
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                {/* LEFT — Info */}
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-semibold text-[#0F172A] mb-2 truncate">
                    {project?.title || "Project removed"}
                  </h3>

                  <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-slate-500">
                    <span className="flex items-center gap-1.5">
                      <Briefcase size={14} className="text-slate-400" />
                      {a.appliedRole}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Clock size={14} className="text-slate-400" />
                      Applied: {appliedDate}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <CalendarDays size={14} className="text-slate-400" />
                      Deadline: {deadline}
                    </span>
                    {project?.mode && (
                      <span className="flex items-center gap-1.5">
                        <MapPin size={14} className="text-slate-400" />
                        {project.mode}
                      </span>
                    )}
                  </div>
                </div>

                {/* RIGHT — Actions */}
                <div className="flex items-center gap-3 shrink-0">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${sColor}`}
                  >
                    {a.status}
                  </span>

                  {project ? (
                    <Link to={`/project/${project._id}`}>
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-slate-300 hover:border-[#0072E5] transition-colors"
                      >
                        View Project
                      </Button>
                    </Link>
                  ) : (
                    <span className="text-xs text-slate-400">Removed</span>
                  )}

                  {a.status === "accepted" && project && (
                    <Link to={`/project/${project._id}/workspace`}>
                      <Button
                        size="sm"
                        className="bg-gradient-to-r from-sky-400 to-blue-600 text-white shadow-sm hover:shadow-md transition-all"
                      >
                        Go to Workspace
                      </Button>
                    </Link>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
