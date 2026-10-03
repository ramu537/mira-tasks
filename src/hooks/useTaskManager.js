import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { taskApi } from "../api/tasks";
import { localDateKey } from "../lib/dates";

export function useTaskManager(user = null) {
  const today = localDateKey();
  const uid = user?.uid || null;
  const activeUser = useRef(uid);
  activeUser.current = uid;
  const mutations = useRef(0);
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
    if (!uid || mutations.current > 0) return;
    const requestId = ++requestSequence.current;
    setLoading(true);
    setLoadError("");
    try {
      const result = await taskApi.list();
      if (requestId !== requestSequence.current || activeUser.current !== uid) return;
      setTasks(Array.isArray(result) ? result : []);
      setReady(true);
    } catch (error) {
      if (requestId === requestSequence.current && activeUser.current === uid) setLoadError(error.message);
    } finally {
      if (requestId === requestSequence.current && activeUser.current === uid) setLoading(false);
    }
  }, [uid]);

  useEffect(() => {
    if (!user) {
      setTasks([]);
      setReady(false);
      setLoading(false);
      return;
    }
    setTasks([]);
    setReady(false);
    load();
    return () => { requestSequence.current += 1; };
  }, [uid, load]);

  useEffect(() => {
    if (!user) return undefined;
    const sync = () => { if (document.visibilityState === "visible" && mutations.current === 0) void load(); };
    const timer = window.setInterval(sync, 30000);
    window.addEventListener("focus", sync);
    document.addEventListener("visibilitychange", sync);
    return () => {
      window.clearInterval(timer);
      window.removeEventListener("focus", sync);
      document.removeEventListener("visibilitychange", sync);
    };
  }, [uid, load]);

  const actions = useMemo(() => ({
    async saveTask(payload, editingId = null) {
      const owner = uid;
      if (!owner || activeUser.current !== owner) throw new Error("Sign in again before saving.");
      requestSequence.current++;
      mutations.current++;
      try {
      const saved = editingId
        ? await taskApi.update(editingId, payload)
        : await taskApi.create(payload);
      if (activeUser.current !== owner) return saved;
      setTasks((current) => editingId
        ? current.map((task) => task.id === saved.id ? saved : task)
        : [saved, ...current]);
      return saved;
      } finally { mutations.current--; requestSequence.current++; if (activeUser.current === owner) setLoading(false); }
    },
    async deleteTask(id) {
      const owner = uid;
      requestSequence.current++; mutations.current++;
      try {
      await taskApi.remove(id);
      if (activeUser.current !== owner) return;
      setTasks((current) => current.filter((task) => task.id !== id));
      } finally { mutations.current--; requestSequence.current++; if (activeUser.current === owner) setLoading(false); }
    },
    async toggleTask(task, completed) {
      if (toggleLocks.current.has(task.id)) return false;
      const owner = uid;
      requestSequence.current++; mutations.current++;
      toggleLocks.current.add(task.id);
      setTogglingIds((current) => new Set(current).add(task.id));
      const previous = task;
      setTasks((current) => current.map((item) => item.id === task.id ? { ...item, completed } : item));
      try {
        const updated = await taskApi.setCompletion(task.id, completed);
        if (activeUser.current !== owner) return false;
        setTasks((current) => current.map((item) => item.id === updated.id ? updated : item));
        return true;
      } catch (error) {
        if (activeUser.current !== owner) throw error;
        setTasks((current) => current.map((item) => item.id === task.id ? previous : item));
        throw error;
      } finally {
        mutations.current--; requestSequence.current++;
        if (activeUser.current === owner) setLoading(false);
        toggleLocks.current.delete(task.id);
        setTogglingIds((current) => {
          const next = new Set(current);
          next.delete(task.id);
          return next;
        });
      }
    },
  }), [uid]);

  return { today, tasks, togglingIds, loading, ready, loadError, retry: load, actions };
}
