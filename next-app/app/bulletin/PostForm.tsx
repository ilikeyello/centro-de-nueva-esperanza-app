"use client";

import { useRef, useState } from "react";
import { createBulletinPost } from "./actions";

export function PostForm() {
  const formRef = useRef<HTMLFormElement | null>(null);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return (
    <form
      ref={formRef}
      className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-6 space-y-4"
      action={async (formData) => {
        setPending(true);
        setError(null);
        try {
          const result = await createBulletinPost(formData);
          if (!result.ok) {
            setError(result.error);
            return;
          }
          formRef.current?.reset();
        } finally {
          setPending(false);
        }
      }}
    >
      <div>
        <label className="text-sm font-semibold text-neutral-200" htmlFor="title">
          Title
        </label>
        <input
          id="title"
          name="title"
          required
          className="mt-2 w-full rounded-xl border border-neutral-700 bg-neutral-800 px-4 py-3 text-base text-white"
        />
      </div>
      <div>
        <label className="text-sm font-semibold text-neutral-200" htmlFor="content">
          Content
        </label>
        <textarea
          id="content"
          name="content"
          required
          rows={4}
          className="mt-2 w-full rounded-xl border border-neutral-700 bg-neutral-800 px-4 py-3 text-base text-white"
        />
      </div>
      <div>
        <label className="text-sm font-semibold text-neutral-200" htmlFor="authorName">
          Name (optional)
        </label>
        <input
          id="authorName"
          name="authorName"
          className="mt-2 w-full rounded-xl border border-neutral-700 bg-neutral-800 px-4 py-3 text-base text-white"
        />
      </div>

      {error && <p className="text-sm text-red-400">{error}</p>}

      <button
        type="submit"
        className="w-full rounded-xl bg-[color:var(--color-red-600)] px-4 py-3 text-base font-semibold text-white transition-colors hover:bg-[color:var(--color-red-700)] disabled:opacity-60"
        disabled={pending}
      >
        {pending ? "Posting..." : "Post"}
      </button>
    </form>
  );
}
