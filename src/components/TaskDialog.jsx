import { Check, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { defaultLists, priorities, priorityLabel, uniqueLists } from "../lib/tasks";

const blankTask = (today) => ({
  title: "",
  notes: "",
  taskList: "Personal",
  priority: "MEDIUM",
  dueOn: today,
  focusOn: "",
  urgent: false,
  important: true,
});

export default function TaskDialog({ open, task, tasks, today, busy, onClose, onSave }) {
  const ref = useRef(null);
  const [form, setForm] = useState(blankTask(today));
  const [attempted, setAttempted] = useState(false);

  useEffect(() => {
    if (!open) return;
    setForm(task ? {
      title: task.title,
      notes: task.notes || "",
      taskList: task.taskList,
      priority: task.priority,
      dueOn: task.dueOn || "",
      focusOn: task.focusOn || "",
      urgent: task.urgent,
      important: task.important,
    } : blankTask(today));
    setAttempted(false);
  }, [open, task, today]);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  const lists = useMemo(() => Array.from(new Set([...defaultLists, ...uniqueLists(tasks), form.taskList].filter(Boolean))), [form.taskList, tasks]);
  const titleValid = form.title.trim().length > 0 && form.title.trim().length <= 140;
  const listValid = form.taskList.trim().length > 0 && form.taskList.trim().length <= 40;
  const valid = titleValid && listValid && priorities.includes(form.priority) && form.notes.length <= 500;
  const update = (field, value) => setForm((current) => ({ ...current, [field]: value }));

  async function submit(event) {
    event.preventDefault();
    setAttempted(true);
    if (!valid) return;
    await onSave({
      ...form,
      title: form.title.trim(),
      notes: form.notes.trim() || null,
      taskList: form.taskList.trim(),
      dueOn: form.dueOn || null,
      focusOn: form.focusOn || null,
    });
  }

  return (
    <dialog ref={ref} className="dialog task-dialog" onCancel={(event) => { event.preventDefault(); if (!busy) onClose(); }} onClick={(event) => { if (event.target === ref.current && !busy) onClose(); }}>
      <form className="dialog-card task-form" onSubmit={submit} noValidate>
        <header className="dialog-header"><div><span className="eyebrow">{task ? "Clarify the commitment" : "Turn intention into action"}</span><h2>{task ? "Edit task" : "Create a task"}</h2><p>Capture the next concrete step, then decide when it deserves attention.</p></div><button className="icon-button" type="button" onClick={onClose} disabled={busy} aria-label="Close task form"><X size={20} /></button></header>
        <div className="form-body">
          <label className="field"><span>What needs doing?</span><input autoFocus required maxLength="140" placeholder="Send the project proposal" value={form.title} onChange={(event) => update("title", event.target.value)} aria-invalid={attempted && !titleValid} />{attempted && !titleValid && <small className="field-error">Enter a clear task title of 140 characters or fewer.</small>}</label>
          <label className="field"><span>Notes <small>Optional</small></span><textarea rows="3" maxLength="500" placeholder="Add the next useful detail" value={form.notes} onChange={(event) => update("notes", event.target.value)} /></label>
          <div className="form-grid">
            <label className="field"><span>List</span><select value={form.taskList} onChange={(event) => update("taskList", event.target.value)}>{lists.map((list) => <option key={list} value={list}>{list}</option>)}</select></label>
            <label className="field"><span>Priority</span><select value={form.priority} onChange={(event) => update("priority", event.target.value)}>{priorities.map((priority) => <option key={priority} value={priority}>{priorityLabel(priority)}</option>)}</select></label>
          </div>
          <div className="form-grid">
            <label className="field"><span>Due date <small>Optional</small></span><input type="date" value={form.dueOn} onChange={(event) => update("dueOn", event.target.value)} /></label>
            <label className="field"><span>Focus date <small>Optional</small></span><input type="date" value={form.focusOn} onChange={(event) => update("focusOn", event.target.value)} /></label>
          </div>
          <fieldset className="decision-fieldset"><legend>Priority matrix</legend><p>Urgency measures time pressure. Importance measures meaningful impact.</p><div className="decision-choices">
            <button type="button" className={form.urgent ? "decision-choice is-urgent" : "decision-choice"} aria-pressed={form.urgent} onClick={() => update("urgent", !form.urgent)}><span><strong>Urgent</strong><small>Needs attention soon</small></span>{form.urgent && <Check size={17} />}</button>
            <button type="button" className={form.important ? "decision-choice is-important" : "decision-choice"} aria-pressed={form.important} onClick={() => update("important", !form.important)}><span><strong>Important</strong><small>Creates meaningful impact</small></span>{form.important && <Check size={17} />}</button>
          </div></fieldset>
        </div>
        <footer className="dialog-actions form-actions"><button className="button button--ghost" type="button" onClick={onClose} disabled={busy}>Cancel</button><button className="button button--primary" type="submit" disabled={busy}>{busy ? "Saving…" : task ? "Save changes" : "Create task"}</button></footer>
      </form>
    </dialog>
  );
}

