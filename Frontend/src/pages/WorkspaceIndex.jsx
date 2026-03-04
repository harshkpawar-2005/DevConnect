// src/pages/WorkspaceIndex.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import API from "@/api/axios";
import WorkspaceCard from "@/components/workspace/WorkspaceCard";

export default function WorkspaceIndex() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const isLoaded = !authLoading;

  const [ownerProjects, setOwnerProjects] = useState([]);
  const [memberProjects, setMemberProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("owner");

  useEffect(() => {
    if (!isLoaded) return;

    if (!user) {
      navigate("/login");
      return;
    }

    async function load() {
      setLoading(true);
      try {
        const res = await API.get("/workspace/my");
        const data = res.data.data || res.data;
        setOwnerProjects(data.ownerProjects || []);
        setMemberProjects(data.memberProjects || []);
      } catch (e) {
        console.error("Failed to load workspaces:", e);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [isLoaded, user]);

  if (!isLoaded || loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#0072E5]" />
      </div>
    );
  }

  const tabs = [
    { key: "owner", label: "Created by You", count: ownerProjects.length },
    { key: "member", label: "You're a Member", count: memberProjects.length },
  ];

  const activeProjects = activeTab === "owner" ? ownerProjects : memberProjects;

  return (
    <div className="container mx-auto px-6 py-10">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#0F172A]">Workspace</h1>
        <p className="text-slate-500 mt-1">Manage your active project collaborations</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-6 border-b border-slate-200 mb-8">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`
              pb-3 text-sm font-medium transition-all duration-200 relative
              ${
                activeTab === tab.key
                  ? "text-[#0072E5] border-b-2 border-[#0072E5]"
                  : "text-slate-500 hover:text-slate-700"
              }
            `}
          >
            {tab.label} ({tab.count})
          </button>
        ))}
      </div>

      {/* Cards Grid */}
      {activeProjects.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="text-5xl mb-4">📂</div>
          <h3 className="text-lg font-semibold text-slate-700 mb-1">No projects yet.</h3>
          <p className="text-slate-500 text-sm">
            {activeTab === "owner"
              ? "Start by creating a project."
              : "Join a project to see it here."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {activeProjects.map((p) => (
            <WorkspaceCard
              key={p.projectId}
              project={p}
              role={activeTab === "owner" ? "Owner" : (p.currentUserRole || "Member")}
            />
          ))}
        </div>
      )}
    </div>
  );
}
