import { AlertTriangle, ArrowRight, CalendarClock, CheckCircle2, CircleDotDashed, Sparkles } from "lucide-react";
import { useMemo, useState } from "react";
import ConfirmDialog from "../components/ConfirmDialog";
import EmptyState from "../components/EmptyState";
import TaskRow from "../components/TaskRow";
import { fullDate } from "../lib/dates";
import { focusGroups, taskSummary } from "../lib/tasks";

const groupIcons = { overdue: AlertTriangle, today: CircleDotDashed, upcoming: CalendarClock };

function FocusOverview({ summary }) {
  const message = summary.overdue
    ? `${summary.overdue} overdue ${summary.overdue === 1 ? "task needs" : "tasks need"} a decision`
    : summary.today
      ? `${summary.today} ${summary.today === 1 ? "task is" : "tasks are"} ready for today`
      : "Your attention is clear";
  return (
    <section className="focus-overview">
      <div className="focus-overview__copy"><span className="eyebrow">Current workload</span><h2>{message}</h2><p>{summary.open ? `${summary.open} open across all lists. Choose the smallest meaningful next step.` : "Everything is complete. Add only what genuinely belongs here."}</p></div>
      <div className="focus-overview__count"><span>Open tasks</span><strong>{summary.open}</strong><small>{summary.completed} completed</small></div>
    </section>
  );
}

export default function FocusPage({ tasks, today, togglingIds, deletingId, deleteError, onAdd, onToggle, onEdit, onDelete }) {
  const [pendingDelete, setPendingDelete] = useState(null);
  const summary = useMemo(() => taskSummary(tasks, today), [tasks, today]);
  const groups = useMemo(() => focusGroups(tasks, today), [tasks, today]);
  const visibleCount = groups.reduce((total, group) => total + group.tasks.length, 0);

  async function confirmDelete() {
    if (!pendingDelete) return;
    if (await onDelete(pendingDelete.id)) setPendingDelete(null);
  }

  return (
    <div className="page-stack">
      <header className="page-heading"><div><span className="eyebrow">Choose what matters</span><h1>Focus</h1><p>{fullDate(today)} · keep today realistic and finishable.</p></div></header>

      {visibleCount ? <section className="focus-groups">{groups.filter((group) => group.tasks.length).map((group) => {
        const Icon = groupIcons[group.id];
        return <article className={`focus-group focus-group--${group.id}`} key={group.id}><header><div><span className="focus-group__icon"><Icon size={17} /></span><span><strong>{group.label}</strong><small>{group.description}</small></span></div><span className="count-badge">{group.tasks.length}</span></header><div className="focus-group__tasks">{group.tasks.map((task) => <TaskRow key={task.id} task={task} today={today} compact toggling={togglingIds.has(task.id)} onToggle={onToggle} onEdit={onEdit} onDelete={setPendingDelete} />)}</div></article>;
      })}</section> : <section className="panel"><EmptyState title="Your focus space is clear" description="Add one meaningful task for today, or enjoy the breathing room." actionLabel="Add a task" onAction={onAdd} /></section>}

      <FocusOverview summary={summary} />
      <section className="metric-grid" aria-label="Task summary">
        <article className="metric"><span className="metric__icon"><CircleDotDashed size={18} /></span><span>Due today</span><strong>{summary.today}</strong><small>ready for focus</small></article>
        <article className="metric metric--danger"><span className="metric__icon"><AlertTriangle size={18} /></span><span>Overdue</span><strong>{summary.overdue}</strong><small>needs a decision</small></article>
        <article className="metric"><span className="metric__icon"><ArrowRight size={18} /></span><span>Next 7 days</span><strong>{summary.upcoming}</strong><small>coming into view</small></article>
        <article className="metric metric--success"><span className="metric__icon"><CheckCircle2 size={18} /></span><span>Completed</span><strong>{summary.completed}</strong><small>of {summary.total} total</small></article>
      </section>

      {!tasks.length && <div className="focus-whisper"><Sparkles size={16} /> One clear task is enough to begin.</div>}
      <ConfirmDialog error={deleteError && deleteError.id === pendingDelete?.id ? deleteError.message : ""} open={Boolean(pendingDelete)} task={pendingDelete} busy={deletingId === pendingDelete?.id} onCancel={() => setPendingDelete(null)} onConfirm={confirmDelete} />
    </div>
  );
}

