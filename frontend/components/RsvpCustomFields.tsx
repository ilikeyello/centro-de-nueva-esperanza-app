import type { RsvpField } from "../hooks/useBackend";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type ResponseValue = string | number | boolean | string[];
export type RsvpResponses = Record<string, ResponseValue>;

interface RsvpCustomFieldsProps {
  fields: RsvpField[];
  values: RsvpResponses;
  onChange: (key: string, value: ResponseValue) => void;
}

/**
 * Returns the label of the first required field that is missing an answer,
 * or null when all required fields are satisfied.
 */
export function firstMissingRequired(
  fields: RsvpField[],
  values: RsvpResponses
): string | null {
  for (const field of fields) {
    if (!field.required) continue;
    const v = values[field.key];
    const empty =
      v === undefined ||
      v === null ||
      v === "" ||
      (Array.isArray(v) && v.length === 0);
    if (empty) return field.label;
  }
  return null;
}

export function RsvpCustomFields({ fields, values, onChange }: RsvpCustomFieldsProps) {
  if (!fields || fields.length === 0) return null;

  return (
    <>
      {fields.map((field) => {
        const value = values[field.key];

        if (field.type === "boolean") {
          return (
            <label key={field.key} className="flex items-center gap-2 text-sm text-[--ink-mid]">
              <input
                type="checkbox"
                checked={value === true}
                onChange={(e) => onChange(field.key, e.target.checked)}
                className="h-4 w-4 rounded border-[--border-color]"
              />
              {field.label}
              {field.required && <span className="text-red-500">*</span>}
            </label>
          );
        }

        if (field.type === "multiselect") {
          const selected = Array.isArray(value) ? value : [];
          return (
            <div key={field.key} className="space-y-1.5">
              <Label className="text-[--ink-mid]">
                {field.label}
                {field.required && <span className="text-red-500"> *</span>}
              </Label>
              <div className="space-y-1">
                {field.options.map((opt) => {
                  const checked = selected.includes(opt);
                  return (
                    <label key={opt} className="flex items-center gap-2 text-sm text-[--ink-mid]">
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={(e) => {
                          const next = e.target.checked
                            ? [...selected, opt]
                            : selected.filter((o) => o !== opt);
                          onChange(field.key, next);
                        }}
                        className="h-4 w-4 rounded border-[--border-color]"
                      />
                      {opt}
                    </label>
                  );
                })}
              </div>
            </div>
          );
        }

        if (field.type === "select") {
          return (
            <div key={field.key} className="space-y-1.5">
              <Label htmlFor={`rsvp-${field.key}`} className="text-[--ink-mid]">
                {field.label}
                {field.required && <span className="text-red-500"> *</span>}
              </Label>
              <select
                id={`rsvp-${field.key}`}
                value={typeof value === "string" ? value : ""}
                onChange={(e) => onChange(field.key, e.target.value)}
                className="flex h-10 w-full rounded-md border border-[--border-color] bg-surface px-3 py-2 text-sm text-[--ink-dark] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                <option value="">—</option>
                {field.options.map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>
          );
        }

        // text or number
        return (
          <div key={field.key} className="space-y-1.5">
            <Label htmlFor={`rsvp-${field.key}`} className="text-[--ink-mid]">
              {field.label}
              {field.required && <span className="text-red-500"> *</span>}
            </Label>
            <Input
              id={`rsvp-${field.key}`}
              type={field.type === "number" ? "number" : "text"}
              value={value === undefined || value === null ? "" : String(value)}
              onChange={(e) =>
                onChange(
                  field.key,
                  field.type === "number"
                    ? (e.target.value === "" ? "" : Number(e.target.value))
                    : e.target.value
                )
              }
              className="border-[--border-color] bg-surface text-[--ink-dark]"
            />
          </div>
        );
      })}
    </>
  );
}
