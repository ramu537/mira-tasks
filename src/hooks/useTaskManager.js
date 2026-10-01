import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { taskApi } from "../api/tasks";
import { localDateKey } from "../lib/dates";

export function useTaskManager(user = null) {
  const today = localDateKey();
  const requestSequence = useRef(0);
  const toggleLocks = useRef(new Set());
  const [tasks, setTasks] = useState([]);
  const [togglingIds, setTogglingIds] = useState(new Set());
  const [loading, setLoading] = useState(Boolean(user));
  const [ready, setReady] = useState(false);
  const [loadError, setLoadError] = useState("");

  const load = useCallback(async () => {
    if (!user) {
      setTasks([]);
      setReady(false);
      setLoading(false);
      return;
    }
    const requestId = ++requestSequence.current;
    setLoading(true);
    setLoadError("");
    try {
      const result = await taskApi.list();
      if (requestId !== requestSequence.current) return;
      setTasks(Array.isArray(result) ? result : []);
      setReady(true);
    } catch (error) {
      if (requestId === requestSequence.current) setLoadError(error.message);
    } finally {
      if (requestId === requestSequence.current) setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (!user) {
      setTasks([]);
      setReady(false);
      setLoading(false);
      return;
    }
    load();
    return () => { requestSequence.current += 1; };
  }, [user, load]);

  useEffect(() => {
    if (!user) return undefined;
    const sync = () => { if (document.visibilityState === "visible") void load(); };
    window.addEventListener("focus", sync);
    document.addEventListener("visibilitychange", sync);
    return () => {
      window.removeEventListener("focus", sync);
      document.removeEventListener("visibilitychange", sync);
    };
  }, [user, load]);

  const actions = useMemo(() => ({
    async saveTask(payload, editingId = null) {
      const saved = editingId
        ? await taskApi.update(editingId, payload)
        : await taskApi.create(payload);
      setTasks((current) => editingId
        ? current.map((task) => task.id === saved.id ? saved : task)
        : [saved, ...current]);
      return saved;
    },
    async deleteTask(id) {
      await taskApi.remove(id);
      setTasks((current) => current.filter((task) => task.id !== id));
    },
    async toggleTask(task, completed) {
      if (toggleLocks.current.has(task.id)) return false;
      toggleLocks.current.add(task.id);
      setTogglingIds((current) => new Set(current).add(task.id));
      const previous = task;
      setTasks((current) => current.map((item) => item.id === task.id ? { ...item, completed } : item));
      try {
        const updated = await taskApi.setCompletion(task.id, completed);
        setTasks((current) => current.map((item) => item.id === updated.id ? updated : item));
        return true;
      } catch (error) {
        setTasks((current) => current.map((item) => item.id === task.id ? previous : item));
        throw error;
      } finally {
        toggleLocks.current.delete(task.id);
        setTogglingIds((current) => {
          const next = new Set(current);
          next.delete(task.id);
          return next;
        });
      }
    },
  }), []);

  return { today, tasks, togglingIds, loading, ready, loadError, retry: load, actions };
}
