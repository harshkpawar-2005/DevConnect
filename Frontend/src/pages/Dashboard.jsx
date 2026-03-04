// src/pages/Dashboard.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import API from "@/api/axios";
import ProjectCard from "@/components/project/ProjectCard";

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [wishlist, setWishlist] = useState(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        // Fetch projects
        const projectRes = await API.get("/projects");
        const backendProjects = projectRes.data.data.projects;

        // Map backend fields → ProjectCard expected shape
        const mapped = backendProjects.map((p) => ({
          id: p._id,
          projectTitle: p.title,
          creatorId: p.ownerId?._id,
          creatorName: p.ownerId?.fullName,
          creatorImage: p.ownerId?.avatar,
          projectHeadline: p.summary,
          status: p.status,
          techStack: p.techStack,
        }));

        setProjects(mapped);

        // Fetch watchlist if logged in
        if (user) {
          try {
            const watchRes = await API.get("/watchlist");
            const savedIds = new Set(
              watchRes.data.data.map((w) => w._id)
            );
            setWishlist(savedIds);
          } catch {
            setWishlist(new Set());
          }
        } else {
          setWishlist(new Set());
        }
      } catch (err) {
        console.error("Failed to load projects:", err);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [user]);

  const handleToggleSaved = async (projectId) => {
    if (!user) {
      navigate("/login");
      return;
    }

    const isSaved = wishlist.has(projectId);

    // Optimistic update
    setWishlist((prev) => {
      const next = new Set(prev);
      if (isSaved) {
        next.delete(projectId);
      } else {
        next.add(projectId);
      }
      return next;
    });

    try {
      if (isSaved) {
        await API.delete(`/watchlist/${projectId}`);
      } else {
        await API.post(`/watchlist/${projectId}`);
      }
    } catch (err) {
      console.error("Toggle save failed:", err);

      // Rollback on failure
      setWishlist((prev) => {
        const next = new Set(prev);
        if (isSaved) {
          next.add(projectId);
        } else {
          next.delete(projectId);
        }
        return next;
      });
    }
  };

  if (loading)
    return (
      <div className="p-10 text-center">
        Loading latest projects...
      </div>
    );

  return (
    <div className="container mx-auto px-6 py-10 flex flex-col items-center">

      <h2 className="text-4xl font-bold mb-10 text-center">
        Latest Projects
      </h2>

      <div
        className="
          grid 
          grid-cols-1 
          sm:grid-cols-2 
          lg:grid-cols-3 
          gap-8 
          justify-items-center 
          w-full
        "
      >
        {projects.map((project) => (
          <ProjectCard
            key={project.id}
            project={project}
            isSaved={wishlist.has(project.id)}
            onToggleSave={handleToggleSaved}
          />
        ))}
      </div>
    </div>
  );
}