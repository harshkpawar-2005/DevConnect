// src/pages/MyApplications.jsx
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { getApplicationsByUser } from "@/firebase/applicationApi";
import { getDoc, doc } from "firebase/firestore";
import { db } from "@/firebase/firebaseConfig";
import { Link } from "react-router-dom";

export default function MyApplications() {
  const { user, loading: authLoading } = useAuth();
  const isLoaded = !authLoading;
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLoaded) return;
    if (!user) {
      setApps([]);
      setLoading(false);
      return;
    }

    let mounted = true;
    (async () => {
      setLoading(true);
      try {
        const data = await getApplicationsByUser(user._id);

        const enriched = await Promise.all(
          data.map(async (a) => {
            try {
              const pSnap = await getDoc(doc(db, "projects", a.projectId));
              const project = pSnap.exists()
                ? { id: pSnap.id, ...pSnap.data() }
                : null;
              return { ...a, project };
            } catch {
              return { ...a, project: null };
            }
          })
        );

        if (mounted) setApps(enriched);
      } catch (e) {
        console.error(e);
        if (mounted) setApps([]);
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => (mounted = false);
  }, [user, isLoaded]);

  if (!isLoaded) return <div className="p-10 text-center">Loading...</div>;
  if (!user)
    return (
      <div className="p-10 text-center">Sign in to view your applications.</div>
    );

  return (
    <div className="container mx-auto px-6 py-10">
      <h2 className="text-4xl font-bold mb-10 text-center">My Applications</h2>

      {loading && <div className="p-6 text-center">Loading...</div>}

      {!loading && apps.length === 0 && (
        <div className="p-6 text-center text-slate-500">
          You haven't applied to any projects yet.
        </div>
      )}

      <div className="grid grid-cols-1 gap-4">
        {apps.map((a) => {
          const project = a.project;
          const appliedDate = a.appliedAt?.toDate
            ? a.appliedAt.toDate().toLocaleString()
            : "—";

          const statusColor =
            a.status === "accepted"
              ? "bg-green-500/20 text-green-600"
              : a.status === "rejected"
                ? "bg-red-500/20 text-red-500"
                : a.status === "interviewing"
                  ? "bg-blue-500/20 text-blue-600"
                  : "bg-slate-200 text-slate-700";

          return (
            <div
              key={a.id}
              className="
                p-4 
                bg-gradient-to-br from-white to-[#F1F5F9]
                border border-slate-200
                rounded-xl shadow-sm

                transition-all duration-300
                hover:-translate-y-1
                hover:shadow-lg
              "
            >
              {/* TOP ROW */}
              <div className="flex items-center justify-between">
                {/* LEFT */}
                <div>
                  <div className="font-semibold text-[#0F172A] text-lg">
                    {project?.projectTitle || "Project removed"}
                  </div>
                  <div className="text-sm text-slate-600">
                    Applied: {appliedDate}
                  </div>
                </div>

                {/* RIGHT */}
                <div className="flex items-center gap-3">
                  <div
                    className={`px-3 py-1 rounded-md text-sm capitalize ${statusColor}`}
                  >
                    {a.status}
                  </div>

                  {project ? (
                    <Link
                      to={`/project/${project.id}`}
                      className="text-sm underline text-blue-600"
                    >
                      View Project
                    </Link>
                  ) : (
                    <span className="text-sm text-slate-500">
                      Project removed
                    </span>
                  )}
                </div>
              </div>

              {/* DIVIDER */}
              <div className="border-b border-slate-200 mt-4 mb-3"></div>

              {/* ACCEPTED DISCLAIMER */}
              {a.status === "accepted" && (
                <div className="bg-green-50 border border-green-200 text-green-700 p-3 rounded-lg text-sm leading-relaxed">
                  ⭐ <strong>You have been accepted!</strong>
                  <br />
                  The project owner may contact you using the email or social links on your profile.
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
