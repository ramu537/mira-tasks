import { dayDifference, shiftDate, shortDate } from "./dates.js";

export const defaultLists = ["Personal", "Work", "Home", "Finance"];
export const priorities = ["HIGH", "MEDIUM", "LOW", "NONE"];

const listTokens = ["var(--list-blue)", "var(--list-violet)", "var(--list-teal)", "var(--list-amber)", "var(--list-pink)"];

export function listToken(name) {
  const value = String(name || "Inbox");
  const hash = Array.from(value).reduce((total, character) => total + character.codePointAt(0), 0);
  return listTokens[hash % listTokens.length];
}

export function priorityLabel(priority) {
  return priority === "NONE" ? "No priority" : `${priority.charAt(0)}${priority.slice(1).toLowerCase()}`;
}

export function dueMeta(task, today) {
  if (!task.dueOn) return { label: "No due date", tone: "none" };
  const difference = dayDifference(today, task.dueOn);
  if (difference < 0) return { label: `${Math.abs(difference)}d overdue`, tone: "danger" };
  if (difference === 0) return { label: "Due today", tone: "today" };
  if (difference === 1) return { label: "Tomorrow", tone: "soon" };
  if (difference <= 7) return { label: `In ${difference} days`, tone: "soon" };
  return { label: shortDate(task.dueOn), tone: "none" };
}

export function taskSummary(tasks, today) {
  const open = tasks.filter((task) => !task.completed);
  const nextWeek = shiftDate(today, 7);
  return {
    total: tasks.length,
    open: open.length,
    completed: tasks.length - open.length,
    overdue: open.filter((task) => task.dueOn && task.dueOn < today).length,
    today: open.filter((task) => (task.dueOn === today || task.focusOn === today) && !(task.dueOn && task.dueOn < today)).length,
    upcoming: open.filter((task) => task.dueOn && task.dueOn > today && task.dueOn <= nextWeek).length,
    completionRate: tasks.length ? Math.round(((tasks.length - open.length) / tasks.length) * 100) : 0,
  };
}

export function focusGroups(tasks, today) {
  const open = tasks.filter((task) => !task.completed);
  const nextWeek = shiftDate(today, 7);
  return [
    {
      id: "overdue",
      label: "Overdue",
      description: "Decide, reschedule, or finish",
      tasks: sortTasks(open.filter((task) => task.dueOn && task.dueOn < today)),
    },
    {
      id: "today",
      label: "Today",
      description: "Your deliberate focus",
      tasks: sortTasks(open.filter((task) => (task.dueOn === today || task.focusOn === today) && !(task.dueOn && task.dueOn < today))),
    },
    {
      id: "upcoming",
      label: "Next seven days",
      description: "What is approaching",
      tasks: sortTasks(open.filter((task) => task.dueOn && task.dueOn > today && task.dueOn <= nextWeek && task.focusOn !== today)),
    },
  ];
}

export function matrixQuadrant(task) {
  if (task.urgent && task.important) return "do";
  if (!task.urgent && task.important) return "schedule";
  if (task.urgent && !task.important) return "delegate";
  return "drop";
}

export function matrixGroups(tasks) {
  const open = tasks.filter((task) => !task.completed);
  const definitions = [
    { id: "do", label: "Do first", eyebrow: "Urgent · Important", guidance: "Act now" },
    { id: "schedule", label: "Schedule", eyebrow: "Important · Not urgent", guidance: "Protect time" },
    { id: "delegate", label: "Delegate", eyebrow: "Urgent · Not important", guidance: "Hand it off" },
    { id: "drop", label: "Reconsider", eyebrow: "Not urgent · Not important", guidance: "Remove or defer" },
  ];
  return definitions.map((definition) => ({
    ...definition,
    tasks: sortTasks(open.filter((task) => matrixQuadrant(task) === definition.id)),
  }));
}

export function filterTasks(tasks, search, filter) {
  const term = search.trim().toLocaleLowerCase();
  return sortTasks(tasks.filter((task) => {
    const haystack = `${task.title} ${task.notes || ""} ${task.taskList}`.toLocaleLowerCase();
    const matchesSearch = !term || haystack.includes(term);
    const matchesFilter = filter === "OPEN"
      ? !task.completed
      : filter === "DONE"
        ? task.completed
        : filter === "HIGH"
          ? task.priority === "HIGH"
          : filter.startsWith("LIST:")
            ? task.taskList === filter.slice(5)
            : true;
    return matchesSearch && matchesFilter;
  }));
}

export function uniqueLists(tasks) {
  return Array.from(new Set([...defaultLists, ...tasks.map((task) => task.taskList).filter(Boolean)]));
}

export function sortTasks(tasks) {
  const priorityRank = { HIGH: 0, MEDIUM: 1, LOW: 2, NONE: 3 };
  return [...tasks].sort((left, right) => {
    if (left.completed !== right.completed) return Number(left.completed) - Number(right.completed);
    const dateOrder = (left.dueOn || "9999-12-31").localeCompare(right.dueOn || "9999-12-31");
    return dateOrder || priorityRank[left.priority] - priorityRank[right.priority] || left.title.localeCompare(right.title);
  });
}
