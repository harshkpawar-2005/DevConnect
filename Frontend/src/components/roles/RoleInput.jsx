// src/components/roles/RoleInput.jsx

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Plus, Trash } from "lucide-react";

export default function RoleInput({ index, role, onChange, onRemove, canRemove = true }) {
  /* ------------------------- Update helpers ------------------------ */
  const updateField = (field, value) => {
    onChange({ ...role, [field]: value });
  };

  const updateArrayItem = (field, idx, value) => {
    const updated = [...(role[field] || [])];
    updated[idx] = value;
    onChange({ ...role, [field]: updated });
  };

  const addArrayItem = (field) => {
    onChange({ ...role, [field]: [...(role[field] || []), ""] });
  };

  const removeArrayItem = (field, idx) => {
    onChange({
      ...role,
      [field]: (role[field] || []).filter((_, i) => i !== idx),
    });
  };

  /* ----------------------------- UI ------------------------------ */
  return (
    <div className="p-4 border rounded-xl bg-white/70 backdrop-blur-md shadow-sm">
      {/* Header */}
      <div className="flex justify-between mb-3">
        <h3 className="font-semibold text-lg">Role #{index + 1}</h3>

        {canRemove && (
          <Button
            type="button"
            variant="ghost"
            className="text-red-500 hover:bg-red-50"
            onClick={onRemove}
          >
            <Trash size={16} />
            <span className="sr-only">Delete Role</span>
          </Button>
        )}
      </div>

      {/* Role Name */}
      <div className="mb-4">
        <Label className="block text-sm mb-1" htmlFor={`role-${index}`}>
          Role Name *
        </Label>
        <Input
          id={`role-${index}`}
          placeholder="e.g. Frontend Developer"
          value={role.roleName}
          onChange={(e) => updateField("roleName", e.target.value)}
        />
      </div>

      {/* Responsibilities */}
      <div className="mb-4">
        <div className="flex justify-between items-center mb-1">
          <Label className="text-sm">Responsibilities *</Label>

          <Button
            type="button"
            size="sm"
            variant="ghost"
            className="flex items-center gap-1 text-sky-600"
            onClick={() => addArrayItem("responsibilities")}
          >
            <Plus size={14} />
            Add
          </Button>
        </div>

        <div className="space-y-2">
          {(role.responsibilities || []).map((r, i) => (
            <div key={i} className="flex gap-2">
              <Input
                placeholder="Write responsibility"
                value={r}
                onChange={(e) =>
                  updateArrayItem("responsibilities", i, e.target.value)
                }
              />

              {(role.responsibilities || []).length > 1 && (
                <Button
                  type="button"
                  variant="ghost"
                  className="text-red-500"
                  onClick={() => removeArrayItem("responsibilities", i)}
                >
                  ✕
                </Button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Requirements */}
      <div className="mb-4">
        <div className="flex justify-between items-center mb-1">
          <Label className="text-sm">Requirements *</Label>

          <Button
            type="button"
            size="sm"
            variant="ghost"
            className="flex items-center gap-1 text-sky-600"
            onClick={() => addArrayItem("requirements")}
          >
            <Plus size={14} />
            Add
          </Button>
        </div>

        <div className="space-y-2">
          {(role.requirements || []).map((r, i) => (
            <div key={i} className="flex gap-2">
              <Input
                placeholder="Write requirement"
                value={r}
                onChange={(e) =>
                  updateArrayItem("requirements", i, e.target.value)
                }
              />

              {(role.requirements || []).length > 1 && (
                <Button
                  type="button"
                  variant="ghost"
                  className="text-red-500"
                  onClick={() => removeArrayItem("requirements", i)}
                >
                  ✕
                </Button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Members Required */}
      <div>
        <Label className="block text-sm mb-1" htmlFor={`members-${index}`}>
          Members Required *
        </Label>
        <Input
          id={`members-${index}`}
          type="number"
          min={1}
          value={role.membersRequired}
          onChange={(e) =>
            updateField("membersRequired", Number(e.target.value || 0))
          }
        />
      </div>
    </div>
  );
}
