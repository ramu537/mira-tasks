import { useCallback, useEffect, useState } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { configureAccessTokenProvider } from "./api/client";
import AppShell from "./components/AppShell";
import LoginScreen from "./components/LoginScreen";
import { ErrorState, LoadingState } from "./components/PageState";
import TaskDialog from "./components/TaskDialog";
import Toast from "./components/Toast";
import { auth, googleProvider, signInWithPopup, signOut } from "./config/firebase";
import { useTaskManager } from "./hooks/useTaskManager";
import AllTasksPage from "./pages/AllTasksPage";
import FocusPage from "./pages/FocusPage";
import MatrixPage from "./pages/MatrixPage";

function loginMessage(error) {
  const code = error?.code || "";
  if (code === "auth/popup-closed-by-user") return "Sign-in was closed before it finished. Try again when you are ready.";
  if (code === "auth/popup-blocked") return "Your browser blocked the sign-in window. Allow pop-ups for Mira and try again.";
  if (code === "auth/network-request-failed") return "Could not reach Google authentication. Check your connection and try again.";
  return "Could not sign you in right now. Please try again.";
}

export default function App() {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [authError, setAuthError] = useState("");
  const [signingIn, setSigningIn] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        configureAccessTokenProvider(async () => currentUser.getIdToken());
      } else {
        configureAccessTokenProvider(null);
      }
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  async function handleLogin() {
    setAuthError("");
    setSigningIn(true);
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err) {
      setAuthError(loginMessage(err));
    } finally {
      setSigningIn(false);
    }
  }

  async function handleSignOut() {
    try {
      await signOut(auth);
    } catch (err) {
      console.error("Sign-out error:", err);
    }
  }

  const manager = useTaskManager(user);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [toast, setToast] = useState(null);
  const closeToast = useCallback(() => setToast(null), []);

  function openCreate() { setEditingTask(null); setDialogOpen(true); }
  function openEdit(task) { setEditingTask(task); setDialogOpen(true); }
  function closeDialog() { if (!saving) { setDialogOpen(false); setEditingTask(null); } }

  async function saveTask(payload) {
    setSaving(true);
    try {
      await manager.actions.saveTask(payload, editingTask?.id);
      setDialogOpen(false);
      setEditingTask(null);
      setToast({ tone: "success", message: editingTask ? "Task updated." : "Task created." });
    } catch (error) {
      setToast({ tone: "error", message: error.message });
    } finally {
      setSaving(false);
    }
  }

  async function toggleTask(task, completed) {
    try {
      await manager.actions.toggleTask(task, completed);
    } catch (error) {
      setToast({ tone: "error", message: error.message });
    }
  }

  async function deleteTask(id) {
    setDeletingId(id);
    try {
      await manager.actions.deleteTask(id);
      setToast({ tone: "success", message: "Task deleted." });
      return true;
    } catch (error) {
      setToast({ tone: "error", message: error.message });
      return false;
    } finally {
      setDeletingId(null);
    }
  }

  if (authLoading) {
    return <LoadingState />;
  }

  if (!user) {
    return <LoginScreen onLogin={handleLogin} error={authError} loading={signingIn} />;
  }

  const pageProps = { tasks: manager.tasks, today: manager.today, togglingIds: manager.togglingIds, deletingId, onAdd: openCreate, onToggle: toggleTask, onEdit: openEdit, onDelete: deleteTask };
  let content;
  if (!manager.ready && manager.loading) content = <LoadingState />;
  else if (!manager.ready && manager.loadError) content = <ErrorState message={manager.loadError} onRetry={manager.retry} />;
  else content = <Routes><Route path="/" element={<FocusPage {...pageProps} />} /><Route path="/tasks" element={<AllTasksPage {...pageProps} />} /><Route path="/matrix" element={<MatrixPage {...pageProps} />} /><Route path="*" element={<Navigate to="/" replace />} /></Routes>;

  return (
    <>
      <AppShell user={user} onSignOut={handleSignOut} loading={manager.loading} onAdd={openCreate}>
        {content}
      </AppShell>
      <TaskDialog open={dialogOpen} task={editingTask} tasks={manager.tasks} today={manager.today} busy={saving} onClose={closeDialog} onSave={saveTask} />
      <Toast toast={toast} onClose={closeToast} />
    </>
  );
}

