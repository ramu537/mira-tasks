import { Search, SlidersHorizontal, X } from "lucide-react";
import { useMemo, useState } from "react";
import ConfirmDialog from "../components/ConfirmDialog";
import EmptyState from "../components/EmptyState";
import TaskRow from "../components/TaskRow";
import { filterTasks, listToken, uniqueLists } from "../lib/tasks";

const baseFilters = [
  { value: "OPEN", label: "Open" },
  { value: "ALL", label: "All" },
  { value: "HIGH", label: "High priority" },
  { value: "DONE", label: "Completed" },
];

export default function AllTasksPage({ tasks, today, togglingIds, deletingId, onAdd, onToggle, onEdit, onDelete }) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("OPEN");
  const [pendingDelete, setPendingDelete] = useState(null);
  const lists = useMemo(() => uniqueLists(tasks).filter((list) => tasks.some((task) => task.taskList === list)), [tasks]);
  const visible = useMemo(() => filterTasks(tasks, search, filter), [tasks, search, filter]);

  async function confirmDelete() {
    if (!pendingDelete) return;
    if (await onDelete(pendingDelete.id)) setPendingDelete(null);
  }

  return (
    <div className="page-stack">
      <header className="page-heading page-heading--split"><div><span className="eyebrow">Everything in one place</span><h1>All tasks</h1><p>Search and filter without losing sight of the work.</p></div><span className="result-count"><strong>{visible.length}</strong> {visible.length === 1 ? "task" : "tasks"}</span></header>
      <section className="task-tools" aria-label="Task controls">
        <label className="search-field"><Search size={18} /><span className="sr-only">Search tasks</span><input type="search" placeholder="Search title, notes, or list" value={search} onChange={(event) => setSearch(event.target.value)} />{search && <button type="button" onClick={() => setSearch("")} aria-label="Clear search"><X size={17} /></button>}</label>
        <div className="filter-scroll"><span className="filter-label"><SlidersHorizontal size={15} /> View</span>{[...baseFilters, ...lists.map((list) => ({ value: `LIST:${list}`, label: list }))].map((item) => <button key={item.value} className={filter === item.value ? "filter-chip is-active" : "filter-chip"} type="button" aria-pressed={filter === item.value} onClick={() => setFilter(item.value)}>{item.value.startsWith("LIST:") && <i style={{ "--list-color": listToken(item.label) }} />}{item.label}</button>)}</div>
      </section>

      {lists.length > 0 && <section className="list-progress" aria-label="List progress">{lists.map((list) => {
        const listTasks = tasks.filter((task) => task.taskList === list);
        const completed = listTasks.filter((task) => task.completed).length;
        const percent = Math.round((completed / listTasks.length) * 100);
        return <article key={list} style={{ "--list-color": listToken(list), "--list-progress": `${percent}%` }}><header><span><i />{list}</span><strong>{completed}/{listTasks.length}</strong></header><div><i /></div></article>;
      })}</section>}

      <section className="panel task-table-card">
        {visible.length ? <div className="task-table"><header><span>Task</span><span>List</span><span>Priority</span><span>Due</span><span className="sr-only">Actions</span></header><div>{visible.map((task) => <TaskRow key={task.id} task={task} today={today} toggling={togglingIds.has(task.id)} onToggle={onToggle} onEdit={onEdit} onDelete={setPendingDelete} />)}</div></div> : <EmptyState kind={search ? "search" : "clear"} title={search ? "No matching tasks" : filter === "OPEN" ? "Everything is complete" : "Nothing in this view"} description={search ? "Try another search or remove a filter." : "Create a task or choose another filter."} actionLabel="New task" onAction={onAdd} />}
      </section>
      <ConfirmDialog open={Boolean(pendingDelete)} task={pendingDelete} busy={deletingId === pendingDelete?.id} onCancel={() => setPendingDelete(null)} onConfirm={confirmDelete} />
    </div>
  );
}

