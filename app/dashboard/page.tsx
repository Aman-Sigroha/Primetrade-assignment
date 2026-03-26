"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { api, setAuthToken } from "@/lib/client-api";

type TaskRow = {
  id: string;
  title: string;
  description: string;
  userId: string;
  createdAt?: string;
  updatedAt?: string;
};

type Me = { id: string; name: string; email: string; role: string };

function decodePayload(token: string): { role?: string; userId?: string } | null {
  try {
    const part = token.split(".")[1];
    if (!part) return null;
    const json = JSON.parse(atob(part.replace(/-/g, "+").replace(/_/g, "/")));
    return { role: json.role, userId: json.userId };
  } catch {
    return null;
  }
}

export default function DashboardPage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [me, setMe] = useState<Me | null>(null);
  const [tasks, setTasks] = useState<TaskRow[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [savingEdit, setSavingEdit] = useState(false);
  const [banner, setBanner] = useState<{ type: "ok" | "err"; text: string } | null>(null);
  const [loadingList, setLoadingList] = useState(false);

  const loadTasks = useCallback(async (token: string) => {
    setLoadingList(true);
    setBanner(null);
    try {
      setAuthToken(token);
      const { data } = await api.get("/api/v1/tasks");
      if (data.success && data.data?.tasks) {
        setTasks(data.data.tasks as TaskRow[]);
        return true;
      } else {
        setBanner({ type: "err", text: data.message ?? "Could not load tasks" });
        return false;
      }
    } catch (err: unknown) {
      const ax = err as { response?: { data?: { message?: string }; status?: number } };
      if (ax.response?.status === 401) {
        localStorage.removeItem("primetrade_token");
        setAuthToken(null);
        router.replace("/login");
        return false;
      }
      setBanner({ type: "err", text: ax.response?.data?.message ?? "Could not load tasks" });
      return false;
    } finally {
      setLoadingList(false);
    }
  }, [router]);

  useEffect(() => {
    const init = async () => {
      const token = localStorage.getItem("primetrade_token");
      if (!token) {
        router.replace("/login");
        return;
      }
      setAuthToken(token);
      const payload = decodePayload(token);
      setMe({
        id: payload?.userId ?? "—",
        name: "—",
        email: "—",
        role: payload?.role ?? "user",
      });
      const ok = await loadTasks(token);
      if (ok) {
        setReady(true);
      }
    };
    void init();
  }, [router, loadTasks]);

  async function onCreate(e: React.FormEvent) {
    e.preventDefault();
    const token = localStorage.getItem("primetrade_token");
    if (!token) {
      router.replace("/login");
      return;
    }
    setBanner(null);
    try {
      setAuthToken(token);
      const { data } = await api.post("/api/v1/tasks", {
        title,
        description: description.trim() || undefined,
      });
      if (data.success) {
        setTitle("");
        setDescription("");
        setBanner({ type: "ok", text: data.message ?? "Task created" });
        await loadTasks(token);
      } else {
        setBanner({ type: "err", text: data.message ?? "Create failed" });
      }
    } catch (err: unknown) {
      const ax = err as { response?: { data?: { message?: string } } };
      setBanner({ type: "err", text: ax.response?.data?.message ?? "Create failed" });
    }
  }

  async function onDelete(id: string) {
    const token = localStorage.getItem("primetrade_token");
    if (!token) {
      router.replace("/login");
      return;
    }
    if (!confirm("Delete this task?")) return;
    setBanner(null);
    try {
      setAuthToken(token);
      const { data } = await api.delete(`/api/v1/tasks/${id}`);
      if (data.success) {
        setBanner({ type: "ok", text: data.message ?? "Deleted" });
        await loadTasks(token);
      } else {
        setBanner({ type: "err", text: data.message ?? "Delete failed" });
      }
    } catch (err: unknown) {
      const ax = err as { response?: { data?: { message?: string } } };
      setBanner({ type: "err", text: ax.response?.data?.message ?? "Delete failed" });
    }
  }

  function startEdit(task: TaskRow) {
    setEditingId(task.id);
    setEditTitle(task.title);
    setEditDescription(task.description ?? "");
    setBanner(null);
  }

  function cancelEdit() {
    setEditingId(null);
    setEditTitle("");
    setEditDescription("");
  }

  async function onUpdate(id: string) {
    const token = localStorage.getItem("primetrade_token");
    if (!token) {
      router.replace("/login");
      return;
    }
    if (!editTitle.trim()) {
      setBanner({ type: "err", text: "Title is required" });
      return;
    }
    setSavingEdit(true);
    setBanner(null);
    try {
      setAuthToken(token);
      const { data } = await api.put(`/api/v1/tasks/${id}`, {
        title: editTitle,
        description: editDescription.trim() || "",
      });
      if (data.success) {
        setBanner({ type: "ok", text: data.message ?? "Task updated" });
        cancelEdit();
        await loadTasks(token);
      } else {
        setBanner({ type: "err", text: data.message ?? "Update failed" });
      }
    } catch (err: unknown) {
      const ax = err as { response?: { data?: { message?: string } } };
      setBanner({ type: "err", text: ax.response?.data?.message ?? "Update failed" });
    } finally {
      setSavingEdit(false);
    }
  }

  function logout() {
    localStorage.removeItem("primetrade_token");
    setAuthToken(null);
    router.replace("/login");
  }

  if (!ready) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-ink-50 bg-mesh-light">
        <div className="h-9 w-9 animate-spin rounded-full border-2 border-brand-200 border-t-brand-600" aria-hidden />
        <p className="text-sm font-medium text-ink-500">Loading your workspace…</p>
      </div>
    );
  }

  const role = me?.role ?? "user";

  return (
    <div className="min-h-screen bg-ink-50 bg-mesh-light">
      <header className="sticky top-0 z-20 border-b border-ink-100/90 bg-white/85 shadow-sm backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <Link href="/" className="font-display text-lg font-bold tracking-tight text-ink-900">
              Prime<span className="text-brand-600">Trade</span>
            </Link>
            <span className="hidden h-6 w-px bg-ink-200 sm:block" aria-hidden />
            <div className="hidden min-w-0 sm:block">
              <p className="truncate text-sm font-semibold text-ink-900">Workspace</p>
              <p className="truncate text-xs text-ink-500">Task dashboard</p>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-2 sm:gap-3">
            <span
              className={`hidden rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide sm:inline-flex ${
                role === "admin"
                  ? "bg-violet-100 text-violet-800"
                  : "bg-brand-100 text-brand-800"
              }`}
            >
              {role}
            </span>
            <Link
              href="/api-docs"
              className="rounded-xl px-3 py-2 text-sm font-semibold text-ink-600 hover:bg-ink-100 hover:text-ink-900"
            >
              API docs
            </Link>
            <button
              type="button"
              onClick={logout}
              className="rounded-xl border border-ink-200 bg-white px-4 py-2 text-sm font-semibold text-ink-800 shadow-sm transition hover:border-ink-300 hover:bg-ink-50"
            >
              Log out
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
        <div className="mb-8 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="font-display text-3xl font-bold tracking-tight text-ink-900">Tasks</h1>
            <p className="mt-1 text-ink-600">
              Create, list, and remove tasks. Requests use your JWT automatically.
            </p>
          </div>
          <div className="flex items-center gap-3 text-sm text-ink-500">
            {loadingList ? (
              <span className="inline-flex items-center gap-2">
                <span className="h-3 w-3 animate-pulse rounded-full bg-brand-400" />
                Syncing…
              </span>
            ) : (
              <span>
                {tasks.length} {tasks.length === 1 ? "task" : "tasks"}
              </span>
            )}
          </div>
        </div>

        {banner ? (
          <div className={`mb-8 ${banner.type === "ok" ? "pt-alert-ok" : "pt-alert-err"}`} role="status">
            {banner.text}
          </div>
        ) : null}

        <div className="grid gap-8 lg:grid-cols-12 lg:gap-10">
          <section className="pt-card p-6 shadow-soft sm:p-8 lg:col-span-5">
            <div className="flex items-center gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-100 text-lg font-bold text-brand-700">
                +
              </span>
              <div>
                <h2 className="font-display text-lg font-semibold text-ink-900">New task</h2>
                <p className="text-xs text-ink-500">Title required · description optional</p>
              </div>
            </div>
            <form onSubmit={onCreate} className="mt-6 space-y-4">
              <div>
                <label className="pt-label" htmlFor="task-title">
                  Title
                </label>
                <input
                  id="task-title"
                  className="pt-input mt-1.5"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Gym · Ship API docs"
                  required
                />
              </div>
              <div>
                <label className="pt-label" htmlFor="task-desc">
                  Description{" "}
                  <span className="font-normal text-ink-400">(optional)</span>
                </label>
                <textarea
                  id="task-desc"
                  className="pt-input mt-1.5 min-h-[100px] resize-y"
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Notes, time, links…"
                />
              </div>
              <button type="submit" className="pt-btn-primary w-full py-3">
                Create task
              </button>
            </form>
          </section>

          <section className="lg:col-span-7">
            <div className="mb-4 flex items-center justify-between gap-2">
              <h2 className="font-display text-lg font-semibold text-ink-900">Your tasks</h2>
            </div>
            {tasks.length === 0 ? (
              <div className="pt-card flex flex-col items-center justify-center px-6 py-16 text-center shadow-soft">
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-ink-100 text-2xl">
                  ✓
                </div>
                <p className="font-display text-lg font-semibold text-ink-900">No tasks yet</p>
                <p className="mt-2 max-w-sm text-sm text-ink-500">
                  Add your first task with the form — it will show up here with a clear timestamp.
                </p>
              </div>
            ) : (
              <ul className="space-y-3">
                {tasks.map((t) => (
                  <li key={t.id} className="group pt-card overflow-hidden shadow-soft transition hover:shadow-card">
                    <div className="flex gap-0 sm:flex-row">
                      <div className="w-1 shrink-0 bg-gradient-to-b from-brand-400 to-brand-600" aria-hidden />
                      <div className="flex min-w-0 flex-1 flex-col gap-3 p-5 sm:flex-row sm:items-start sm:justify-between sm:p-6">
                        <div className="min-w-0 flex-1">
                          {editingId === t.id ? (
                            <div className="space-y-3">
                              <input
                                className="pt-input"
                                value={editTitle}
                                onChange={(e) => setEditTitle(e.target.value)}
                                placeholder="Task title"
                              />
                              <textarea
                                className="pt-input min-h-[84px] resize-y"
                                value={editDescription}
                                onChange={(e) => setEditDescription(e.target.value)}
                                placeholder="Description (optional)"
                              />
                            </div>
                          ) : (
                            <>
                              <p className="font-display text-base font-semibold text-ink-900">{t.title}</p>
                              {t.description ? (
                                <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-ink-600">
                                  {t.description}
                                </p>
                              ) : null}
                            </>
                          )}
                          <p className="mt-3 text-xs font-medium text-ink-400">
                            {t.createdAt
                              ? new Date(t.createdAt).toLocaleString(undefined, {
                                  dateStyle: "medium",
                                  timeStyle: "short",
                                })
                              : null}
                            {t.updatedAt && t.updatedAt !== t.createdAt ? " · updated" : ""}
                          </p>
                        </div>
                        <div className="flex shrink-0 gap-2 self-start sm:self-center">
                          {editingId === t.id ? (
                            <>
                              <button
                                type="button"
                                onClick={() => void onUpdate(t.id)}
                                disabled={savingEdit}
                                className="rounded-xl bg-brand-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-700 disabled:opacity-60"
                              >
                                {savingEdit ? "Saving..." : "Save"}
                              </button>
                              <button
                                type="button"
                                onClick={cancelEdit}
                                className="rounded-xl border border-ink-200 bg-white px-4 py-2 text-sm font-semibold text-ink-700 transition hover:bg-ink-50"
                              >
                                Cancel
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                type="button"
                                onClick={() => startEdit(t)}
                                className="rounded-xl border border-ink-200 bg-white px-4 py-2 text-sm font-semibold text-ink-700 transition hover:bg-ink-50"
                              >
                                Edit
                              </button>
                              <button
                                type="button"
                                onClick={() => void onDelete(t.id)}
                                className="rounded-xl border border-red-200/90 bg-red-50/50 px-4 py-2 text-sm font-semibold text-red-700 transition hover:border-red-300 hover:bg-red-100"
                              >
                                Delete
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}
