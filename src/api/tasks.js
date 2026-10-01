import { apiRequest } from "./client.js";

export const taskApi = {
  analyze(date) {
    return apiRequest(`/tasks/analysis?${new URLSearchParams({ date })}`);
  },
  refreshAnalysis(date) {
    return apiRequest("/tasks/analysis/refresh", {
      method: "POST",
      body: JSON.stringify({ date }),
    });
  },
  list() {
    return apiRequest("/tasks");
  },
  create(task) {
    return apiRequest("/tasks", { method: "POST", body: JSON.stringify(task) });
  },
  update(id, task) {
    return apiRequest(`/tasks/${encodeURIComponent(id)}`, { method: "PUT", body: JSON.stringify(task) });
  },
  setCompletion(id, completed) {
    return apiRequest(`/tasks/${encodeURIComponent(id)}/completion`, {
      method: "PUT",
      body: JSON.stringify({ completed }),
    });
  },
  remove(id) {
    return apiRequest(`/tasks/${encodeURIComponent(id)}`, { method: "DELETE" });
  },
};
