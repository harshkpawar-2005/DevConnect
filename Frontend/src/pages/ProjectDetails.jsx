// src/pages/ProjectDetails.jsx
import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import API from "@/api/axios";
import { toast } from "@/hooks/use-toast";
import { Heart, ArrowRight, Mail } from "lucide-react";

// Shadcn Dialog (apply modal)
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

// Shadcn Select (role dropdown inside modal)
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

// Shadcn Textarea (message field inside modal)
import { Textarea } from "@/components/ui/textarea";

export default function ProjectDetails() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);

  // Wishlist
  const [wishlistSet, setWishlistSet] = useState(new Set());

  // Application state
  const [alreadyApplied, setAlreadyApplied] = useState(false);

  // Apply modal state
  const [applyModalOpen, setApplyModalOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState("");
  const [messageText, setMessageText] = useState("");
  const [roleError, setRoleError] = useState("");
  const [applyLoading, setApplyLoading] = useState(false);

  /* ---------------- Load Project from Backend ---------------- */
  useEffect(() => {
    async function load() {
      try {
        const res = await API.get(`/projects/${id}`);
        setProject(res.data.data);
      } catch (e) {
        console.error("Load project error:", e);
        setProject(null);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  /* ---------------- Load Wishlist from Backend ---------------- */
  useEffect(() => {
    if (!user) {
      setWishlistSet(new Set());
      return;
    }

    async function loadWishlist() {
      try {
        const res = await API.get("/watchlist");
        const ids = (res.data.data || []).map((p) => p._id);
        setWishlistSet(new Set(ids));
      } catch (e) {
        console.error("Load watchlist error:", e);
      }
    }
    loadWishlist();
  }, [user]);

  /* ---------------- Check if already applied ---------------- */
  useEffect(() => {
    if (!user) return;

    async function checkApplied() {
      try {
        const res = await API.get("/requests/my-applications");
        const apps = res.data.data || [];
        const applied = apps.some(
          (a) =>
            (a.projectId?._id || a.projectId) === id
        );
        setAlreadyApplied(applied);
      } catch (e) {
        console.error("Check applied error:", e);
      }
    }
    checkApplied();
  }, [user, id]);

  /* ---------------- Wishlist Toggle ---------------- */
  const toggleSave = async () => {
    if (!user) {
      navigate("/login");
      return;
    }

    const isSaved = wishlistSet.has(id);

    // Optimistic update
    setWishlistSet((prev) => {
      const next = new Set(prev);
      if (isSaved) next.delete(id);
      else next.add(id);
      return next;
    });

    try {
      if (isSaved) {
        await API.delete(`/watchlist/${id}`);
      } else {
        await API.post(`/watchlist/${id}`);
      }
    } catch (e) {
      console.error("Toggle save error:", e);
      // Rollback
      setWishlistSet((prev) => {
        const next = new Set(prev);
        if (isSaved) next.add(id);
        else next.delete(id);
        return next;
      });
    }
  };

  /* ---------------- Apply Handler (open modal) ---------------- */
  const handleApplyClick = () => {
    if (!user) {
      navigate("/login");
      return;
    }
    if (isOwner) return;
    setSelectedRole("");
    setMessageText("");
    setRoleError("");
    setApplyModalOpen(true);
  };

  /* ---------------- Apply Submit ---------------- */
  const handleApplySubmit = async () => {
    if (isOwner) return;
    if (!selectedRole) {
      setRoleError("Please select a role.");
      return;
    }
    setRoleError("");
    setApplyLoading(true);

    try {
      await API.post(`/projects/${id}/apply`, {
        appliedRole: selectedRole,
        message: messageText,
      });

      setApplyModalOpen(false);
      setAlreadyApplied(true);

      toast({
        title: "Application Submitted ✓",
        description: "Application submitted successfully",
      });
    } catch (e) {
      console.error("Apply error:", e);
      toast({
        title: "Error",
        description:
          e.response?.data?.message || "Failed to submit application.",
        variant: "destructive",
      });
    } finally {
      setApplyLoading(false);
    }
  };

  /* ---------------- Loading UI ---------------- */
  if (loading)
    return <div className="text-center p-10 text-slate-500">Loading...</div>;

  if (!project)
    return <div className="text-center p-10">Project not found.</div>;

  /* ---------------- Extract Data ---------------- */
  const {
    title,
    summary,
    description,
    techStack,
    roles,

    ownerId,

    availability,
    stipend,
    timing,

    location,
    mode,
    deadline,
    status,
    createdAt,
  } = project;

  const creatorName = ownerId?.fullName || "";
  const creatorImage = ownerId?.avatar || "";
  const creatorUsername = ownerId?.username || "";

  const isOwner = user?._id === ownerId?._id;

  /* ---------------- Deadline Logic ---------------- */
  const parseDate = (d) => {
    if (!d) return null;
    try {
      if (d?.toDate) return d.toDate();
      const parsed = new Date(d);
      if (!isNaN(parsed.getTime())) return parsed;
    } catch (e) { }
    return null;
  };

  const deadlineDate = parseDate(deadline);

  const computeDaysLeft = (deadline) => {
    if (!deadline) return null;
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const dl = new Date(
      deadline.getFullYear(),
      deadline.getMonth(),
      deadline.getDate()
    );
    const msPerDay = 1000 * 60 * 60 * 24;
    return Math.ceil((dl - today) / msPerDay);
  };

  const daysLeftNumber = computeDaysLeft(deadlineDate);

  const DaysLeftPill = () => {
    if (daysLeftNumber == null) return null;

    if (daysLeftNumber < 0) {
      return (
        <div className="w-24 h-28 rounded-xl bg-white border border-red-200 shadow-md overflow-hidden flex flex-col">
          <div className="flex-1 flex items-center justify-center">
            <div className="text-2xl font-bold text-red-500">✗</div>
          </div>
          <div className="h-9 bg-red-50 flex items-center justify-center border-t border-red-100">
            <div className="text-sm font-medium text-red-600">Expired</div>
          </div>
        </div>
      );
    }

    const isLastDay = daysLeftNumber === 0;
    const numberToShow = isLastDay ? 1 : daysLeftNumber;

    return (
      <div className="w-24 h-28 rounded-xl bg-white border border-slate-200 shadow-md overflow-hidden flex flex-col">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-4xl font-bold bg-gradient-to-r from-sky-500 to-blue-600 bg-clip-text text-transparent">
            {numberToShow > 99 ? "99+" : numberToShow}
          </div>
        </div>
        <div className="h-9 bg-slate-50 flex items-center justify-center border-t border-slate-100">
          <div className="text-sm font-medium text-slate-600">
            {isLastDay ? "Last day" : "Days Left"}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="w-full max-w-6xl mx-auto px-6 py-10">
      {/* ---------------- HERO SECTION ---------------- */}
      <div className="mb-10">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <h1 className="text-4xl font-bold text-[#0F172A] leading-tight">
              {title}
            </h1>
            {summary ? (
              <p className="text-slate-500 text-lg mt-3 leading-relaxed">{summary}</p>
            ) : null}
          </div>

          <div className="ml-4 flex-shrink-0">
            <DaysLeftPill />
          </div>
        </div>

        {/* Creator (clickable name/image goes to profile) */}
        <div className="flex items-center gap-3 mt-6">
          <Link to={`/profile/${creatorUsername}`}>
            <img
              src={creatorImage || "/avatar-placeholder.png"}
              alt={creatorName}
              loading="lazy"
              referrerPolicy="no-referrer"
              className="h-12 w-12 rounded-full border border-slate-300 object-cover"
            />
          </Link>

          <div>
            <Link
              to={`/profile/${creatorUsername}`}
              className="font-semibold text-[#0F172A] hover:text-[#0072E5] transition"
            >
              {creatorName}
            </Link>
            <div className="text-slate-500 text-sm">@{creatorUsername}</div>
          </div>
        </div>

        {/* Status + Wishlist */}
        <div className="flex items-center gap-4 mt-6">
          <StatusBadge status={status} />

          {!isOwner && (
            <button
              onClick={toggleSave}
              className="p-3 border border-slate-300 rounded-lg hover:border-[#0072E5] transition"
            >
              {wishlistSet.has(id) ? (
                <Heart className="text-red-500" fill="red" size={24} />
              ) : (
                <Heart className="text-[#0F172A]" size={24} />
              )}
            </button>
          )}
        </div>
      </div>

      {/* ---------------- MAIN LAYOUT ---------------- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* LEFT (project content) */}
        <div className="lg:col-span-2 flex flex-col gap-8">
          <SectionCard title="About This Project">
            <p className="text-slate-700 whitespace-pre-line leading-relaxed">
              {description || "No description provided."}
            </p>
          </SectionCard>

          <SectionCard title="Required Skills (Tech Stack)">
            <div className="flex flex-wrap gap-2">
              {techStack?.length ? (
                techStack.map((t, i) => (
                  <span
                    key={i}
                    className="px-3 py-1 rounded-full bg-blue-100 text-blue-600 border border-blue-200 text-sm"
                  >
                    {t}
                  </span>
                ))
              ) : (
                <p className="text-slate-500">No tech listed.</p>
              )}
            </div>
          </SectionCard>

          <SectionCard title="Roles & Responsibilities">
            {roles?.length ? (
              roles.map((role, idx) => (
                <div
                  key={idx}
                  className="p-5 mb-4 border border-slate-200 rounded-lg bg-white"
                >
                  <h3 className="text-xl font-semibold text-[#0F172A]">
                    {role.title || role.roleName}
                  </h3>

                  <h4 className="mt-3 font-medium text-[#0F172A]">Responsibilities:</h4>
                  <ul className="list-disc ml-6 text-slate-700">
                    {role.responsibilities?.map((r, i) => (
                      <li key={i}>{r}</li>
                    ))}
                  </ul>

                  <h4 className="mt-4 font-medium text-[#0F172A]">Requirements:</h4>
                  <ul className="list-disc ml-6 text-slate-700">
                    {role.requirements?.map((r, i) => (
                      <li key={i}>{r}</li>
                    ))}
                  </ul>

                  <p className="mt-3 text-sm text-slate-500">
                    Members Required: <strong>{role.membersRequired}</strong>
                  </p>
                </div>
              ))
            ) : (
              <p className="text-slate-500">No roles specified.</p>
            )}
          </SectionCard>

          <SectionCard title="Additional Details">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InfoBlock title="Last Date to Apply" value={deadline ? new Date(deadline).toLocaleDateString() : "Not set"} />
              <InfoBlock title="Stipend" value={stipend || "Unpaid"} />
              <InfoBlock title="Availability" value={availability || "Not provided"} />
              <InfoBlock title="Timing" value={timing || "Not specified"} />
              <InfoBlock title="Mode" value={mode || "Not specified"} />
              <InfoBlock title="Location" value={location || "Not specified"} />
            </div>
          </SectionCard>

          <SectionCard title="Contact the Creator">
            <div className="flex items-center gap-4">
              <Mail className="text-[#0072E5]" size={22} />
              {ownerId?.email ? (
                <a
                  href={`mailto:${ownerId.email}`}
                  className="text-blue-600 underline text-lg"
                >
                  {ownerId.email}
                </a>
              ) : (
                <span className="text-slate-500 text-lg">Email not available</span>
              )}
            </div>
          </SectionCard>
        </div>

        {/* RIGHT SIDEBAR */}
        <div className="lg:col-span-1">
          <div className="sticky top-24 p-6 border border-slate-200 bg-white rounded-xl shadow-sm flex flex-col gap-4">
            <h3 className="text-xl font-semibold text-[#0F172A] mb-2">
              {isOwner ? "Manage Project" : "Join This Project"}
            </h3>

            {isOwner ? (
              <>
                {/* VIEW APPLICANTS BUTTON */}
                <button
                  onClick={() => navigate(`/project/${id}/applicants`)}
                  className="
                    w-full py-2 rounded-lg font-medium
                    bg-gradient-to-r from-sky-400 to-blue-600 text-white
                    hover:shadow-lg hover:-translate-y-0.5
                    transition-all duration-300
                    shadow-sm
                  "
                >
                  View Applicants
                </button>
              </>
            ) : (
              <>
                {/* Apply Now */}
                <button
                  disabled={
                    alreadyApplied ||
                    status !== "open" ||
                    !roles?.length
                  }
                  onClick={handleApplyClick}
                  className={`w-full py-2 rounded-lg font-medium transition-all duration-300 ${alreadyApplied
                    ? "bg-slate-200 text-slate-600 cursor-not-allowed"
                    : (status !== "open" || !roles?.length)
                      ? "bg-red-200 text-red-700 cursor-not-allowed"
                      : "bg-gradient-to-r from-sky-400 to-blue-600 text-white hover:shadow-lg hover:-translate-y-0.5"
                    }`}
                >
                  {alreadyApplied
                    ? "✓ Applied"
                    : (status !== "open" || !roles?.length)
                      ? "Closed"
                      : "Apply Now"}
                  {!alreadyApplied && status === "open" && roles?.length > 0 && (
                    <ArrowRight className="inline ml-1" size={18} />
                  )}
                </button>

                {/* Save button */}
                <button
                  onClick={toggleSave}
                  className="w-full border border-slate-300 py-2 rounded-lg hover:border-[#0072E5] transition text-[#0F172A]"
                >
                  {wishlistSet.has(id) ? "Unsave Project" : "Save Project"}
                </button>
              </>
            )}
          </div>
        </div>

      </div>

      {/* ---------------- APPLY MODAL (SHADCN DIALOG) ---------------- */}
      <Dialog open={applyModalOpen} onOpenChange={setApplyModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Apply for this Project</DialogTitle>
            <DialogDescription>
              Select a role and optionally include a message.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 pt-2">
            {/* Role Dropdown */}
            <div>
              <label className="block text-sm font-medium text-[#0F172A] mb-1">
                Role <span className="text-red-500">*</span>
              </label>
              <Select
                value={selectedRole}
                onValueChange={(v) => {
                  setSelectedRole(v);
                  setRoleError("");
                }}
              >
                <SelectTrigger className="w-full border border-slate-200 rounded-lg">
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  {(roles || []).map((role, idx) => (
                    <SelectItem
                      key={idx}
                      value={role.title || role.roleName || `Role ${idx + 1}`}
                    >
                      {role.title || role.roleName || `Role ${idx + 1}`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {roleError && (
                <p className="text-red-500 text-sm mt-1">{roleError}</p>
              )}
            </div>

            {/* Message Field */}
            <div>
              <label className="block text-sm font-medium text-[#0F172A] mb-1">
                Message <span className="text-slate-400">(optional)</span>
              </label>
              <Textarea
                value={messageText}
                onChange={(e) => {
                  if (e.target.value.length <= 300) {
                    setMessageText(e.target.value);
                  }
                }}
                maxLength={300}
                rows={4}
                placeholder="Why are you a good fit for this role?"
                className="w-full"
              />
              <p className="text-xs text-slate-500 text-right mt-1">
                {messageText.length} / 300
              </p>
            </div>

            {/* Submit */}
            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setApplyModalOpen(false)}
                className="px-4 py-2 rounded-lg border border-slate-300 text-[#0F172A] hover:bg-slate-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleApplySubmit}
                disabled={applyLoading}
                className="px-4 py-2 rounded-lg bg-gradient-to-r from-sky-400 to-blue-600 text-white font-medium hover:shadow-lg transition-all duration-300 disabled:opacity-50"
              >
                {applyLoading ? "Submitting..." : "Submit Application"}
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

/* ------------------- Reusable Components ------------------- */

function StatusBadge({ status }) {
  const config = {
    open:      { bg: "bg-green-500/20",  text: "text-green-600", label: "Open to Join" },
    paused:    { bg: "bg-yellow-500/20", text: "text-yellow-600", label: "Paused" },
    completed: { bg: "bg-blue-500/20",   text: "text-blue-600",  label: "Completed" },
    expired:   { bg: "bg-slate-200",     text: "text-slate-600", label: "Expired" },
    closed:    { bg: "bg-red-500/20",    text: "text-red-500",   label: "Closed" },
  };

  const s = config[status] || config.closed;

  return (
    <span className={`text-sm px-4 py-1 rounded-lg font-medium ${s.bg} ${s.text}`}>
      {s.label}
    </span>
  );
}

function SectionCard({ title, children }) {
  return (
    <div className="bg-gradient-to-br from-white to-[#F1F5F9] border border-slate-200 rounded-xl p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
      <h2 className="text-2xl font-semibold text-[#0F172A] mb-4">{title}</h2>
      {children}
    </div>
  );
}

function InfoBlock({ title, value }) {
  return (
    <div className="border border-slate-200 rounded-lg p-4 bg-white">
      <h4 className="text-sm font-medium text-[#0F172A] mb-1">{title}</h4>
      <p className="text-slate-700">{value}</p>
    </div>
  );
}
