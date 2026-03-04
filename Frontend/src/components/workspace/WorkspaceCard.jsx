/* eslint-disable react/prop-types */
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import {
    Tooltip,
    TooltipTrigger,
    TooltipContent,
    TooltipProvider,
} from "@/components/ui/tooltip";

const statusConfig = {
    open: { className: "bg-green-100 text-green-700 border-green-200", label: "Open" },
    paused: { className: "bg-yellow-100 text-yellow-700 border-yellow-200", label: "Paused" },
    completed: { className: "bg-blue-100 text-blue-700 border-blue-200", label: "Completed" },
    expired: { className: "bg-slate-100 text-slate-600 border-slate-200", label: "Expired" },
    closed: { className: "bg-red-100 text-red-600 border-red-200", label: "Closed" },
};

export default function WorkspaceCard({ project, role = "Owner" }) {
    const navigate = useNavigate();

    const s = statusConfig[project.status] || statusConfig.closed;
    const tags = project.techStack || [];
    const visibleTags = tags.slice(0, 3);
    const extraCount = tags.length - 3;

    return (
        <div
            onClick={() => navigate(`/project/${project.projectId}/workspace`)}
            className="
        rounded-2xl
        bg-white
        border border-slate-200
        shadow-sm
        p-5
        cursor-pointer

        transition-all duration-300 ease-out
        hover:-translate-y-1
        hover:shadow-xl
        hover:border-[#0072E5]
      "
        >
            {/* Title + Status */}
            <div className="flex items-start justify-between gap-3 mb-3">
                <h3 className="text-lg font-semibold text-[#0F172A] leading-tight line-clamp-1">
                    {project.title}
                </h3>
                <Badge className={`shrink-0 text-xs ${s.className}`}>
                    {s.label}
                </Badge>
            </div>

            {/* Role + Team + Mode */}
            <div className="flex flex-wrap items-center gap-2 mb-3">
                <Badge className="bg-blue-50 text-[#0072E5] border-blue-200 text-xs">
                    {role}
                </Badge>

                {project.teamCount != null && (
                    <span className="text-xs text-slate-500">
                        👥 {project.teamCount} member{project.teamCount !== 1 ? "s" : ""}
                    </span>
                )}

                {project.mode && (
                    <span className="text-xs text-slate-500">
                        📍 {project.mode}
                    </span>
                )}
            </div>

            {/* Tech Stack */}
            {tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                    {visibleTags.map((t, i) => (
                        <span
                            key={i}
                            className="px-2 py-0.5 text-xs rounded-md bg-sky-50 text-sky-600 border border-sky-200"
                        >
                            {t}
                        </span>
                    ))}

                    {extraCount > 0 && (
                        <TooltipProvider delayDuration={200}>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <span className="px-2 py-0.5 text-xs rounded-md bg-slate-100 text-slate-600 border border-slate-200 cursor-pointer">
                                        +{extraCount}
                                    </span>
                                </TooltipTrigger>
                                <TooltipContent side="top" className="max-w-xs">
                                    <p className="text-xs">{tags.slice(3).join(", ")}</p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    )}
                </div>
            )}
        </div>
    );
}
