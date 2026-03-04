// src/pages/Profile.jsx
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

import PencilIcon from "@/assets/pencil.png";
import ExternalIcon from "@/assets/external.png";

import { getUserProfileByUsername, updateUserProfile } from "@/firebase/userApi";

// --- ShadCN Components ---
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

import {
  Github,
  Linkedin,
  Twitter,

  Globe,
  Link as LinkIcon,
  Instagram,
} from "lucide-react";


/* ----------------- Helpers ----------------- */
function normalizeUrl(url) {
  if (!url) return "";
  try {
    if (url.startsWith("http://") || url.startsWith("https://")) return url;
    return `https://${url}`;
  } catch {
    return "";
  }
}

function detectPlatform(url = "") {
  const u = url.toLowerCase();

  if (u.includes("github.com"))
    return { name: "GitHub", Icon: Github };
  if (u.includes("instagram.com"))
    return { name: "Instagram", Icon: Instagram };

  if (u.includes("linkedin.com"))
    return { name: "LinkedIn", Icon: Linkedin };

  if (u.includes("twitter.com") || u.includes("x.com"))
    return { name: "Twitter", Icon: Twitter };

  return { name: "Website", Icon: Globe };
}


/* ----------------- Glass Wrapper (keeps your style) ----------------- */
function GlassWrapper({ children, className = "" }) {
  // Use Card for structure but keep your glass visual
  return (
    <Card className={`bg-white/30 backdrop-blur-xl border border-white/40 rounded-2xl p-6 shadow-lg text-slate-900 ${className}`}>
      {children}
    </Card>
  );
}

/* ----------------- Modal Wrapper (keep your glass modal) ----------------- */
function Modal({ title, onClose, children, wide }) {
  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-start justify-center p-6">
      <div className={`bg-white rounded-xl shadow-xl p-6 w-full ${wide ? "max-w-5xl" : "max-w-md"}`}>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">{title}</h3>
          <button onClick={onClose} className="text-slate-600">✕</button>
        </div>

        <Separator className="mb-4" />
        {children}
      </div>
    </div>
  );
}

