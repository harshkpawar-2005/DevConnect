// src/pages/MyProjects.jsx
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import API from "@/api/axios";
import ProjectCard from "@/components/project/ProjectCard";

export default function MyProjects() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const isLoaded = !authLoading;
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLoaded) return;

    if (!user) {
      navigate("/login");
      return;
    }

    async function load() {
      setLoading(true);
      try {
        const res = await API.get("/projects/my-projects");
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
      } catch (e) {
        console.error("Failed to load my projects:", e);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [isLoaded, user]);

  if (!isLoaded) return <div className="p-10 text-center">Loading...</div>;
  if (loading) return <div className="p-10 text-center">Loading...</div>;
  if (!projects.length) return <div className="p-10 text-center">You haven't created any projects yet.</div>;

  return (
    <div className="container mx-auto px-6 py-10">

      {/* Centered Title */}
      <h2 className="text-4xl font-bold mb-10 text-center">
        My Projects
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((p) => (
          <ProjectCard
            key={p.id}
            project={p}
            isSaved={false}
            onToggleSave={undefined}
            onDelete={async () => {
              if (!confirm("Are you sure you want to delete this project? This cannot be undone.")) return;

              try {
                await API.delete(`/projects/${p.id}`);
                setProjects((prev) => prev.filter((proj) => proj.id !== p.id));
              } catch (e) {
                console.error("Delete failed:", e);
              }
            }}
          />
        ))}
      </div>
    </div>
  );
}
