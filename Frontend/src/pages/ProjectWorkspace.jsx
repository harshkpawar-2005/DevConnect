// src/pages/ProjectWorkspace.jsx
import { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import API from "@/api/axios";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const statusConfig = {
    open: { className: "bg-green-100 text-green-700 border-green-200", label: "Open" },
    paused: { className: "bg-yellow-100 text-yellow-700 border-yellow-200", label: "Paused" },
    completed: { className: "bg-blue-100 text-blue-700 border-blue-200", label: "Completed" },
    expired: { className: "bg-slate-100 text-slate-600 border-slate-200", label: "Expired" },
    closed: { className: "bg-red-100 text-red-600 border-red-200", label: "Closed" },
};

export default function ProjectWorkspace() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user, loading: authLoading } = useAuth();
    const isLoaded = !authLoading;

    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeSection, setActiveSection] = useState("owner");

    /* ================= LOAD WORKSPACE ================= */
    useEffect(() => {
        if (!isLoaded) return;

        if (!user) {
            navigate("/login");
            return;
        }

        async function load() {
            try {
                const res = await API.get(`/workspace/${id}`);
                setData(res.data.data);
            } catch (e) {
                if (e.response?.status === 403) {
                    navigate("/dashboard");
                }
            } finally {
                setLoading(false);
            }
        }

        load();
    }, [isLoaded, user, id]);

    /* ================= SAFE DATA ================= */
    const project = data?.project || {};
    const members = data?.members || [];
    const roles = project?.roles || [];

    const owner = members.find((m) => m.isOwner);

    /* ================= GROUP MEMBERS BY ROLE ================= */
    const membersByRole = useMemo(() => {
        const map = {};
        roles.forEach((r) => {
            map[r.title] = [];
        });

        members.forEach((m) => {
            if (!m.isOwner && map[m.role]) {
                map[m.role].push(m);
            }
        });

        return map;
    }, [roles, members]);

    const activeRole =
        activeSection !== "owner"
            ? roles.find((r) => r.title === activeSection)
            : null;

    const activeMembers =
        activeRole && membersByRole[activeRole.title]
            ? membersByRole[activeRole.title]
            : [];

    const teamCount = members.length;

    const s = statusConfig[project?.status] || statusConfig.closed;

    /* ================= LOADING STATES ================= */
    if (!isLoaded || loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#0072E5]" />
            </div>
        );
    }

    if (!data) {
        return (
            <div className="flex items-center justify-center min-h-[60vh] text-slate-500">
                Workspace not found.
            </div>
        );
    }

    /* ================= UI ================= */
    return (
        <div className="max-w-7xl mx-auto px-8 py-12">
            {/* ===== HEADER ===== */}
            <div className="mb-12">
                <h1 className="text-3xl font-bold tracking-tight text-[#0F172A]">
                    {project.title}
                </h1>

                <div className="flex flex-wrap items-center gap-4 mt-4">
                    <Badge className={`${s.className} border`}>
                        {s.label}
                    </Badge>

                    <span className="text-sm text-slate-500">
                        {teamCount} member{teamCount !== 1 ? "s" : ""}
                    </span>

                    <div className="flex gap-2 flex-wrap">
                        {project.techStack?.slice(0, 3).map((t, i) => (
                            <span
                                key={i}
                                className="text-xs bg-slate-100 px-2 py-1 rounded-md"
                            >
                                {t}
                            </span>
                        ))}
                    </div>
                </div>
            </div>

            {/* ===== HORIZONTAL TAB BAR ===== */}
            <div
                className="flex gap-6 border-b border-slate-200 pb-3 mb-8 overflow-x-auto whitespace-nowrap"
                style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
            >
                {/* Owner Tab */}
                <button
                    onClick={() => setActiveSection("owner")}
                    className={`
                        pb-2 text-sm transition-all duration-200 shrink-0
                        ${activeSection === "owner"
                            ? "text-[#0072E5] border-b-2 border-[#0072E5] font-medium"
                            : "text-slate-500 hover:text-slate-700"
                        }
                    `}
                >
                    Owner
                </button>

                {/* Role Tabs */}
                {roles.map((r) => {
                    const count = membersByRole[r.title]?.length || 0;
                    return (
                        <button
                            key={r.title}
                            onClick={() => setActiveSection(r.title)}
                            className={`
                                pb-2 text-sm transition-all duration-200 shrink-0
                                ${activeSection === r.title
                                    ? "text-[#0072E5] border-b-2 border-[#0072E5] font-medium"
                                    : "text-slate-500 hover:text-slate-700"
                                }
                            `}
                        >
                            {r.title}
                            <span className="ml-1.5 text-xs">({count}/{r.membersRequired})</span>
                        </button>
                    );
                })}
            </div>

            {/* ===== CONTENT ===== */}

            {/* OWNER VIEW */}
            {activeSection === "owner" ? (
                <div className="max-w-2xl">
                    <div className="flex items-center gap-6 bg-white border border-slate-200 rounded-2xl p-8 shadow-sm transition-all hover:shadow-lg">
                        <img
                            src={owner?.avatar || "/avatar-placeholder.png"}
                            className="h-24 w-24 rounded-full border border-slate-200"
                            alt=""
                        />

                        <div>
                            <h2 className="text-xl font-semibold text-[#0F172A]">
                                {owner?.fullName}
                            </h2>
                            <p className="text-slate-500 text-sm mb-3">
                                @{owner?.username}
                            </p>

                            <Badge className="bg-blue-50 text-[#0072E5] border-blue-200 mb-4">
                                Project Owner
                            </Badge>

                            <Link to={`/profile/${owner?.username}`}>
                                <Button variant="outline">
                                    View Profile
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            ) : (
                /* ROLE VIEW */
                <div>
                    <div className="mb-8">
                        <h2 className="text-2xl font-semibold text-[#0F172A]">
                            {activeRole?.title}
                        </h2>
                        <p className="text-sm text-slate-500 mt-1">
                            {activeMembers.length} of{" "}
                            {activeRole?.membersRequired} positions filled
                        </p>
                    </div>

                    {activeMembers.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 text-center text-slate-500">
                            <div className="text-4xl mb-4">🪑</div>
                            No members assigned yet.
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {activeMembers.map((m) => (
                                <div
                                    key={m.userId}
                                    className="group rounded-2xl border border-slate-200 bg-white p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:border-[#0072E5]"
                                >
                                    <img
                                        src={m.avatar || "/avatar-placeholder.png"}
                                        className="h-16 w-16 rounded-full border border-slate-200 mb-4"
                                        alt=""
                                    />

                                    <Link
                                        to={`/profile/${m.username}`}
                                        className="block font-semibold text-[#0F172A] group-hover:text-[#0072E5] transition-colors"
                                    >
                                        {m.fullName}
                                    </Link>

                                    <p className="text-slate-500 text-sm mb-3">
                                        @{m.username}
                                    </p>

                                    <Badge className="bg-sky-50 text-sky-600 border-sky-200 text-xs">
                                        {activeRole?.title}
                                    </Badge>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}