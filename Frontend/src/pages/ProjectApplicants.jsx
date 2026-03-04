// src/pages/ProjectApplicants.jsx
import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import API from "@/api/axios";
import { toast } from "@/hooks/use-toast";
import { ArrowLeft, Check, X, User } from "lucide-react";

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

export default function ProjectApplicants() {
    const { projectId } = useParams();
    const { user } = useAuth();
    const navigate = useNavigate();

    const [project, setProject] = useState(null);
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(null);

    /* -------------------- Fetch project + applications -------------------- */
    useEffect(() => {
        async function load() {
            try {
                const [projRes, appsRes] = await Promise.all([
                    API.get(`/projects/${projectId}`),
                    API.get(`/requests/project/${projectId}`),
                ]);

                const proj = projRes.data.data;

                // Owner guard
                if (!user || user._id !== proj.ownerId?._id) {
                    navigate("/", { replace: true });
                    return;
                }

                setProject(proj);
                setApplications(appsRes.data.data || []);
            } catch (e) {
                toast({
                    title: "Error",
                    description: "Failed to load applicants.",
                    variant: "destructive",
                });
                navigate("/", { replace: true });
            } finally {
                setLoading(false);
            }
        }

        if (user) load();
    }, [projectId, user, navigate]);

    /* -------------------- Accept / Reject -------------------- */
    const handleAction = async (requestId, action) => {
        setActionLoading(requestId);
        try {
            await API.post(`/requests/${requestId}/${action}`);
            setApplications((prev) =>
                prev.map((a) =>
                    a._id === requestId
                        ? { ...a, status: action === "accept" ? "accepted" : "rejected" }
                        : a
                )
            );
            toast({
                title: action === "accept" ? "Applicant Accepted ✓" : "Applicant Rejected",
                description: `Application has been ${action === "accept" ? "accepted" : "rejected"}.`,
            });
        } catch (e) {
            toast({
                title: "Error",
                description: e.response?.data?.message || `Failed to ${action} application.`,
                variant: "destructive",
            });
        } finally {
            setActionLoading(null);
        }
    };

    /* -------------------- Loading -------------------- */
    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="text-slate-500 text-lg">Loading applicants...</div>
            </div>
        );
    }

    if (!project) return null;

    /* -------------------- Group by role -------------------- */
    const roles = project.roles || [];
    const totalApplicants = applications.length;

    // Build tab data using project.roles as source of truth
    const roleTabs = roles.map((role) => {
        const roleTitle = role.title || role.roleName || "Unknown Role";
        const roleApps = applications.filter((a) => a.appliedRole === roleTitle);

        const accepted = roleApps.filter((a) => a.status === "accepted").length;
        const pending = roleApps.filter((a) => a.status === "pending").length;
        const rejected = roleApps.filter((a) => a.status === "rejected").length;

        return {
            roleTitle,
            membersRequired: role.membersRequired || 0,
            applications: roleApps,
            accepted,
            pending,
            rejected,
        };
    });

    // Also catch any applications with roles not in project.roles
    const knownRoleTitles = new Set(roleTabs.map((r) => r.roleTitle));
    const ungrouped = applications.filter(
        (a) => !knownRoleTitles.has(a.appliedRole)
    );
    if (ungrouped.length > 0) {
        roleTabs.push({
            roleTitle: "Other",
            membersRequired: 0,
            applications: ungrouped,
            accepted: ungrouped.filter((a) => a.status === "accepted").length,
            pending: ungrouped.filter((a) => a.status === "pending").length,
            rejected: ungrouped.filter((a) => a.status === "rejected").length,
        });
    }

    const defaultTab = roleTabs.length > 0 ? roleTabs[0].roleTitle : "";

  /* -------------------- Render -------------------- */
  return (
    <div className="w-full max-w-6xl mx-auto px-6 py-10">
      {/* -------- Header -------- */}
      <div className="mb-10">
        <button
          onClick={() => navigate(`/project/${projectId}`)}
          className="inline-flex items-center gap-2 text-slate-500 hover:text-[#0072E5] transition duration-200 mb-5 group"
        >
          <ArrowLeft size={16} className="group-hover:-translate-x-0.5 transition-transform duration-200" />
          <span className="text-sm font-medium">Back to Project</span>
        </button>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-[#0F172A] tracking-tight">
              {project.title}
            </h1>
            <div className="flex items-center gap-3 mt-3">
              <StatusBadge status={project.status} />
              <span className="text-slate-400 text-sm">
                {totalApplicants} applicant{totalApplicants !== 1 ? "s" : ""}
              </span>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="border-b border-slate-200 mt-6" />
      </div>

      {/* -------- Tabs -------- */}
      {roleTabs.length === 0 ? (
        <EmptyState message="No roles defined for this project." />
      ) : (
        <Tabs defaultValue={defaultTab} className="w-full">
          {/* Segmented control tabs */}
          <TabsList className="w-full flex flex-wrap h-auto gap-1 bg-slate-100 p-1 rounded-full">
            {roleTabs.map((tab) => (
              <TabsTrigger
                key={tab.roleTitle}
                value={tab.roleTitle}
                className="
                  px-5 py-2 text-sm rounded-full
                  text-slate-500
                  hover:bg-slate-200
                  transition-all duration-200
                  data-[state=active]:bg-white
                  data-[state=active]:text-[#0F172A]
                  data-[state=active]:font-semibold
                  data-[state=active]:shadow-sm
                "
              >
                {tab.roleTitle}
                <span className="
                  ml-2 text-xs px-2 py-0.5 rounded-full
                  bg-slate-200
                  data-[state=active]:bg-blue-100 data-[state=active]:text-blue-700
                ">
                  {tab.applications.length}
                </span>
              </TabsTrigger>
            ))}
          </TabsList>

          {roleTabs.map((tab) => (
            <TabsContent key={tab.roleTitle} value={tab.roleTitle} className="mt-8">
              {/* Role Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <StatCard
                  label="Accepted"
                  value={`${tab.accepted} / ${tab.membersRequired}`}
                  color="text-green-600"
                  accent="border-l-green-500"
                />
                <StatCard
                  label="Pending"
                  value={tab.pending}
                  color="text-yellow-600"
                  accent="border-l-yellow-500"
                />
                <StatCard
                  label="Rejected"
                  value={tab.rejected}
                  color="text-red-500"
                  accent="border-l-red-500"
                />
              </div>

              {/* Applicants */}
              {tab.applications.length === 0 ? (
                <EmptyState message="No applications for this role yet." />
              ) : (
                <div className="space-y-4">
                  {tab.applications.map((app) => (
                    <ApplicantCard
                      key={app._id}
                      app={app}
                      onAccept={() => handleAction(app._id, "accept")}
                      onReject={() => handleAction(app._id, "reject")}
                      isLoading={actionLoading === app._id}
                      acceptDisabled={
                        app.status === "accepted" ||
                        app.status === "rejected" ||
                        tab.accepted >= tab.membersRequired ||
                        project.status !== "open"
                      }
                      rejectDisabled={app.status === "rejected" || app.status === "accepted"}
                    />
                  ))}
                </div>
              )}
            </TabsContent>
          ))}
        </Tabs>
      )}
    </div>
  );
}

/* ================================================================
   REUSABLE COMPONENTS
================================================================ */

function StatusBadge({ status }) {
  const config = {
    open:      { bg: "bg-green-100",  text: "text-green-700", label: "Open" },
    paused:    { bg: "bg-yellow-100", text: "text-yellow-700", label: "Paused" },
    completed: { bg: "bg-blue-100",   text: "text-blue-700",  label: "Completed" },
    expired:   { bg: "bg-slate-100",  text: "text-slate-600", label: "Expired" },
    closed:    { bg: "bg-red-100",    text: "text-red-600",   label: "Closed" },
  };
  const s = config[status] || config.closed;

  return (
    <span className={`text-xs px-3 py-1 rounded-full font-medium ${s.bg} ${s.text}`}>
      {s.label}
    </span>
  );
}

function StatCard({ label, value, color, accent }) {
  return (
    <div className={`bg-white border border-slate-200 ${accent} border-l-4 rounded-xl px-6 py-4 shadow-sm`}>
      <div className={`text-2xl font-bold ${color}`}>{value}</div>
      <div className="text-sm text-slate-500 mt-1">{label}</div>
    </div>
  );
}

function EmptyState({ message }) {
  return (
    <div className="text-center py-20">
      <div className="text-slate-400 text-lg">{message}</div>
    </div>
  );
}

function ApplicantCard({
  app,
  onAccept,
  onReject,
  isLoading,
  acceptDisabled,
  rejectDisabled,
}) {
  const applicant = app.userId || {};
  const appliedDate = app.createdAt
    ? new Date(app.createdAt).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "Unknown";

  const statusColors = {
    pending:  "bg-yellow-100 text-yellow-700",
    accepted: "bg-green-100 text-green-700",
    rejected: "bg-red-100 text-red-600",
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow duration-200">
      <div className="flex justify-between items-start gap-6">
        {/* Left: Avatar + Info */}
        <div className="flex items-start gap-4 flex-1 min-w-0">
          <img
            src={applicant.avatar || "/avatar-placeholder.png"}
            alt={applicant.fullName || "Applicant"}
            className="h-11 w-11 rounded-full object-cover border border-slate-200 flex-shrink-0"
          />

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2.5 flex-wrap">
              <h4 className="font-semibold text-[#0F172A] text-lg leading-tight">
                {applicant.fullName || "Unknown"}
              </h4>
              <span
                className={`text-xs px-3 py-1 rounded-full font-medium capitalize ${
                  statusColors[app.status] || statusColors.pending
                }`}
              >
                {app.status}
              </span>
            </div>
            <p className="text-sm text-slate-500 mt-0.5">
              @{applicant.username || "unknown"}
            </p>
            <p className="text-xs text-slate-400 mt-1">
              Applied {appliedDate}
            </p>
          </div>
        </div>

        {/* Center: Message */}
        {app.message && (
          <div className="hidden lg:block flex-1 max-w-xs">
            <div className="bg-slate-50 rounded-md px-4 py-2 text-sm text-slate-600 border border-slate-100">
              "{app.message}"
            </div>
          </div>
        )}

        {/* Right: Action buttons (vertical stack) */}
        <div className="flex flex-col gap-2 flex-shrink-0">
          <button
            onClick={onAccept}
            disabled={acceptDisabled || isLoading}
            title="Accept"
            className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium
              bg-green-50 text-green-700 border border-green-200
              hover:bg-green-100
              disabled:opacity-40 disabled:cursor-not-allowed
              transition duration-150"
          >
            <Check size={14} />
            Accept
          </button>

          <button
            onClick={onReject}
            disabled={rejectDisabled || isLoading}
            title="Reject"
            className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium
              bg-red-50 text-red-600 border border-red-200
              hover:bg-red-100
              disabled:opacity-40 disabled:cursor-not-allowed
              transition duration-150"
          >
            <X size={14} />
            Reject
          </button>

          <Link
            to={`/profile/${applicant.username || applicant._id}`}
            title="View Profile"
            className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium
              text-slate-600 border border-slate-200
              hover:bg-slate-50
              transition duration-150"
          >
            <User size={14} />
            Profile
          </Link>
        </div>
      </div>

      {/* Message on mobile (below card content) */}
      {app.message && (
        <div className="lg:hidden mt-3">
          <div className="bg-slate-50 rounded-md px-4 py-2 text-sm text-slate-600 border border-slate-100">
            "{app.message}"
          </div>
        </div>
      )}
    </div>
  );
}
