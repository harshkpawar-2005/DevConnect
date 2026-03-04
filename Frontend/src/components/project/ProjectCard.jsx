/* eslint-disable react/prop-types */
import { Heart } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from "@/components/ui/tooltip";

export default function ProjectCard({
  project,
  isSaved = false,
  onToggleSave,
}) {
  const { user } = useAuth();
  const navigate = useNavigate();

  const {
    id,
    projectTitle,
    creatorId,
    creatorName,
    creatorImage,
    projectHeadline,
    status,
    techStack,
  } = project;


  /* ---------- Status badge config ---------- */
  const statusConfig = {
    open: { bg: "bg-green-100", text: "text-green-700", label: "Open" },
    paused: { bg: "bg-yellow-100", text: "text-yellow-700", label: "Paused" },
    completed: { bg: "bg-blue-100", text: "text-blue-700", label: "Completed" },
    expired: { bg: "bg-slate-100", text: "text-slate-600", label: "Expired" },
    closed: { bg: "bg-red-100", text: "text-red-600", label: "Closed" },
  };
  const s = statusConfig[status] || statusConfig.closed;

  /* ---------- Tech stack display ---------- */
  const tags = techStack || [];
  const visibleTags = tags.slice(0, 3);
  const extraCount = tags.length - 3;

  return (
    <Card
      className="
        bg-gradient-to-br from-white to-[#F1F5F9]
        border border-slate-200
        rounded-xl shadow-sm
        flex flex-col h-full
        w-full

        transition-all duration-300 ease-out
        hover:-translate-y-1
        hover:shadow-xl
        hover:border-sky-300
        hover:bg-gradient-to-br hover:from-white hover:to-sky-50
      "
    >
      {/* HEADER */}
      <CardHeader className="pb-1">
        <CardTitle className="text-[#0F172A] flex justify-between items-start gap-2">
          <Link to={`/project/${id}`} className="w-full group">
            <span className="block text-lg font-semibold line-clamp-1 leading-tight group-hover:underline">
              {projectTitle}
            </span>
          </Link>

          <span
            className={`text-xs px-3 py-1 rounded-full font-medium whitespace-nowrap ${s.bg} ${s.text}`}
          >
            {s.label}
          </span>
        </CardTitle>
      </CardHeader>

      {/* CREATOR */}
      <CardContent className="flex items-center gap-2 mt-1 mb-2">
        <img
          src={creatorImage || "/avatar-placeholder.png"}
          alt={creatorName}
          loading="lazy"
          referrerPolicy="no-referrer"
          className="h-7 w-7 rounded-full border border-slate-300 object-cover"
        />
        <span className="text-slate-500 text-sm">{creatorName}</span>
      </CardContent>

      <div className="border-b border-slate-200 w-full" />

      {/* HEADLINE + TECH STACK */}
      <CardContent className="mt-3 flex flex-col flex-1">
        <p
          className="text-slate-600 text-sm leading-relaxed overflow-hidden"
          style={{
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
          }}
        >
          {projectHeadline || "No summary provided."}
        </p>

        {/* Tech Stack Tags */}
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-3">
            {visibleTags.map((t, i) => (
              <span
                key={i}
                className="px-2 py-1 text-xs rounded-md bg-sky-50 text-sky-600 border border-sky-200"
              >
                {t}
              </span>
            ))}

            {extraCount > 0 && (
              <TooltipProvider delayDuration={200}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="px-2 py-1 text-xs rounded-md bg-slate-100 text-slate-600 border border-slate-200 cursor-pointer">
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
      </CardContent>

      {/* FOOTER */}
      <CardFooter className="flex justify-between items-center mt-auto">
        <Link to={`/project/${id}`} className="flex-1">
          <Button
            className="
              w-full
              bg-white
              text-[#0F172A]
              border border-slate-300
              hover:border-[#0072E5]
              transition-colors duration-200
              shadow-sm
            "
          >
            More Details
          </Button>
        </Link>

        <button
          onClick={() => {
            if (!user) {
              navigate("/login");
              return;
            }
            onToggleSave && onToggleSave(id);
          }}
          className="
            p-2 ml-3
            border border-slate-300
            rounded-lg
            hover:border-[#0072E5]
            transition-colors duration-200
          "
        >
          {isSaved ? (
            <Heart size={20} className="text-red-500" fill="red" />
          ) : (
            <Heart size={20} className="text-[#0F172A]" />
          )}
        </button>
      </CardFooter>
    </Card>
  );
}