/* ===============================================================
   PROFILE COMPONENT (ShadCN inside Glass Modals)
================================================================ */
export default function Profile() {
  const { username } = useParams(); // route: /profile/:username
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);

  // modal states
  const [aboutModalOpen, setAboutModalOpen] = useState(false);
  const [eduModalOpen, setEduModalOpen] = useState(false);
  const [workModalOpen, setWorkModalOpen] = useState(false);
  const [skillsModalOpen, setSkillsModalOpen] = useState(false);
  const [linksModalOpen, setLinksModalOpen] = useState(false);

  // forms and lists
  const [aboutForm, setAboutForm] = useState({ headline: "", about: "", location: "" });

  const [eduList, setEduList] = useState([]);
  const [eduShowForm, setEduShowForm] = useState(false);
  const [eduForm, setEduForm] = useState({ org: "", role: "", timeline: "" });
  const [eduEditIndex, setEduEditIndex] = useState(null);

  const [workList, setWorkList] = useState([]);
  const [workShowForm, setWorkShowForm] = useState(false);
  const [workForm, setWorkForm] = useState({ org: "", role: "", timeline: "" });
  const [workEditIndex, setWorkEditIndex] = useState(null);

  const [skillsList, setSkillsList] = useState([]);
  const [skillInput, setSkillInput] = useState("");
  const [skillShowForm, setSkillShowForm] = useState(false);

  const [linksList, setLinksList] = useState([]);
  const [linkShowForm, setLinkShowForm] = useState(false);
  const [linkForm, setLinkForm] = useState({ url: "" });
  const [linkEditIndex, setLinkEditIndex] = useState(null);

  const [saving, setSaving] = useState(false);

  // owner check: only if logged-in user's clerk id === profile.id
  const isOwner = !!(user?._id && profile?.id && user._id === profile.id);

  /* ----------------- Load profile by username from Firestore (safe fallbacks) ----------------- */
  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      try {
        if (!username) {
          if (mounted) setProfile(null);
          return;
        }

        const data = await getUserProfileByUsername(username);

        if (!data) {
          if (mounted) setProfile(null);
          return;
        }

        /* Normalize to a safe UI shape and use proper fallbacks (no duplicates) */
        const finalProfile = {
          id: data.userId || data.id || data.uid || null,
          name: data.fullName || data.name || data.displayName || "",
          email: data.email || "",
          // canonical image field from your firestore profile (prefer Firestore image)
          image: data.image || data.imageUrl || data.photoUrl || "",
          headline: data.headline || data.bio || "",
          about: data.about || data.bio || "",
          location: data.location || "",
          education: Array.isArray(data.education) ? data.education : [],
          work: Array.isArray(data.work) ? data.work : [],
          skills: Array.isArray(data.skills) ? data.skills : [],
          links: Array.isArray(data.links) ? data.links : [],
          username: data.username || username,
        };

        if (mounted) {
          setProfile(finalProfile);
          setEduList(finalProfile.education || []);
          setWorkList(finalProfile.work || []);
          setSkillsList(finalProfile.skills || []);
          setLinksList(finalProfile.links || []);
        }
      } catch (e) {
        console.error("Error loading profile", e);
        if (mounted) setProfile(null);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    load();
    return () => (mounted = false);
  }, [username]);

  // 🔥 Sync Clerk profile (name + image) INTO Firestore automatically
  useEffect(() => {
    if (!profile || !user) return;
    if (user._id !== profile.id) return; // only update for the owner

    const updates = {};

    // Sync full name
    if (user.fullName && user.fullName !== profile.name) {
      updates.name = user.fullName;
    }

    // Sync profile image
    if (user.imageUrl && user.imageUrl !== profile.image) {
      updates.image = user.imageUrl;
    }

    // If there's anything to update in Firestore
    if (Object.keys(updates).length > 0) {
      updateUserProfile(user._id, updates)
        .then(() => {
          setProfile((prev) => ({ ...prev, ...updates })); // update UI instantly
        })
        .catch((err) => console.error("Profile sync error:", err));
    }
  }, [user?.fullName, user?.imageUrl]);


  /* ----------------- Sync Clerk (only when owner is viewing) -----------------
     Problem you had: previously the code updated profile with the *viewer*'s
     Clerk image/name even when another user was viewing. Fix: only sync when
     the current logged-in user is the same as the profile owner (user.id === profile.id).
  ------------------------------------------------------------------------- */
  useEffect(() => {
    if (!profile || !user) return;

    // Only sync when the logged-in user is the profile owner
    if (user._id !== profile.id) return;

    const updates = {};
    if (user.fullName && user.fullName !== profile.name) updates.name = user.fullName;
    if (user.imageUrl && user.imageUrl !== profile.image) updates.image = user.imageUrl;

    if (Object.keys(updates).length > 0) {
      setProfile((prev) => ({ ...prev, ...updates }));
    }
  }, [user?.fullName, user?.imageUrl, profile?.id]);

  /* ----------------- Modal open helpers (prepare forms) ----------------- */
  const openAboutModal = () => {
    setAboutForm({
      headline: profile.headline || "",
      about: profile.about || "",
      location: profile.location || "",
    });
    setAboutModalOpen(true);
  };

  const openEduModal = () => {
    setEduList(profile.education || []);
    setEduShowForm(false);
    setEduEditIndex(null);
    setEduModalOpen(true);
  };

  const openWorkModal = () => {
    setWorkList(profile.work || []);
    setWorkShowForm(false);
    setWorkEditIndex(null);
    setWorkModalOpen(true);
  };

  const openSkillsModal = () => {
    setSkillsList(profile.skills || []);
    setSkillsModalOpen(true);
  };

  const openLinksModal = () => {
    setLinksList(profile.links || []);
    setLinksModalOpen(true);
  };

  /* ----------------- Loading / Not found UI ----------------- */
  if (loading) return <div className="p-10 text-center">Loading...</div>;
  if (!profile) return <div className="p-10 text-center text-red-500">Profile not found</div>;

  /* ----------------- Utility: display image (owner or stored) ----------------- */
  const displayImage = profile.image || profile.photoUrl || ""; // prefer profile.image (from Firestore)
  const displayName = profile.name || profile.username || username;

  /* ----------------- RENDER ----------------- */
  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* Banner */}
      <div className="w-full h-48 bg-gradient-to-r from-sky-400 to-blue-600" />

      <div className="container mx-auto px-6 -mt-20 space-y-8">

        {/* PROFILE CARD */}
        <GlassWrapper className="flex items-center justify-between">
          <div className="flex gap-5 items-start">
            <img
              src={displayImage || user?.imageUrl || "/placeholder-avatar.png"}
              alt={displayName}
              className="h-28 w-28 rounded-full object-cover ring-2 ring-white/30"
            />

            <div className="min-w-0">
              <h1 className="text-2xl font-semibold">{displayName}</h1>
              <p className="text-sm text-slate-700 break-words">{profile.email}</p>
              <p className="mt-3 text-slate-700 leading-relaxed">{profile.headline}</p>
              {profile.location && <p className="text-sm text-slate-600 mt-1">{profile.location}</p>}
            </div>
          </div>

          {isOwner && (
            <div className="flex items-start">
              <Button variant="outline" onClick={openAboutModal}>
                <img src={PencilIcon} alt="edit" className="h-4 w-4 mr-2" />
                Edit
              </Button>

            </div>
          )}
        </GlassWrapper>

        {/* ABOUT */}
        <GlassWrapper>
          <div className="flex justify-between items-start">
            <h3 className="text-lg font-semibold">About</h3>

            {isOwner && (
              <Button variant="ghost" onClick={openAboutModal} className="p-1">
                <img src={PencilIcon} alt="edit" className="h-4 w-4" />
              </Button>
            )}
          </div>

          <p className="mt-3 text-slate-700 leading-relaxed whitespace-pre-line">
            {profile.about || "No details added."}
          </p>
        </GlassWrapper>

        {/* EDUCATION + WORK */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <GlassWrapper>
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Education</h3>
              {isOwner && (
                <Button variant="ghost" onClick={openEduModal} className="p-1">
                  <img src={PencilIcon} alt="edit" className="h-4 w-4" />
                </Button>
              )}
            </div>

            <div className="mt-4 space-y-4">
              {(!profile.education || profile.education.length === 0) && (
                <p className="text-slate-700">No entries.</p>
              )}

              {(profile.education || []).map((e, i) => (
                <div key={i} className="space-y-1">
                  <div className="font-medium">{e.org}</div>
                  <div className="text-sm text-slate-700">{e.role}</div>
                  <div className="text-xs text-slate-600">{e.timeline}</div>
                </div>
              ))}
            </div>
          </GlassWrapper>

          <GlassWrapper>
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Work Experience</h3>
              {isOwner && (
                <Button variant="ghost" onClick={openWorkModal} className="p-1">
                  <img src={PencilIcon} alt="edit" className="h-4 w-4" />
                </Button>
              )}
            </div>

            <div className="mt-4 space-y-4">
              {(!profile.work || profile.work.length === 0) && (
                <p className="text-slate-700">No entries.</p>
              )}

              {(profile.work || []).map((w, i) => (
                <div key={i} className="space-y-1">
                  <div className="font-medium">{w.org}</div>
                  <div className="text-sm text-slate-700">{w.role}</div>
                  <div className="text-xs text-slate-600">{w.timeline}</div>
                </div>
              ))}
            </div>
          </GlassWrapper>
        </div>

        {/* SKILLS + LINKS */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          <div className="lg:col-span-3">
            <GlassWrapper>
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Skills</h3>
                {isOwner && (
                  <Button variant="ghost" onClick={openSkillsModal} className="p-1">
                    <img src={PencilIcon} alt="edit" className="h-4 w-4" />
                  </Button>
                )}
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                {(profile.skills || []).length === 0 ? (
                  <p className="text-slate-700">No skills added.</p>
                ) : (
                  (profile.skills || []).map((s, i) => (
                    <Badge key={i} className="px-3 py-1 bg-sky-100 text-sky-800">{s}</Badge>
                  ))
                )}
              </div>
            </GlassWrapper>
          </div>

          <div className="lg:col-span-2">
            <GlassWrapper>
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Links</h3>
                {isOwner && (
                  <Button variant="ghost" onClick={openLinksModal} className="p-1">
                    <img src={PencilIcon} alt="edit" className="h-4 w-4" />
                  </Button>
                )}
              </div>

              <div className="mt-4 space-y-3">
                {(profile.links || []).length === 0 ? (
                  <p className="text-slate-700">No links added.</p>
                ) : (
                  (profile.links || []).map((l, i) => {
                    const p = detectPlatform(l.url);

                    return (
                      <div key={i} className="flex justify-between items-center">
                        <div className="flex gap-3 items-center">
                          <p.Icon className="h-5 w-5 text-slate-700" />

                          <div>
                            <div className="font-medium">
                              {l.platform || p.name}
                            </div>
                            <div className="text-xs text-slate-600 break-words">
                              {l.url}
                            </div>
                          </div>
                        </div>

                        <a
                          href={normalizeUrl(l.url)}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center"
                        >
                          <img src={ExternalIcon} alt="external" className="h-5 w-5" />
                        </a>
                      </div>
                    );
                  })

                )}
              </div>
            </GlassWrapper>
          </div>
        </div>


      </div>

      {/* ======================================================
         -------   ABOUT MODAL (ShadCN inputs inside your glass modal) -------
      ======================================================= */}
      {aboutModalOpen && (
        <Modal title="Edit Profile" onClose={() => setAboutModalOpen(false)} wide>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Headline</label>
              <Input
                value={aboutForm.headline}
                onChange={(e) => setAboutForm((p) => ({ ...p, headline: e.target.value }))}
                className="w-full"
                placeholder="Brief headline"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">About</label>
              <Textarea
                value={aboutForm.about}
                onChange={(e) => setAboutForm((p) => ({ ...p, about: e.target.value }))}
                rows={5}
                className="w-full"
                placeholder="Tell people about yourself"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Location</label>
              <Input
                value={aboutForm.location}
                onChange={(e) => setAboutForm((p) => ({ ...p, location: e.target.value }))}
                className="w-full"
                placeholder="City, Country"
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <Button variant="ghost" onClick={() => setAboutModalOpen(false)}>Cancel</Button>

              <Button
                onClick={async () => {
                  setSaving(true);
                  try {
                    // update API
                    await updateUserProfile(profile.id, {
                      headline: aboutForm.headline,
                      about: aboutForm.about,
                      location: aboutForm.location,
                    });

                    // update local UI
                    setProfile((p) => ({ ...p, headline: aboutForm.headline, about: aboutForm.about, location: aboutForm.location }));
                  } catch (e) {
                    console.error("Save profile error", e);
                  } finally {
                    setSaving(false);
                    setAboutModalOpen(false);
                  }
                }}
              >
                Save
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* ---------------- EDUCATION MODAL ---------------- */}
      {eduModalOpen && (
        <Modal title="Edit Education" onClose={() => setEduModalOpen(false)} wide>
          <div className="space-y-4">
            {(eduList || []).map((e, i) => (
              <div key={i} className="flex justify-between items-start">
                <div>
                  <div className="font-medium">{e.org}</div>
                  <div className="text-sm text-slate-700">{e.role}</div>
                  <div className="text-xs text-slate-600">{e.timeline}</div>
                </div>

                <div className="flex gap-2">
                  <Button variant="ghost" onClick={() => { setEduShowForm(true); setEduEditIndex(i); setEduForm(e); }}>
                    <img src={PencilIcon} alt="edit" className="h-4 w-4" />
                  </Button>

                  <Button variant="ghost" onClick={() => setEduList((list) => list.filter((_, idx) => idx !== i))} className="text-red-500">
                    🗑️
                  </Button>
                </div>
              </div>
            ))}

            <div className="pt-2">
              <Button onClick={() => { setEduShowForm(true); setEduEditIndex(null); setEduForm({ org: "", role: "", timeline: "" }); }}>
                + Add
              </Button>
            </div>

            {eduShowForm && (
              <div className="mt-3 p-3 border rounded space-y-3">
                <Input placeholder="Institute" value={eduForm.org} onChange={(e) => setEduForm((p) => ({ ...p, org: e.target.value }))} />
                <Input placeholder="Stream / Role" value={eduForm.role} onChange={(e) => setEduForm((p) => ({ ...p, role: e.target.value }))} />
                <Input placeholder="Timeline" value={eduForm.timeline} onChange={(e) => setEduForm((p) => ({ ...p, timeline: e.target.value }))} />

                <div className="flex justify-end gap-3">
                  <Button variant="ghost" onClick={() => setEduShowForm(false)}>Cancel</Button>
                  <Button onClick={() => {
                    const updated = [...eduList];
                    if (eduEditIndex === null || eduEditIndex === undefined) updated.push(eduForm);
                    else updated[eduEditIndex] = eduForm;
                    setEduList(updated);
                    setEduShowForm(false);
                    setEduForm({ org: "", role: "", timeline: "" });
                    setEduEditIndex(null);
                  }}>{eduEditIndex === null ? "Add" : "Save"}</Button>
                </div>
              </div>
            )}

            <div className="flex justify-end gap-3">
              <Button variant="ghost" onClick={() => setEduModalOpen(false)}>Cancel</Button>
              <Button onClick={async () => {
                setSaving(true);
                try {
                  await updateUserProfile(profile.id, { education: eduList });
                  setProfile((p) => ({ ...p, education: eduList }));
                } catch (e) {
                  console.error(e);
                } finally {
                  setSaving(false);
                  setEduModalOpen(false);
                }
              }}>Save All</Button>
            </div>
          </div>
        </Modal>
      )}

      {/* ---------------- WORK MODAL ---------------- */}
      {workModalOpen && (
        <Modal title="Edit Work Experience" onClose={() => setWorkModalOpen(false)} wide>
          <div className="space-y-4">
            {(workList || []).map((w, i) => (
              <div key={i} className="flex justify-between items-start">
                <div>
                  <div className="font-medium">{w.org}</div>
                  <div className="text-sm text-slate-700">{w.role}</div>
                  <div className="text-xs text-slate-600">{w.timeline}</div>
                </div>

                <div className="flex gap-2">
                  <Button variant="ghost" onClick={() => { setWorkShowForm(true); setWorkEditIndex(i); setWorkForm(w); }}>
                    <img src={PencilIcon} alt="edit" className="h-4 w-4" />
                  </Button>

                  <Button variant="ghost" onClick={() => setWorkList((list) => list.filter((_, idx) => idx !== i))} className="text-red-500">🗑️</Button>
                </div>
              </div>
            ))}

            <div className="pt-2">
              <Button onClick={() => { setWorkShowForm(true); setWorkEditIndex(null); setWorkForm({ org: "", role: "", timeline: "" }); }}>+ Add</Button>
            </div>

            {workShowForm && (
              <div className="mt-3 p-3 border rounded space-y-3">
                <Input placeholder="Organization" value={workForm.org} onChange={(e) => setWorkForm((p) => ({ ...p, org: e.target.value }))} />
                <Input placeholder="Role" value={workForm.role} onChange={(e) => setWorkForm((p) => ({ ...p, role: e.target.value }))} />
                <Input placeholder="Timeline" value={workForm.timeline} onChange={(e) => setWorkForm((p) => ({ ...p, timeline: e.target.value }))} />

                <div className="flex justify-end gap-3">
                  <Button variant="ghost" onClick={() => setWorkShowForm(false)}>Cancel</Button>
                  <Button onClick={() => {
                    const updated = [...workList];
                    if (workEditIndex === null || workEditIndex === undefined) updated.push(workForm);
                    else updated[workEditIndex] = workForm;
                    setWorkList(updated);
                    setWorkShowForm(false);
                    setWorkForm({ org: "", role: "", timeline: "" });
                    setWorkEditIndex(null);
                  }}>{workEditIndex === null ? "Add" : "Save"}</Button>
                </div>
              </div>
            )}

            <div className="flex justify-end gap-3">
              <Button variant="ghost" onClick={() => setWorkModalOpen(false)}>Cancel</Button>
              <Button onClick={async () => {
                setSaving(true);
                try {
                  await updateUserProfile(profile.id, { work: workList });
                  setProfile((p) => ({ ...p, work: workList }));
                } catch (e) {
                  console.error(e);
                } finally {
                  setSaving(false);
                  setWorkModalOpen(false);
                }
              }}>Save All</Button>
            </div>
          </div>
        </Modal>
      )}

      {/* ---------------- SKILLS MODAL ---------------- */}
      {skillsModalOpen && (
        <Modal title="Edit Skills" onClose={() => setSkillsModalOpen(false)}>
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              {skillsList.map((s, i) => (
                <div key={i} className="flex items-center gap-2 bg-sky-100 text-sky-800 px-3 py-1 rounded-full">
                  <span>{s}</span>
                  <button onClick={() => setSkillsList((list) => list.filter((_, idx) => idx !== i))} className="text-xs">✕</button>
                </div>
              ))}
            </div>

            <div>
              {!skillShowForm ? (
                <Button onClick={() => setSkillShowForm(true)}>+ Add</Button>
              ) : (
                <div className="mt-3 p-3 border rounded space-y-3">
                  <Input placeholder="Skill name" value={skillInput} onChange={(e) => setSkillInput(e.target.value)} />
                  <div className="flex justify-end gap-3">
                    <Button variant="ghost" onClick={() => setSkillShowForm(false)}>Cancel</Button>
                    <Button onClick={() => { setSkillsList((prev) => [...prev, skillInput]); setSkillInput(""); setSkillShowForm(false); }}>Add</Button>
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3">
              <Button variant="ghost" onClick={() => setSkillsModalOpen(false)}>Cancel</Button>
              <Button onClick={async () => {
                setSaving(true);
                try {
                  await updateUserProfile(profile.id, { skills: skillsList });
                  setProfile((p) => ({ ...p, skills: skillsList }));
                } catch (e) {
                  console.error(e);
                } finally {
                  setSaving(false);
                  setSkillsModalOpen(false);
                }
              }}>Save All</Button>
            </div>
          </div>
        </Modal>
      )}

      {/* ---------------- LINKS MODAL ---------------- */}
      {linksModalOpen && (
        <Modal title="Edit Links" onClose={() => setLinksModalOpen(false)} wide>
          <div className="space-y-4">
            {(linksList || []).map((l, i) => {
              const p = detectPlatform(l.url);
              return (
                <div key={i} className="flex justify-between items-start">
                  <div className="flex gap-3 items-center">
                    <span className="text-xl">{p.emoji}</span>
                    <div>
                      <div className="font-medium">{l.platform || p.name}</div>
                      <div className="text-xs text-slate-600 break-words">{l.url}</div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button variant="ghost" onClick={() => { setLinkShowForm(true); setLinkEditIndex(i); setLinkForm({ url: l.url }); }}>
                      <img src={PencilIcon} alt="edit" className="h-4 w-4" />
                    </Button>

                    <Button variant="ghost" onClick={() => setLinksList((list) => list.filter((_, idx) => idx !== i))} className="text-red-500">🗑️</Button>
                  </div>
                </div>
              );
            })}

            <div className="pt-2">
              <Button onClick={() => { setLinkShowForm(true); setLinkEditIndex(null); setLinkForm({ url: "" }); }}>+ Add</Button>
            </div>

            {linkShowForm && (
              <div className="mt-3 p-3 border rounded space-y-3">
                <Input placeholder="URL" value={linkForm.url} onChange={(e) => setLinkForm({ url: e.target.value })} />
                <div className="flex justify-end gap-3">
                  <Button variant="ghost" onClick={() => setLinkShowForm(false)}>Cancel</Button>
                  <Button onClick={() => {
                    const updated = [...linksList];
                    const fixed = normalizeUrl(linkForm.url);
                    if (linkEditIndex === null || linkEditIndex === undefined) updated.push({ url: fixed }); else updated[linkEditIndex] = { url: fixed };
                    setLinksList(updated);
                    setLinkShowForm(false);
                    setLinkForm({ url: "" });
                    setLinkEditIndex(null);
                  }}>{linkEditIndex === null ? "Add" : "Save"}</Button>
                </div>
              </div>
            )}

            <div className="flex justify-end gap-3">
              <Button variant="ghost" onClick={() => setLinksModalOpen(false)}>Cancel</Button>
              <Button onClick={async () => {
                setSaving(true);
                try {
                  await updateUserProfile(profile.id, { links: linksList });
                  setProfile((p) => ({ ...p, links: linksList }));
                } catch (e) {
                  console.error(e);
                } finally {
                  setSaving(false);
                  setLinksModalOpen(false);
                }
              }}>Save All</Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
