// src/pages/SavedProjects.jsx
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import API from "@/api/axios";
import ProjectCard from "@/components/project/ProjectCard";

export default function SavedProjects() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const isLoaded = !authLoading;
  const [projects, setProjects] = useState([]);
  const [wishlist, setWishlist] = useState(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }

    async function load() {
      setLoading(true);
      try {
        const res = await API.get("/watchlist");
        const backendProjects = res.data.data || [];

        const mapped = backendProjects.map((p) => ({
          id: p._id,
          projectTitle: p.title,
          projectHeadline: p.summary,
          techStack: p.techStack,
          status: p.status,
          creatorId: p.ownerId?._id,
          creatorName: p.ownerId?.fullName,
          creatorImage: p.ownerId?.avatar,
        }));

        setProjects(mapped);
        setWishlist(new Set(mapped.map((p) => p.id)));
      } catch (e) {
        console.error("Failed to load watchlist:", e);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [user]);

  const handleToggleSaved = async (projectId) => {
    try {
      await API.delete(`/watchlist/${projectId}`);

      setProjects((prev) => prev.filter((p) => p.id !== projectId));

      setWishlist((prev) => {
        const next = new Set(prev);
        next.delete(projectId);
        return next;
      });
    } catch (e) {
      console.error("Remove saved failed:", e);
    }
  };

  if (!isLoaded) return <div className="p-10 text-center">Loading...</div>;
  if (loading) return <div className="p-10 text-center">Loading saved projects...</div>;
  if (!projects.length) return <div className="p-10 text-center">No saved projects yet.</div>;

  return (
    <div className="container mx-auto px-6 py-10">
      <h2 className="text-4xl font-bold mb-10 text-center">
        Saved Projects
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((p) => (
          <ProjectCard
            key={p.id}
            project={p}
            isSaved={wishlist.has(p.id)}
            onToggleSave={handleToggleSaved}
          />
        ))}
      </div>
    </div>
  );
}
