import ThemeControl from "./ThemeControl";
import { CheckSquare2, Grid2X2, ListTodo, LogOut, Plus, Search, Sparkles, SunMedium, User } from "lucide-react";
import { NavLink } from "react-router-dom";

const navigation = [
  { to: "/", label: "Focus", icon: SunMedium, end: true },
  { to: "/tasks", label: "All tasks", icon: ListTodo },
  { to: "/matrix", label: "Matrix", icon: Grid2X2 },
];

function Brand() {
  return (
    <div className="brand" aria-label="Mira Task Manager">
      <span className="brand-mark" aria-hidden="true"><CheckSquare2 size={21} strokeWidth={2.2} /></span>
      <span className="brand-copy"><strong>Mira</strong><small>Task manager</small></span>
    </div>
  );
}

function Navigation({ mobile = false }) {
  return (
    <nav className={mobile ? "mobile-navigation" : "side-navigation"} aria-label="Task manager">
      {navigation.map(({ to, label, icon: Icon, end }) => (
        <NavLink key={to} to={to} end={end}>
          <Icon size={mobile ? 20 : 18} strokeWidth={2} />
          <span>{label}</span>
        </NavLink>
      ))}
    </nav>
  );
}

export default function AppShell({ user, onSignOut, loading, onOpenIntelligence, onOpenAiCapture, onOpenAiSearch, children }) {
  return (
    <div className="app-frame">
      <aside className="sidebar">
        <Brand />
        <Navigation />

        <div className="sidebar-bottom">
          {user && (
            <div className="sidebar-user">
              {user.photoURL ? (
                <img src={user.photoURL} alt={user.displayName || "User"} className="user-avatar" />
              ) : (
                <div className="user-avatar-placeholder"><User size={16} /></div>
              )}
              <div className="user-info">
                <span className="user-name">{user.displayName || "Account"}</span>
                <span className="user-email">{user.email || ""}</span>
              </div>
              <button
                type="button"
                className="user-signout-btn"
                onClick={onSignOut}
                title="Sign Out"
                aria-label="Sign Out"
              >
                <LogOut size={16} />
              </button>
            </div>
          )}

          <div className="sidebar-note">
            <span className="sidebar-note__icon"><Sparkles size={16} /></span>
            <span><strong>Make space for focus</strong><small>Choose, finish, release</small></span>
          </div>
        </div>
      </aside>

      <div className="app-column">
        <header className="topbar">
          <div className="topbar-brand"><Brand /></div>
          <span className="topbar-context">A calm place for what matters next</span>

          <div className="topbar-actions">
            <ThemeControl />
            <button className="icon-button" type="button" onClick={onOpenAiSearch} aria-label="Search memory" title="AI Vector Memory Search (Ctrl+K)"><Search size={18} /></button>
            <button className="icon-button topbar-intelligence" type="button" onClick={onOpenIntelligence} aria-label="Open task intelligence" title="Task intelligence"><Sparkles size={18} /></button>
            <button className="button button--primary topbar-add" type="button" onClick={onOpenAiCapture}>
              <Plus size={18} strokeWidth={2.4} /> New task
            </button>

            {user && (
              <div className="topbar-user">
                {user.photoURL ? (
                  <img src={user.photoURL} alt={user.displayName || "User"} className="user-avatar topbar-user-avatar" />
                ) : (
                  <div className="user-avatar-placeholder topbar-user-avatar"><User size={14} /></div>
                )}
                <button
                  type="button"
                  className="user-signout-btn topbar-signout-btn"
                  onClick={onSignOut}
                  title="Sign Out"
                  aria-label="Sign Out"
                >
                  <LogOut size={16} />
                </button>
              </div>
            )}
          </div>
          {loading && <span className="route-progress" aria-label="Loading tasks" />}
        </header>
        <main className="main-content">{children}</main>
        <Navigation mobile />
        <div className="mobile-only-actions">
          <button className="mobile-add" type="button" onClick={onOpenAiCapture} aria-label="Create task with text or photo"><Plus size={24} /></button>
        </div>
      </div>
    </div>
  );
}
