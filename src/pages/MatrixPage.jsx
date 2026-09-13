import { ArrowDown, ArrowRight, Check, Clock3, Handshake, Trash2, Zap } from "lucide-react";
import { useMemo } from "react";
import { dueMeta, listToken, matrixGroups } from "../lib/tasks";

const icons = { do: Zap, schedule: Clock3, delegate: Handshake, drop: Trash2 };

export default function MatrixPage({ tasks, today, togglingIds, onAdd, onToggle, onEdit }) {
  const groups = useMemo(() => matrixGroups(tasks), [tasks]);
  return (
    <div className="page-stack matrix-page">
      <header className="page-heading"><div><span className="eyebrow">Urgent versus important</span><h1>Priority matrix</h1><p>Protect important work before it becomes urgent.</p></div></header>
      <div className="matrix-axis matrix-axis--horizontal"><span>More urgent</span><strong>Urgency <ArrowRight size={15} /></strong><span>Less urgent</span></div>
      <div className="matrix-layout">
        <div className="matrix-axis matrix-axis--vertical"><span>More important</span><strong>Importance <ArrowDown size={15} /></strong><span>Less important</span></div>
        <section className="task-matrix" aria-label="Urgent and important task matrix">{groups.map((group) => {
          const Icon = icons[group.id];
          return <article className={`matrix-quadrant matrix-quadrant--${group.id}`} key={group.id}><header><div><span className="matrix-icon"><Icon size={17} /></span><span><small>{group.eyebrow}</small><h2>{group.label}</h2><p>{group.guidance}</p></span></div><strong>{group.tasks.length}</strong></header><div className="matrix-tasks">{group.tasks.length ? group.tasks.map((task) => {
            const due = dueMeta(task, today);
            return <article className="matrix-task" key={task.id} style={{ "--list-color": listToken(task.taskList) }}><button className="matrix-check" type="button" disabled={togglingIds.has(task.id)} aria-label={`Complete: ${task.title}`} onClick={() => onToggle(task, true)}><Check size={15} /></button><button className="matrix-task__copy" type="button" onClick={() => onEdit(task)}><strong>{task.title}</strong><span><i />{task.taskList}<small className={`task-due--${due.tone}`}>{due.label}</small></span></button></article>;
          }) : <button className="matrix-empty" type="button" onClick={onAdd}>Nothing here <span>Add a task</span></button>}</div></article>;
        })}</section>
      </div>
    </div>
  );
}

