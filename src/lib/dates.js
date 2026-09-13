export function localDateKey(date = new Date()) {
  const offset = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 10);
}

export function shiftDate(dateKey, days) {
  const date = new Date(`${dateKey}T12:00:00`);
  date.setDate(date.getDate() + days);
  return localDateKey(date);
}

export function fullDate(dateKey) {
  return new Intl.DateTimeFormat("en-IN", { weekday: "long", day: "numeric", month: "long" })
    .format(new Date(`${dateKey}T12:00:00`));
}

export function shortDate(dateKey) {
  return new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short" })
    .format(new Date(`${dateKey}T12:00:00`));
}

export function dayDifference(from, to) {
  return Math.round((new Date(`${to}T12:00:00`) - new Date(`${from}T12:00:00`)) / 86_400_000);
}

