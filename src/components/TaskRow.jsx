import { Check, Flag, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { dueMeta, listToken, priorityLabel } from "../lib/tasks";

export default function TaskRow({ task, today, toggling, compact = false, onToggle, onEdit, onDelete }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null), trigger = useRef(null);
  const due = dueMeta(task, today);

  useEffect(() => {
    if (!menuOpen) return undefined;
    const close = (event) => { if (!menuRef.current?.contains(event.target)) setMenuOpen(false); };
    document.addEventListener("pointerdown", close);
    return () => document.removeEventListener("pointerdown", close);
  }, [menuOpen]);

  return (
    <article className={`task-row${task.completed ? " is-completed" : ""}${compact ? " is-compact" : ""}`} style={{ "--list-color": listToken(task.taskList) }}>
      <button className="task-check" type="button" disabled={toggling} aria-pressed={task.completed} aria-label={`${task.completed ? "Reopen" : "Complete"}: ${task.title}`} onClick={() => onToggle(task, !task.completed)}>{task.completed && <Check size={18} strokeWidth={2.8} />}</button>
      <button className="task-copy" type="button" onClick={() => onEdit(task)}><strong>{task.title}</strong>{task.notes && <small>{task.notes}</small>}</button>
      <span className="task-list"><i />{task.taskList}</span>
      <span className={`priority priority--${task.priority.toLowerCase()}`}><Flag size={13} />{priorityLabel(task.priority)}</span>
      <span className={`task-due task-due--${due.tone}`}>{due.label}</span>
      <div className="row-menu" ref={menuRef} onKeyDown={event => { if (event.key === "Escape" && menuOpen) { event.preventDefault(); event.stopPropagation(); setMenuOpen(false); trigger.current?.focus(); } }}><button ref={trigger} className="icon-button" type="button" aria-label={`Actions for ${task.title}`} aria-expanded={menuOpen} onClick={() => setMenuOpen((current) => !current)}><MoreHorizontal size={19} /></button>{menuOpen && <div className="row-menu__popover"><button type="button" onClick={() => { trigger.current?.focus(); setMenuOpen(false); onEdit(task); }}><Pencil size={16} /> Edit</button><button className="danger-action" type="button" onClick={() => { trigger.current?.focus(); setMenuOpen(false); onDelete(task); }}><Trash2 size={16} /> Delete</button></div>}</div>
    </article>
  );
}

