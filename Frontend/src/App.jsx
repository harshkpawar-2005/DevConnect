import { Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import LandingPage from './pages/LandingPage';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import CreateProject from './pages/CreateProject';
import MyApplications from "@/pages/MyApplications";
import MyProjects from "@/pages/MyProjects";
import SavedProjects from "@/pages/SavedProjects";
import ProjectDetails from "@/pages/ProjectDetails";
import ProjectApplicants from "@/pages/ProjectApplicants";
import ProtectedRoute from "@/components/ProtectedRoute";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import WorkspaceIndex from "@/pages/WorkspaceIndex";
import ProjectWorkspace from "@/pages/ProjectWorkspace";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        {/* Public routes */}
        <Route index element={<LandingPage />} />
        <Route path="login" element={<Login />} />
        <Route path="register" element={<Register />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="project/:id" element={<ProjectDetails />} />
        <Route path="profile/:username" element={<Profile />} />

        {/* Protected routes */}
        <Route path="create-project" element={<ProtectedRoute><CreateProject /></ProtectedRoute>} />
        <Route path="my-projects" element={<ProtectedRoute><MyProjects /></ProtectedRoute>} />
        <Route path="saved-projects" element={<ProtectedRoute><SavedProjects /></ProtectedRoute>} />
        <Route path="/applications" element={<ProtectedRoute><MyApplications /></ProtectedRoute>} />
        <Route path="project/:projectId/applicants" element={<ProtectedRoute><ProjectApplicants /></ProtectedRoute>} />
        <Route path="workspace" element={<ProtectedRoute><WorkspaceIndex /></ProtectedRoute>} />
        <Route path="project/:id/workspace" element={<ProtectedRoute><ProjectWorkspace /></ProtectedRoute>} />
      </Route>
    </Routes>
  );
}

export default App;