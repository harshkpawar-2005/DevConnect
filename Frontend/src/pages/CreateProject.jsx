// src/pages/CreateProject.jsx
import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

import {
  RadioGroup,
  RadioGroupItem,
} from "@/components/ui/radio-group";

import RoleInput from "@/components/roles/RoleInput";
import API from "@/api/axios";
import { toast } from "@/hooks/use-toast";

export default function CreateProject() {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Basic meta
  const [title, setTitle] = useState("");
  const [headline, setHeadline] = useState("");
  const [description, setDescription] = useState("");
  const [techInput, setTechInput] = useState("");
  const [techStack, setTechStack] = useState([]);

  // Roles
  const [roles, setRoles] = useState([
    { roleName: "", responsibilities: [""], requirements: [""], membersRequired: 1 },
  ]);

  // Availability
  const [availability, setAvailability] = useState("");

  // Stipend
  const [isPaid, setIsPaid] = useState(false);
  const [stipendAmount, setStipendAmount] = useState("");

  // Dates
  const [lastDate, setLastDate] = useState("");

  // Misc
  const [location, setLocation] = useState("");
  const [mode, setMode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [errorField, setErrorField] = useState("");

  // Refs for scroll-to-error
  const titleRef = useRef(null);
  const headlineRef = useRef(null);
  const descriptionRef = useRef(null);
  const techStackRef = useRef(null);
  const rolesRef = useRef(null);
  const availabilityRef = useRef(null);
  const modeRef = useRef(null);
  const locationRef = useRef(null);
  const lastDateRef = useRef(null);
  const stipendRef = useRef(null);

  const fieldRefs = {
    title: titleRef,
    headline: headlineRef,
    description: descriptionRef,
    techStack: techStackRef,
    roles: rolesRef,
    availability: availabilityRef,
    mode: modeRef,
    location: locationRef,
    lastDate: lastDateRef,
    stipend: stipendRef,
  };

  const showError = (field, message) => {
    setError(message);
    setErrorField(field);
    fieldRefs[field]?.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  /* ----------------- Handlers ----------------- */

  const addTech = () => {
    const t = techInput.trim();
    if (t && !techStack.includes(t)) {
      setTechStack((s) => [...s, t]);
      setTechInput("");
    }
  };

  const removeTech = (t) => {
    setTechStack((s) => s.filter((x) => x !== t));
  };

  const addRole = () => {
    setRoles((r) => [...r, { roleName: "", responsibilities: [""], requirements: [""], membersRequired: 1 }]);
  };

  const updateRole = (index, newRole) => {
    setRoles((r) => r.map((it, i) => (i === index ? newRole : it)));
  };

  const removeRole = (index) => {
    if (roles.length <= 1) return;
    setRoles((r) => r.filter((_, i) => i !== index));
  };

  /* ----------------- Submit ----------------- */

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setErrorField("");

    if (!user) return showError("title", "You must be signed in to post a project.");
    if (!title.trim()) return showError("title", "Please enter project title.");
    if (title.trim().length > 40) return showError("title", "Project title cannot exceed 40 characters.");

    if (headline.trim().length < 60) {
      return showError("headline", "Headline must be at least 60 characters.");
    }

    if (headline.trim().length > 180) {
      return showError("headline", "Headline cannot exceed 180 characters.");
    }

    if (!description.trim()) return showError("description", "Please add a description.");
    if (techStack.length === 0) return showError("techStack", "Please add at least one tech stack item.");
    if (!availability.trim()) return showError("availability", "Please enter availability / timing.");
    if (!mode) return showError("mode", "Please select a mode (Remote / Hybrid / Onsite).");
    if (!location.trim()) return showError("location", "Please enter a location.");
    if (!lastDate) return showError("lastDate", "Please set last date to apply.");

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (new Date(lastDate) < today) {
      return showError("lastDate", "Deadline must be today or a future date.");
    }

    if (roles.length === 0) {
      return showError("roles", "At least one role is required.");
    }

    for (let i = 0; i < roles.length; i++) {
      const role = roles[i];

      if (!role.roleName || !role.roleName.trim()) {
        return showError("roles", `Role ${i + 1}: Title is required.`);
      }

      const validResponsibilities = (role.responsibilities || []).filter(r => r.trim());
      if (validResponsibilities.length === 0) {
        return showError("roles", `Role ${i + 1}: At least one responsibility is required.`);
      }

      const validRequirements = (role.requirements || []).filter(r => r.trim());
      if (validRequirements.length === 0) {
        return showError("roles", `Role ${i + 1}: At least one requirement is required.`);
      }

      if (!role.membersRequired || Number(role.membersRequired) < 1) {
        return showError("roles", `Role ${i + 1}: Members required must be at least 1.`);
      }
    }

    const payload = {
      title: title.trim(),
      summary: headline.trim(),
      description: description.trim(),
      techStack,

      roles: roles.map((r) => ({
        title: r.roleName,
        responsibilities: (r.responsibilities || []).filter(Boolean),
        requirements: (r.requirements || []).filter(Boolean),
        membersRequired: Number(r.membersRequired) || 1,
      })),

      deadline: lastDate,
      stipend: isPaid ? stipendAmount.trim() : "Unpaid",
      availability: availability.trim(),
      timing: availability.trim(),
      mode: mode.trim(),
      location: location.trim(),
    };

    try {
      setLoading(true);

      const res = await API.post("/projects/post-project", payload);

      toast({
        title: "Project Created 🎉",
        description: "Your project has been posted successfully!",
      });

      navigate(`/project/${res.data.data._id}`);

    } catch (err) {
      console.error("Create project error:", err);

      toast({
        title: "Error",
        description: err.response?.data?.message || "Failed to create project.",
        variant: "destructive",
      });

      setError("Failed to create project.");
    } finally {
      setLoading(false);
    }
  };

  /* ----------------- UI ----------------- */

  return (
    <div className="container mx-auto px-6 py-10">
      <h1 className="text-2xl font-bold mb-2">Post a Project</h1>
      <p className="text-sm text-slate-500 mb-6">Fields marked with <span className="text-red-500 font-semibold">*</span> are required.</p>

      <form onSubmit={handleSubmit} className="space-y-6">

        {/* Title */}
        <div ref={titleRef}>
          <Label>Project Title <span className="text-red-500">*</span></Label>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={40}
            placeholder="e.g. Real-time chat app with React & Node.js"
            className={`mt-2 ${errorField === "title" ? "border-red-500 ring-1 ring-red-500" : ""}`}
          />
          <div className="flex justify-between mt-1">
            {errorField === "title" && <p className="text-xs text-red-500">{error}</p>}
            <p className="text-xs text-slate-500 ml-auto">{title.length} / 40 characters</p>
          </div>
        </div>

        {/* Headline */}
        <div ref={headlineRef}>
          <Label>Headline <span className="text-red-500">*</span></Label>
          <Textarea
            value={headline}
            onChange={(e) => setHeadline(e.target.value)}
            rows={2}
            maxLength={180}
            placeholder="Write a clear 1–2 sentence summary (60–180 characters)"
            className={`mt-2 ${errorField === "headline" ? "border-red-500 ring-1 ring-red-500" : ""}`}
          />
          <div className="flex justify-between mt-1">
            {errorField === "headline" && <p className="text-xs text-red-500">{error}</p>}
            <p className="text-xs text-slate-500 ml-auto">{headline.length} / 180 characters</p>
          </div>
        </div>

        {/* Description */}
        <div ref={descriptionRef}>
          <Label>Description <span className="text-red-500">*</span></Label>
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={6}
            placeholder="Describe the project in detail..."
            className={`mt-2 ${errorField === "description" ? "border-red-500 ring-1 ring-red-500" : ""}`}
          />
          {errorField === "description" && <p className="text-xs text-red-500 mt-1">{error}</p>}
        </div>

        {/* Tech Stack */}
        <div ref={techStackRef}>
          <Label>Tech Stack <span className="text-red-500">*</span></Label>
          <div className="flex gap-2 mt-2">
            <Input
              value={techInput}
              onChange={(e) => setTechInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTech())}
              placeholder="Type tech and press Enter"
            />
            <Button
              type="button"
              onClick={addTech}
              className="bg-gradient-to-r from-sky-400 to-blue-600 text-white shadow-md hover:shadow-xl transition-all duration-300 hover:scale-[1.03]"
            >
              Add
            </Button>
          </div>

          <div className="flex flex-wrap gap-2 mt-3">
            {techStack.map((t) => (
              <div key={t} className="px-3 py-1 rounded bg-slate-100 flex items-center gap-2">
                <span>{t}</span>
                <button
                  type="button"
                  onClick={() => removeTech(t)}
                  className="text-red-500"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
          {errorField === "techStack" && <p className="text-xs text-red-500 mt-1">{error}</p>}
        </div>

        {/* Roles */}
        <div ref={rolesRef}>
          <div className="flex items-center justify-between">
            <Label>Roles & Requirements <span className="text-red-500">*</span></Label>
            <Button
              type="button"
              onClick={addRole}
              className="bg-gradient-to-r from-sky-400 to-blue-600 text-white shadow-md hover:shadow-xl transition-all duration-300 hover:scale-[1.03]"
            >
              + Add Role
            </Button>
          </div>

          <div className="space-y-4 mt-4">
            {roles.map((role, idx) => (
              <RoleInput
                key={idx}
                index={idx}
                role={role}
                onChange={(r) => updateRole(idx, r)}
                onRemove={() => removeRole(idx)}
                canRemove={roles.length > 1}
              />
            ))}
          </div>
          {errorField === "roles" && <p className="text-xs text-red-500 mt-1">{error}</p>}
        </div>

        {/* Availability */}
        <div ref={availabilityRef}>
          <Label>Availability / Timing <span className="text-red-500">*</span></Label>
          <Input
            value={availability}
            onChange={(e) => setAvailability(e.target.value)}
            placeholder='e.g. "Evenings 7–10 PM" or "Flexible"'
            className={`mt-2 ${errorField === "availability" ? "border-red-500 ring-1 ring-red-500" : ""}`}
          />
          {errorField === "availability" && <p className="text-xs text-red-500 mt-1">{error}</p>}
        </div>

        {/* Location + Mode */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div ref={locationRef}>
            <Label>Location <span className="text-red-500">*</span></Label>
            <Input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="City / Remote"
              className={`mt-2 ${errorField === "location" ? "border-red-500 ring-1 ring-red-500" : ""}`}
            />
            {errorField === "location" && <p className="text-xs text-red-500 mt-1">{error}</p>}
          </div>

          <div ref={modeRef}>
            <Label>Mode <span className="text-red-500">*</span></Label>
            <select
              value={mode}
              onChange={(e) => setMode(e.target.value)}
              className={`mt-2 w-full rounded-md border bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${errorField === "mode" ? "border-red-500 ring-1 ring-red-500" : "border-input"}`}
            >
              <option value="">Select mode</option>
              <option value="Remote">Remote</option>
              <option value="Hybrid">Hybrid</option>
              <option value="Onsite">Onsite</option>
            </select>
            {errorField === "mode" && <p className="text-xs text-red-500 mt-1">{error}</p>}
          </div>
        </div>

        {/* Stipend */}
        <div ref={stipendRef}>
          <Label>Stipend <span className="text-red-500">*</span></Label>

          <RadioGroup
            defaultValue={isPaid ? "paid" : "unpaid"}
            onValueChange={(v) => setIsPaid(v === "paid")}
            className="mt-3 flex items-center gap-6"
          >
            {/* Unpaid */}
            <div className="flex items-center gap-2">
              <RadioGroupItem
                value="unpaid"
                id="unpaid"
              // className="text-[#0072E5] border-[#0072E5] data-[state=checked]:bg-[#0072E5]"
              />
              <Label htmlFor="unpaid">Unpaid</Label>
            </div>

            {/* Paid */}
            <div className="flex items-center gap-2">
              <RadioGroupItem
                value="paid"
                id="paid"
              // className="text-[#0072E5] border-[#0b0b0b] data-[stat"
              />
              <Label htmlFor="paid">Paid</Label>
            </div>
          </RadioGroup>


          {isPaid && (
            <Input
              value={stipendAmount}
              onChange={(e) => setStipendAmount(e.target.value)}
              placeholder="Amount (e.g. ₹2000 / $20/month)"
              className="mt-3"
            />
          )}
        </div>

        {/* Last Date */}
        <div ref={lastDateRef}>
          <Label>Last date to apply <span className="text-red-500">*</span></Label>
          <Input
            type="date"
            value={lastDate}
            onChange={(e) => setLastDate(e.target.value)}
            className={`mt-2 ${errorField === "lastDate" ? "border-red-500 ring-1 ring-red-500" : ""}`}
          />
          {errorField === "lastDate" && <p className="text-xs text-red-500 mt-1">{error}</p>}
        </div>

        {/* Submit */}
        <div className="flex items-center gap-4 pt-4">
          <Button
            type="submit"
            disabled={loading}
            className="bg-gradient-to-r from-sky-400 to-blue-600 text-white shadow-md hover:shadow-xl transition-all duration-300 hover:scale-[1.03]"
          >
            {loading ? "Posting..." : "Post Project"}
          </Button>

          <Button variant="outline" type="button" onClick={() => navigate("/dashboard")}>
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}
