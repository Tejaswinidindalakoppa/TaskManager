import { useEffect, useMemo, useReducer, useRef, useState } from "react";

const APP_THEME = {
  accent: "#B2E4BA",
  accentText: "#14532d",
  surface: "#ffffff",
  background: "#eef2f7",
  text: "#0f172a",
  muted: "#64748b",
};

const DEMO_TIMESTAMP = "2026-05-23T00:00:00.000Z";
const UTC_DATE_FORMAT = new Intl.DateTimeFormat("en-GB", {
  year: "numeric",
  month: "short",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hour12: false,
  timeZone: "UTC",
});

function formatUtcTimestamp(timestamp) {
  const date = new Date(timestamp);
  return Number.isNaN(date.getTime()) ? "" : UTC_DATE_FORMAT.format(date);
}

let uidCounter = 0;

function resetUidCounter() {
  uidCounter = 0;
}

const TAG_COLORS = {
  Design: { bg: "#fce7f3", color: "#be185d" },
  Frontend: { bg: "#ede9fe", color: "#7c3aed" },
  Backend: { bg: "#e0f2fe", color: "#0369a1" },
  API: { bg: "#dbeafe", color: "#1d4ed8" },
  UX: { bg: "#fef9c3", color: "#a16207" },
  QA: { bg: "#fee2e2", color: "#dc2626" },
  Research: { bg: "#ecfeff", color: "#0e7490" },
  Ops: { bg: "#f1f5f9", color: "#334155" },
  Mobile: { bg: "#ede9fe", color: "#6d28d9" },
  Product: { bg: "#dcfce7", color: "#166534" },
};

const MEMBERS = [
  { id: "MA", name: "Michael Anderson", role: "Product Designer", color: "#f97316" },
  { id: "SC", name: "Sophia Carter", role: "Design Lead", color: "#ec4899" },
  { id: "DJ", name: "Daniel Johnson", role: "Frontend Engineer", color: "#6366f1" },
  { id: "JW", name: "James Wilson", role: "Backend Engineer", color: "#06b6d4" },
  { id: "AR", name: "Ava Roberts", role: "QA Analyst", color: "#10b981" },
];

const COLUMN_TEMPLATES = [
  { id: "todo", title: "To Do", color: "#64748b" },
  { id: "progress", title: "In Progress", color: "#3b82f6" },
  { id: "review", title: "Review", color: "#f59e0b" },
  { id: "done", title: "Done", color: "#B2E4BA" },
];

const PROJECT_TEMPLATES = [
  {
    id: "website",
    label: "Website Delivery",
    description: "Website, content, QA, and launch tasks.",
    taskCount: 9,
    statusCounts: { progress: 3, review: 2, todo: 2, done: 2 },
    seed: [
      ["Homepage refresh", "New headline, visual hierarchy, and CTA", ["Design", "Frontend"], ["MA", "DJ"], 1],
      ["Navigation cleanup", "Simplify menus and improve mobile flow", ["UX", "Frontend"], ["SC", "DJ"], 2],
      ["SEO meta pass", "Update titles, descriptions, and schema", ["Backend", "Product"], ["DJ", "JW"], 3],
      ["Hero media swap", "Replace placeholder media with polished assets", ["Design", "Product"], ["MA", "SC"], 1],
      ["Footer links audit", "Validate legal, support, and policy links", ["QA", "Ops"], ["AR", "JW"], 0],
      ["Accessibility pass", "Ensure WCAG 2.1 AA for key pages", ["QA", "Frontend"], ["AR", "DJ"], 0],
      ["Analytics events", "Instrument core user journeys for analytics", ["Backend", "Product"], ["JW", "SC"], 0],
      ["Performance budget", "Set and measure key performance budgets", ["Performance", "Frontend"], ["DJ", "MA"], 2],
      ["Content migration", "Move legacy blog and product pages to new CMS", ["Content", "Frontend"], ["MA", "JW"], 0],
      ["A/B headline test", "Run experiment for two headline variants", ["Product", "Research"], ["SC", "AR"], 0],
      ["Contact form validation", "Improve server-side and client-side validation", ["Backend", "Frontend"], ["JW", "DJ"], 1],
      ["Cross-browser QA", "Verify pages in supported browsers and versions", ["QA", "Frontend"], ["AR", "SC"], 2],
      ["Privacy policy update", "Ensure compliance text and consent flows", ["Legal", "Product"], ["SC", "MA"], 0],
      ["Image optimization", "Automate image compression and responsive sizes", ["Performance", "Design"], ["MA", "DJ"], 1],
    ],
  },
  {
    id: "product",
    label: "Product Launch",
    description: "Cross-functional launch with engineering and QA.",
    taskCount: 8,
    statusCounts: { progress: 3, review: 2, todo: 2, done: 1 },
    seed: [
      ["Release checklist", "Define launch gates and owners", ["Product", "Ops"], ["SC", "AR"], 0],
      ["Bug triage", "Sort blockers and prioritize fixes", ["QA", "Backend"], ["AR", "DJ"], 1],
      ["Launch comms", "Prepare announcement and support notes", ["Product", "Design"], ["MA", "SC"], 2],
      ["Support handoff", "Create support scripts and escalation routing", ["Ops", "QA"], ["JW", "AR"], 1],
      ["Stakeholder update", "Summarize progress and remaining risks", ["Product", "Ops"], ["SC", "MA"], 0],
      ["Beta feedback", "Collect and triage beta user feedback", ["QA", "Research"], ["AR", "SC"], 0],
      ["Telemetry validation", "Confirm telemetry and error reporting", ["Backend", "Ops"], ["JW", "DJ"], 1],
      ["Marketing assets", "Prepare screenshots and media for launch", ["Design", "Product"], ["MA", "SC"], 2],
      ["Pricing experiments", "Validate new pricing tiers with small cohort", ["Product", "Research"], ["SC", "AR"], 0],
      ["Customer docs", "Write initial user guides and troubleshooting", ["Product", "Docs"], ["MA", "SC"], 1],
      ["Retention analysis", "Analyze early user retention and churn signals", ["Research", "Backend"], ["JW", "AR"], 0],
      ["SLA definition", "Draft target SLAs for uptime and incident response", ["Ops", "Product"], ["SC", "JW"], 0],
      ["Integrations testing", "End-to-end tests for third-party integrations", ["QA", "Backend"], ["AR", "DJ"], 2],
      ["Customer onboarding", "Build checklist and in-app onboarding tips", ["Product", "Design"], ["MA", "SC"], 1],
    ],
  },
  {
    id: "mobile",
    label: "Mobile App",
    description: "App screens, interaction design, and QA.",
    taskCount: 9,
    statusCounts: { progress: 3, review: 2, todo: 2, done: 2 },
    seed: [
      ["Onboarding flow", "Map screens and microcopy", ["Design", "Mobile"], ["MA", "SC"], 1],
      ["Auth screens", "Build login and sign-up states", ["Frontend", "Mobile"], ["DJ", "JW"], 2],
      ["Device QA", "Check layouts across target devices", ["QA", "Research"], ["AR", "SC"], 3],
      ["Push notification UI", "Design in-app notification states", ["Design", "Mobile"], ["MA", "DJ"], 1],
      ["Offline mode pass", "Review cached views and fallback states", ["Backend", "QA"], ["JW", "AR"], 0],
      ["App store listing", "Prepare descriptions, icons, and screenshots", ["Product", "Design"], ["SC", "MA"], 0],
      ["Performance profiling", "Profile cold start and heavy flows", ["Performance", "Frontend"], ["DJ", "JW"], 2],
      ["Edge-case QA", "Test error states and flaky network behavior", ["QA", "Research"], ["AR", "SC"], 1],
      ["Dark mode support", "Add dark theme styles and verify contrast", ["Design", "Mobile"], ["MA", "DJ"], 1],
      ["Localization", "Add support for Spanish and French locales", ["Product", "Mobile"], ["SC", "MA"], 0],
      ["In-app purchases", "Integrate purchase flow and sandbox testing", ["Backend", "Mobile"], ["JW", "DJ"], 2],
      ["Crash analytics", "Integrate crash reporting and prioritize fixes", ["Ops", "QA"], ["AR", "JW"], 1],
      ["Background sync", "Ensure content syncs when connectivity resumes", ["Backend", "Mobile"], ["JW", "DJ"], 0],
      ["Gesture polish", "Tune gestures and animations for fluid UX", ["Design", "Mobile"], ["MA", "SC"], 1],
    ],
  },
];

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function uid(prefix) {
  uidCounter += 1;
  return `${prefix}_${String(uidCounter).padStart(4, "0")}`;
}

function makeTask({ id = uid("task"), title, description, tags = ["Product"], assignees = ["MA"], status = "todo", progress = 0, total = 4, priority = "Medium", dueDate = "", createdAt = new Date().toISOString() }) {
  return {
    id,
    title,
    description,
    tags,
    assignees,
    status,
    progress,
    total,
    priority,
    dueDate,
    createdAt,
    updatedAt: createdAt,
  };
}

function createProjectFromTemplate(template) {
  const projectId = uid("project");
  const now = DEMO_TIMESTAMP;
  const tasks = {};
  const columns = COLUMN_TEMPLATES.reduce((acc, column) => {
    acc[column.id] = { ...column, tasks: [] };
    return acc;
  }, {});

  const desiredCounts = template.statusCounts || { progress: 3, review: 2, todo: 2, done: 2 };
  const statusOrder = [];
  // Ensure statuses are assigned in the visible column order (To Do, In Progress, Review, Done)
  COLUMN_TEMPLATES.forEach(col => {
    const count = desiredCounts[col.id] || 0;
    for (let i = 0; i < count; i += 1) statusOrder.push(col.id);
  });

  template.seed.slice(0, template.taskCount || statusOrder.length).forEach(([title, description, tags, assignees, progress], index) => {
    // NOTE: statuses are assigned from a desired distribution below; see statusOrder
    const task = makeTask({
      id: uid("task"),
      title,
      description,
      tags,
      assignees,
      status: statusOrder[index] || "todo",
      progress,
      total: 4,
      priority: index === 0 ? "High" : "Medium",
      createdAt: now,
    });
    tasks[task.id] = task;
    columns[task.status].tasks.push(task.id);
  });

  Object.keys(tasks).forEach(taskId => {
    const task = tasks[taskId];
    if (!task.status) task.status = "todo";
  });

  return {
    id: projectId,
    name: template.label,
    description: template.description,
    color: template.id === "website" ? "#6366f1" : template.id === "product" ? "#0ea5e9" : "#8b5cf6",
    status: "Active",
    client: template.label.split(" ")[0],
    createdAt: now,
    archived: false,
    columns,
    tasks,
    members: MEMBERS.slice(0, 4),
  };
}

function createBlankProject({ name, description, color, client }) {
  const projectId = uid("project");
  const now = DEMO_TIMESTAMP;
  const columns = COLUMN_TEMPLATES.reduce((acc, column) => {
    acc[column.id] = { ...column, tasks: [] };
    return acc;
  }, {});
  return {
    id: projectId,
    name,
    description,
    client,
    color,
    status: "Active",
    createdAt: now,
    archived: false,
    columns,
    tasks: {},
    members: MEMBERS.slice(0, 4),
  };
}

function createInitialState() {
  resetUidCounter();
  const projects = [
    createProjectFromTemplate(PROJECT_TEMPLATES[0]),
    createProjectFromTemplate(PROJECT_TEMPLATES[1]),
    createProjectFromTemplate(PROJECT_TEMPLATES[2]),
  ];
  return {
    projects,
    activeProjectId: projects[0].id,
    activityLog: [
      { id: uid("log"), message: "Workspace started", detail: "Seed projects loaded", timestamp: DEMO_TIMESTAMP },
    ],
    notifications: [],
    ui: {
      search: "",
      sortBy: "priority",
      filterTag: "all",
      showArchived: false,
    },
    loading: false,
  };
}

const ACTIONS = {
  LOAD: "LOAD",
  SET_ACTIVE_PROJECT: "SET_ACTIVE_PROJECT",
  CREATE_PROJECT: "CREATE_PROJECT",
  UPDATE_PROJECT: "UPDATE_PROJECT",
  DELETE_PROJECT: "DELETE_PROJECT",
  ARCHIVE_PROJECT: "ARCHIVE_PROJECT",
  ADD_TASK: "ADD_TASK",
  UPDATE_TASK: "UPDATE_TASK",
  DELETE_TASK: "DELETE_TASK",
  MOVE_TASK: "MOVE_TASK",
  ADD_NOTIFICATION: "ADD_NOTIFICATION",
  REMOVE_NOTIFICATION: "REMOVE_NOTIFICATION",
  ADD_ACTIVITY: "ADD_ACTIVITY",
  SET_UI: "SET_UI",
  SET_LOADING: "SET_LOADING",
};

function reducer(state, action) {
  switch (action.type) {
    case ACTIONS.LOAD:
      return action.payload;
    case ACTIONS.SET_ACTIVE_PROJECT:
      return { ...state, activeProjectId: action.payload };
    case ACTIONS.CREATE_PROJECT: {
      const project = action.payload;
      return {
        ...state,
        projects: [project, ...state.projects],
        activeProjectId: project.id,
      };
    }
    case ACTIONS.UPDATE_PROJECT: {
      const projects = state.projects.map(project => project.id === action.payload.id ? { ...project, ...action.payload.updates } : project);
      return { ...state, projects };
    }
    case ACTIONS.DELETE_PROJECT: {
      const projects = state.projects.filter(project => project.id !== action.payload);
      const activeProjectId = state.activeProjectId === action.payload ? (projects[0]?.id || null) : state.activeProjectId;
      return { ...state, projects, activeProjectId };
    }
    case ACTIONS.ARCHIVE_PROJECT: {
      const projects = state.projects.map(project => project.id === action.payload ? { ...project, archived: true, status: "Archived" } : project);
      const activeProjectId = state.activeProjectId === action.payload ? (state.projects.find(project => !project.archived && project.id !== action.payload)?.id || state.projects.find(project => project.id !== action.payload)?.id || action.payload) : state.activeProjectId;
      return { ...state, projects, activeProjectId };
    }
    case ACTIONS.ADD_TASK: {
      const projects = state.projects.map(project => {
        if (project.id !== action.payload.projectId) return project;
        const nextTasks = { ...project.tasks, [action.payload.task.id]: action.payload.task };
        const nextColumns = { ...project.columns };
        nextColumns[action.payload.task.status] = {
          ...nextColumns[action.payload.task.status],
          tasks: [...nextColumns[action.payload.task.status].tasks, action.payload.task.id],
        };
        return { ...project, tasks: nextTasks, columns: nextColumns };
      });
      return { ...state, projects };
    }
    case ACTIONS.UPDATE_TASK: {
      const projects = state.projects.map(project => {
        if (project.id !== action.payload.projectId) return project;
        const currentTask = project.tasks[action.payload.taskId];
        if (!currentTask) return project;
        const updatedTask = { ...currentTask, ...action.payload.updates, updatedAt: new Date().toISOString() };
        const nextTasks = { ...project.tasks, [action.payload.taskId]: updatedTask };
        const nextColumns = { ...project.columns };
        if (currentTask.status !== updatedTask.status) {
          nextColumns[currentTask.status] = {
            ...nextColumns[currentTask.status],
            tasks: nextColumns[currentTask.status].tasks.filter(id => id !== action.payload.taskId),
          };
          nextColumns[updatedTask.status] = {
            ...nextColumns[updatedTask.status],
            tasks: [...nextColumns[updatedTask.status].tasks, action.payload.taskId],
          };
        }
        return { ...project, tasks: nextTasks, columns: nextColumns };
      });
      return { ...state, projects };
    }
    case ACTIONS.DELETE_TASK: {
      const projects = state.projects.map(project => {
        if (project.id !== action.payload.projectId) return project;
        const task = project.tasks[action.payload.taskId];
        if (!task) return project;
        const nextTasks = { ...project.tasks };
        delete nextTasks[action.payload.taskId];
        const nextColumns = { ...project.columns };
        nextColumns[task.status] = {
          ...nextColumns[task.status],
          tasks: nextColumns[task.status].tasks.filter(id => id !== action.payload.taskId),
        };
        return { ...project, tasks: nextTasks, columns: nextColumns };
      });
      return { ...state, projects };
    }
    case ACTIONS.MOVE_TASK: {
      const projects = state.projects.map(project => {
        if (project.id !== action.payload.projectId) return project;
        const task = project.tasks[action.payload.taskId];
        if (!task || task.status === action.payload.toStatus) return project;
        const nextTasks = { ...project.tasks, [task.id]: { ...task, status: action.payload.toStatus, updatedAt: new Date().toISOString() } };
        const nextColumns = { ...project.columns };
        nextColumns[task.status] = {
          ...nextColumns[task.status],
          tasks: nextColumns[task.status].tasks.filter(id => id !== task.id),
        };
        nextColumns[action.payload.toStatus] = {
          ...nextColumns[action.payload.toStatus],
          tasks: [...nextColumns[action.payload.toStatus].tasks, task.id],
        };
        return { ...project, tasks: nextTasks, columns: nextColumns };
      });
      return { ...state, projects };
    }
    case ACTIONS.ADD_NOTIFICATION:
      return { ...state, notifications: [...state.notifications, { id: uid("note"), ...action.payload }] };
    case ACTIONS.REMOVE_NOTIFICATION:
      return { ...state, notifications: state.notifications.filter(notification => notification.id !== action.payload) };
    case ACTIONS.ADD_ACTIVITY:
      return { ...state, activityLog: [...state.activityLog, { id: uid("log"), ...action.payload }] };
    case ACTIONS.SET_UI:
      return { ...state, ui: { ...state.ui, ...action.payload } };
    case ACTIONS.SET_LOADING:
      return { ...state, loading: action.payload };
    default:
      return state;
  }
}

function useTaskWorkspace() {
  const [state, dispatch] = useReducer(reducer, undefined, createInitialState);

  return [state, dispatch];
}

function Avatar({ name, initials, color, size = 32 }) {
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: color,
        color: "#fff",
        fontWeight: 800,
        fontSize: Math.max(11, size * 0.34),
        border: "2px solid #fff",
        boxShadow: "0 2px 8px rgba(15,23,42,0.15)",
        flexShrink: 0,
      }}
      title={name}
    >
      {initials}
    </div>
  );
}

function Tag({ label }) {
  const style = TAG_COLORS[label] || { bg: "#e2e8f0", color: "#334155" };
  return (
    <span
      style={{
        background: style.bg,
        color: style.color,
        padding: "3px 10px",
        borderRadius: 999,
        fontSize: 11,
        fontWeight: 700,
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
      }}
    >
      {label}
    </span>
  );
}

function ModalShell({ title, subtitle, onClose, children, width = 640 }) {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(15,23,42,0.55)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 80,
        padding: 20,
      }}
      onClick={event => event.target === event.currentTarget && onClose()}
    >
      <div
        style={{
          width,
          maxWidth: "100%",
          maxHeight: "90vh",
          overflow: "auto",
          background: APP_THEME.surface,
          borderRadius: 24,
          boxShadow: "0 32px 80px rgba(15,23,42,0.24)",
          border: "1px solid rgba(148,163,184,0.22)",
        }}
      >
        <div style={{ padding: "22px 24px 16px", borderBottom: "1px solid #e2e8f0" }}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 16, alignItems: "start" }}>
            <div>
              <h2 style={{ margin: 0, fontSize: 22, color: APP_THEME.text }}>{title}</h2>
              {subtitle && <div style={{ marginTop: 6, color: APP_THEME.muted, fontSize: 13 }}>{subtitle}</div>}
            </div>
            <button onClick={onClose} style={iconButtonStyle}>×</button>
          </div>
        </div>
        <div style={{ padding: 24 }}>{children}</div>
      </div>
    </div>
  );
}

const labelStyle = { display: "block", fontSize: 12, fontWeight: 800, color: "#475569", marginBottom: 6 };
const inputStyle = {
  width: "100%",
  padding: "10px 12px",
  borderRadius: 12,
  border: "1.5px solid #dbe4ef",
  outline: "none",
  background: "#f8fafc",
  color: APP_THEME.text,
};
const iconButtonStyle = {
  width: 36,
  height: 36,
  borderRadius: 10,
  border: "none",
  background: "#eef2f7",
  color: APP_THEME.text,
  cursor: "pointer",
  fontSize: 18,
  fontWeight: 700,
};

function ProjectFormModal({ project, onClose, onSave }) {
  const [form, setForm] = useState(() => ({
    name: project?.name || "",
    description: project?.description || "",
    client: project?.client || "",
    color: project?.color || "#6366f1",
  }));

  return (
    <ModalShell
      title={project ? "Edit Project" : "Create Project"}
      subtitle="Create a workspace with its own tasks, columns, and team context."
      onClose={onClose}
      width={620}
    >
      <div style={{ display: "grid", gap: 16 }}>
        <div style={{ display: "grid", gap: 6 }}>
          <label style={labelStyle}>Project name</label>
          <input style={inputStyle} value={form.name} onChange={e => setForm(prev => ({ ...prev, name: e.target.value }))} placeholder="New product launch" />
        </div>
        <div style={{ display: "grid", gap: 6 }}>
          <label style={labelStyle}>Client / team</label>
          <input style={inputStyle} value={form.client} onChange={e => setForm(prev => ({ ...prev, client: e.target.value }))} placeholder="Acme Corp" />
        </div>
        <div style={{ display: "grid", gap: 6 }}>
          <label style={labelStyle}>Description</label>
          <textarea
            style={{ ...inputStyle, minHeight: 92, resize: "vertical" }}
            value={form.description}
            onChange={e => setForm(prev => ({ ...prev, description: e.target.value }))}
            placeholder="Describe the project scope, goals, and milestones."
          />
        </div>
        <div style={{ display: "grid", gap: 6 }}>
          <label style={labelStyle}>Project color</label>
          <input style={{ ...inputStyle, height: 46, padding: 6 }} type="color" value={form.color} onChange={e => setForm(prev => ({ ...prev, color: e.target.value }))} />
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 12, marginTop: 8 }}>
          <button style={secondaryButtonStyle} onClick={onClose}>Cancel</button>
          <button
            style={primaryButtonStyle}
            disabled={!form.name.trim()}
            onClick={() => onSave(form)}
          >
            {project ? "Save Project" : "Create Project"}
          </button>
        </div>
      </div>
    </ModalShell>
  );
}

function TaskFormModal({ task, project, initialStatus = "todo", onClose, onSave }) {
  const isEdit = Boolean(task?.id);
  const [form, setForm] = useState(() => ({
    title: task?.title || "",
    description: task?.description || "",
    tags: task?.tags?.join(", ") || "",
    assignees: task?.assignees?.join(", ") || "",
    status: task?.status || initialStatus,
    progress: task?.progress ?? 0,
    total: task?.total ?? 4,
    priority: task?.priority || "Medium",
    dueDate: task?.dueDate || "",
  }));

  return (
    <ModalShell
      title={isEdit ? "Edit Task" : "Create Task"}
      subtitle={`Add work to ${project.name}.`}
      onClose={onClose}
      width={720}
    >
      <div style={{ display: "grid", gap: 16 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1.4fr 0.6fr", gap: 16 }}>
          <div style={{ display: "grid", gap: 6 }}>
            <label style={labelStyle}>Title</label>
            <input style={inputStyle} value={form.title} onChange={e => setForm(prev => ({ ...prev, title: e.target.value }))} placeholder="Task title" />
          </div>
          <div style={{ display: "grid", gap: 6 }}>
            <label style={labelStyle}>Status</label>
            <select style={inputStyle} value={form.status} onChange={e => setForm(prev => ({ ...prev, status: e.target.value }))}>
              {project.columns ? Object.values(project.columns).map(column => <option key={column.id} value={column.id}>{column.title}</option>) : null}
            </select>
          </div>
        </div>
        <div style={{ display: "grid", gap: 6 }}>
          <label style={labelStyle}>Description</label>
          <textarea style={{ ...inputStyle, minHeight: 92, resize: "vertical" }} value={form.description} onChange={e => setForm(prev => ({ ...prev, description: e.target.value }))} placeholder="Short task description" />
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <div style={{ display: "grid", gap: 6 }}>
            <label style={labelStyle}>Tags</label>
            <input style={inputStyle} value={form.tags} onChange={e => setForm(prev => ({ ...prev, tags: e.target.value }))} placeholder="Design, Frontend" />
          </div>
          <div style={{ display: "grid", gap: 6 }}>
            <label style={labelStyle}>Assignees</label>
            <input style={inputStyle} value={form.assignees} onChange={e => setForm(prev => ({ ...prev, assignees: e.target.value }))} placeholder="MA, DJ" />
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "0.7fr 0.7fr 0.6fr 1fr", gap: 16 }}>
          <div style={{ display: "grid", gap: 6 }}>
            <label style={labelStyle}>Progress</label>
            <input type="number" min={0} max={form.total} style={inputStyle} value={form.progress} onChange={e => setForm(prev => ({ ...prev, progress: clamp(Number(e.target.value), 0, prev.total) }))} />
          </div>
          <div style={{ display: "grid", gap: 6 }}>
            <label style={labelStyle}>Total</label>
            <input type="number" min={1} max={20} style={inputStyle} value={form.total} onChange={e => setForm(prev => ({ ...prev, total: clamp(Number(e.target.value), 1, 20) }))} />
          </div>
          <div style={{ display: "grid", gap: 6 }}>
            <label style={labelStyle}>Priority</label>
            <select style={inputStyle} value={form.priority} onChange={e => setForm(prev => ({ ...prev, priority: e.target.value }))}>
              <option>Low</option>
              <option>Medium</option>
              <option>High</option>
              <option>Critical</option>
            </select>
          </div>
          <div style={{ display: "grid", gap: 6 }}>
            <label style={labelStyle}>Due date</label>
            <input type="date" style={inputStyle} value={form.dueDate} onChange={e => setForm(prev => ({ ...prev, dueDate: e.target.value }))} />
          </div>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 12, marginTop: 8 }}>
          <button style={secondaryButtonStyle} onClick={onClose}>Cancel</button>
          <button
            style={primaryButtonStyle}
            disabled={!form.title.trim()}
            onClick={() => onSave(form)}
          >
            {isEdit ? "Save Task" : "Create Task"}
          </button>
        </div>
      </div>
    </ModalShell>
  );
}

function NotificationStack({ notifications, onDismiss }) {
  return (
    <div style={{ position: "fixed", right: 20, bottom: 20, zIndex: 90, display: "grid", gap: 10, width: 340, maxWidth: "calc(100vw - 40px)" }}>
      {notifications.map(notification => (
        <div
          key={notification.id}
          style={{
            background: notification.variant === "success" ? "#B2E4BA" : notification.variant === "danger" ? "#fecaca" : "#dbeafe",
            color: notification.variant === "success" ? "#14532d" : notification.variant === "danger" ? "#7f1d1d" : "#1e40af",
            borderRadius: 16,
            padding: "14px 16px",
            boxShadow: "0 12px 30px rgba(15,23,42,0.16)",
            display: "flex",
            justifyContent: "space-between",
            gap: 14,
            alignItems: "center",
          }}
        >
          <div>
            <div style={{ fontWeight: 800, fontSize: 13 }}>{notification.title}</div>
            <div style={{ fontSize: 12, marginTop: 2, opacity: 0.9 }}>{notification.message}</div>
          </div>
          <button style={{ ...iconButtonStyle, width: 30, height: 30 }} onClick={() => onDismiss(notification.id)}>×</button>
        </div>
      ))}
    </div>
  );
}

function ActivityLog({ items, onClose }) {
  return (
    <ModalShell title="Activity Log" subtitle="Recent project and task actions." onClose={onClose} width={720}>
      <div style={{ display: "grid", gap: 12 }}>
        {items.length === 0 ? (
          <div style={{ color: APP_THEME.muted, fontSize: 14 }}>No recent activity.</div>
        ) : items.slice().reverse().map(item => (
          <div key={item.id} style={{ padding: 14, border: "1px solid #e2e8f0", borderRadius: 14, background: "#f8fafc" }}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "start" }}>
              <div>
                <div style={{ fontWeight: 800, color: APP_THEME.text, fontSize: 13 }}>{item.message}</div>
                <div style={{ color: APP_THEME.muted, fontSize: 12, marginTop: 4 }}>{item.detail}</div>
              </div>
              <div style={{ color: APP_THEME.muted, fontSize: 11, whiteSpace: "nowrap" }}>{formatUtcTimestamp(item.timestamp)}</div>
            </div>
          </div>
        ))}
      </div>
    </ModalShell>
  );
}

function StatCard({ label, value, detail, accent }) {
  return (
    <div style={{ background: APP_THEME.surface, borderRadius: 20, padding: 18, border: "1px solid #e2e8f0", boxShadow: "0 8px 24px rgba(15,23,42,0.05)" }}>
      <div style={{ color: APP_THEME.muted, fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.04em" }}>{label}</div>
      <div style={{ display: "flex", alignItems: "end", justifyContent: "space-between", gap: 12, marginTop: 10 }}>
        <div style={{ fontSize: 28, fontWeight: 900, color: accent || APP_THEME.text, lineHeight: 1 }}>{value}</div>
        <div style={{ fontSize: 12, color: APP_THEME.muted, textAlign: "right" }}>{detail}</div>
      </div>
    </div>
  );
}

function TaskCard({ task, columnColor, onDragStart, onEdit, onDelete }) {
  const [hovered, setHovered] = useState(false);
  const progressPct = task.total > 0 ? (task.progress / task.total) * 100 : 0;
  return (
    <div
      draggable
      onDragStart={event => onDragStart(event, task.id)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: APP_THEME.surface,
        borderRadius: 18,
        padding: 14,
        border: `1px solid ${hovered ? columnColor : "#e2e8f0"}`,
        boxShadow: hovered ? "0 16px 34px rgba(15,23,42,0.12)" : "0 6px 18px rgba(15,23,42,0.05)",
        cursor: "grab",
        display: "grid",
        gap: 12,
        transform: hovered ? "translateY(-2px)" : "translateY(0)",
        transition: "all 0.18s ease",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "start" }}>
        <div style={{ display: "grid", gap: 8 }}>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>{task.tags.map(tag => <Tag key={tag} label={tag} />)}</div>
          <div style={{ fontWeight: 900, color: APP_THEME.text, lineHeight: 1.3 }}>{task.title}</div>
        </div>
        <div style={{ display: "flex", gap: 4 }}>
          <button style={miniActionButtonStyle} onClick={() => onEdit(task)} title="Edit">✎</button>
          <button style={miniActionButtonStyle} onClick={() => onDelete(task.id)} title="Delete">🗑</button>
        </div>
      </div>
      <div style={{ color: APP_THEME.muted, fontSize: 13, lineHeight: 1.5 }}>{task.description}</div>
      <div style={{ display: "grid", gap: 6 }}>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: APP_THEME.muted, fontWeight: 700 }}>
          <span>Progress</span>
          <span>{task.progress}/{task.total}</span>
        </div>
        <div style={{ height: 6, borderRadius: 999, background: "#e2e8f0", overflow: "hidden" }}>
          <div style={{ width: `${progressPct}%`, height: "100%", background: columnColor, borderRadius: 999, transition: "width 0.3s ease" }} />
        </div>
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "center" }}>
        <div style={{ display: "flex", marginLeft: 4 }}>
          {task.assignees.map((memberId, index) => {
            const member = MEMBERS.find(item => item.id === memberId) || { id: memberId, name: memberId, color: "#94a3b8" };
            return (
              <div key={memberId} style={{ marginLeft: index === 0 ? 0 : -9 }}>
                <Avatar name={member.name} initials={member.id} color={member.color} size={28} />
              </div>
            );
          })}
        </div>
        <div style={{ display: "flex", gap: 12, fontSize: 12, color: APP_THEME.muted, fontWeight: 700 }}>
          <span>Priority {task.priority}</span>
          {task.dueDate ? <span>Due {task.dueDate}</span> : null}
        </div>
      </div>
    </div>
  );
}

function Column({ column, tasks, onDropTask, onAddTask, onEditTask, onDeleteTask, onDragStart }) {
  const [dragOver, setDragOver] = useState(false);
  return (
    <div
      onDrop={event => { event.preventDefault(); setDragOver(false); onDropTask(column.id); }}
      onDragOver={event => { event.preventDefault(); setDragOver(true); }}
      onDragLeave={() => setDragOver(false)}
      style={{
        minWidth: 280,
        maxWidth: 360,
        flex: "1 1 0",
        background: dragOver ? "#f8fafc" : "#f7fafc",
        borderRadius: 22,
        border: `2px solid ${dragOver ? column.color : "transparent"}`,
        padding: 16,
        transition: "all 0.18s ease",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center", marginBottom: 14 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 10, height: 10, borderRadius: "50%", background: column.color }} />
          <div style={{ fontWeight: 900, color: APP_THEME.text }}>{column.title}</div>
          <div style={{ fontSize: 12, fontWeight: 800, color: column.color, background: `${column.color}20`, padding: "3px 9px", borderRadius: 999 }}>{tasks.length}</div>
        </div>
        <button style={miniColumnButtonStyle} onClick={() => onAddTask(column.id)}>+</button>
      </div>
      <div style={{ display: "grid", gap: 12 }}>
        {tasks.map(task => (
          <TaskCard
            key={task.id}
            task={task}
            columnColor={column.color}
            onDragStart={onDragStart}
            onEdit={onEditTask}
            onDelete={onDeleteTask}
          />
        ))}
        {tasks.length === 0 ? (
          <div style={{ border: "2px dashed #dbe4ef", borderRadius: 16, padding: 24, color: APP_THEME.muted, textAlign: "center", fontSize: 13, background: "#fff" }}>
            Drop tasks here or create a new one.
          </div>
        ) : null}
      </div>
    </div>
  );
}

const miniActionButtonStyle = {
  width: 34,
  height: 34,
  borderRadius: 10,
  border: "none",
  background: "#eef2f7",
  color: APP_THEME.text,
  cursor: "pointer",
};
const miniColumnButtonStyle = {
  width: 30,
  height: 30,
  borderRadius: 10,
  border: "none",
  background: "#e2e8f0",
  color: APP_THEME.text,
  cursor: "pointer",
  fontWeight: 900,
};
const secondaryButtonStyle = {
  border: "1px solid #dbe4ef",
  background: "#fff",
  color: APP_THEME.text,
  borderRadius: 12,
  padding: "11px 16px",
  fontWeight: 800,
  cursor: "pointer",
};
const primaryButtonStyle = {
  border: "none",
  background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
  color: "#fff",
  borderRadius: 12,
  padding: "11px 16px",
  fontWeight: 900,
  cursor: "pointer",
  boxShadow: "0 14px 28px rgba(99,102,241,0.25)",
};

export default function TaskManagerApp() {
  const [state, dispatch] = useTaskWorkspace();
  const [showTaskModal, setShowTaskModal] = useState(null);
  const [showProjectModal, setShowProjectModal] = useState(null);
  const [showActivityLog, setShowActivityLog] = useState(false);
  const [draggingTaskId, setDraggingTaskId] = useState(null);
  const nextAutoSave = useRef(null);
  const activeProject = state.projects.find(project => project.id === state.activeProjectId) || state.projects[0];

  useEffect(() => {
    const timer = setTimeout(() => {
      dispatch({ type: ACTIONS.SET_LOADING, payload: false });
      dispatch({ type: ACTIONS.SET_UI, payload: {} });
    }, 0);
    return () => clearTimeout(timer);
  }, [state.projects.length]);

  useEffect(() => {
    if (!state.notifications.length) return undefined;
    const timer = setTimeout(() => {
      dispatch({ type: ACTIONS.REMOVE_NOTIFICATION, payload: state.notifications[0].id });
    }, 2800);
    return () => clearTimeout(timer);
  }, [state.notifications]);

  useEffect(() => {
    if (nextAutoSave.current) clearTimeout(nextAutoSave.current);
    nextAutoSave.current = setTimeout(() => {
      dispatch({
        type: ACTIONS.ADD_ACTIVITY,
        payload: {
          message: "Auto-save complete",
          detail: `${activeProject?.name || "Workspace"} synced to local storage`,
          timestamp: new Date().toISOString(),
        },
      });
    }, 1200);
    return () => clearTimeout(nextAutoSave.current);
  }, [activeProject?.id, activeProject?.tasks]);

  const filteredTasks = useMemo(() => {
    if (!activeProject) return [];
    const search = state.ui.search.trim().toLowerCase();
    const tagFilter = state.ui.filterTag;
    const tasks = Object.values(activeProject.tasks).filter(task => {
      const matchesSearch = !search || [task.title, task.description, task.tags.join(" "), task.priority].join(" ").toLowerCase().includes(search);
      const matchesTag = tagFilter === "all" || task.tags.includes(tagFilter);
      return matchesSearch && matchesTag;
    });

    const sorters = {
      priority: (a, b) => ["Low", "Medium", "High", "Critical"].indexOf(b.priority) - ["Low", "Medium", "High", "Critical"].indexOf(a.priority),
      progress: (a, b) => (b.progress / Math.max(1, b.total)) - (a.progress / Math.max(1, a.total)),
      date: (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
    };

    return tasks.sort(sorters[state.ui.sortBy] || sorters.priority);
  }, [activeProject, state.ui.filterTag, state.ui.search, state.ui.sortBy]);

  const visibleColumns = useMemo(() => {
    if (!activeProject) return [];
    return Object.values(activeProject.columns).map(column => ({
      ...column,
      tasks: column.tasks.map(id => activeProject.tasks[id]).filter(Boolean),
    }));
  }, [activeProject]);

  const stats = useMemo(() => {
    const tasks = Object.values(activeProject?.tasks || {});
    const total = tasks.length;
    const completed = tasks.filter(task => task.status === "done").length;
    const inFlight = tasks.filter(task => task.status === "progress").length;
    const avgProgress = total ? Math.round(tasks.reduce((sum, task) => sum + (task.progress / Math.max(1, task.total)), 0) / total * 100) : 0;
    return { total, completed, inFlight, avgProgress };
  }, [activeProject]);

  const projects = state.projects.filter(project => state.ui.showArchived ? true : !project.archived);

  function pushActivity(message, detail) {
    dispatch({ type: ACTIONS.ADD_ACTIVITY, payload: { message, detail, timestamp: new Date().toISOString() } });
  }

  function pushNotification(title, message, variant = "info") {
    dispatch({ type: ACTIONS.ADD_NOTIFICATION, payload: { title, message, variant } });
  }

  function createTask(form) {
    const task = makeTask({
      title: form.title.trim(),
      description: form.description.trim(),
      tags: form.tags.split(",").map(item => item.trim()).filter(Boolean),
      assignees: form.assignees.split(",").map(item => item.trim()).filter(Boolean),
      status: form.status,
      progress: clamp(Number(form.progress), 0, Number(form.total)),
      total: clamp(Number(form.total), 1, 20),
      priority: form.priority,
      dueDate: form.dueDate,
    });
    dispatch({ type: ACTIONS.ADD_TASK, payload: { projectId: activeProject.id, task } });
    pushActivity("Task created", `${task.title} added to ${activeProject.name}`);
    pushNotification("Task created", task.title, "success");
    setShowTaskModal(null);
  }

  function updateTask(taskId, form) {
    dispatch({
      type: ACTIONS.UPDATE_TASK,
      payload: {
        projectId: activeProject.id,
        taskId,
        updates: {
          title: form.title.trim(),
          description: form.description.trim(),
          tags: form.tags.split(",").map(item => item.trim()).filter(Boolean),
          assignees: form.assignees.split(",").map(item => item.trim()).filter(Boolean),
          status: form.status,
          progress: clamp(Number(form.progress), 0, Number(form.total)),
          total: clamp(Number(form.total), 1, 20),
          priority: form.priority,
          dueDate: form.dueDate,
        },
      },
    });
    pushActivity("Task updated", form.title.trim());
    pushNotification("Task saved", form.title.trim(), "success");
    setShowTaskModal(null);
  }

  function deleteTask(taskId) {
    const task = activeProject.tasks[taskId];
    if (!task) return;
    dispatch({ type: ACTIONS.DELETE_TASK, payload: { projectId: activeProject.id, taskId } });
    pushActivity("Task deleted", task.title);
    pushNotification("Task deleted", task.title, "danger");
  }

  function moveTask(columnId) {
    if (!draggingTaskId) return;
    dispatch({ type: ACTIONS.MOVE_TASK, payload: { projectId: activeProject.id, taskId: draggingTaskId, toStatus: columnId } });
    pushActivity("Task moved", `${activeProject.tasks[draggingTaskId]?.title || "Task"} -> ${COLUMN_TEMPLATES.find(item => item.id === columnId)?.title || columnId}`);
    pushNotification("Task moved", "The board updated in real time.", "success");
    setDraggingTaskId(null);
  }

  function saveProject(form) {
    if (showProjectModal?.project) {
      dispatch({
        type: ACTIONS.UPDATE_PROJECT,
        payload: {
          id: showProjectModal.project.id,
          updates: {
            name: form.name.trim(),
            description: form.description.trim(),
            client: form.client.trim(),
            color: form.color,
          },
        },
      });
      pushActivity("Project updated", form.name.trim());
      pushNotification("Project saved", form.name.trim(), "success");
    } else {
      const project = createBlankProject({
        name: form.name.trim(),
        description: form.description.trim(),
        client: form.client.trim(),
        color: form.color,
      });
      dispatch({ type: ACTIONS.CREATE_PROJECT, payload: project });
      pushActivity("Project created", `${project.name} is now active`);
      pushNotification("Project created", project.name, "success");
    }
    setShowProjectModal(null);
  }

  function archiveActiveProject() {
    if (!activeProject) return;
    dispatch({ type: ACTIONS.ARCHIVE_PROJECT, payload: activeProject.id });
    pushActivity("Project archived", activeProject.name);
    pushNotification("Project archived", activeProject.name, "info");
  }

  function deleteActiveProject() {
    if (!activeProject) return;
    dispatch({ type: ACTIONS.DELETE_PROJECT, payload: activeProject.id });
    pushActivity("Project deleted", activeProject.name);
    pushNotification("Project deleted", activeProject.name, "danger");
  }

  const tagOptions = useMemo(() => {
    const tags = new Set(["all"]);
    Object.values(activeProject?.tasks || {}).forEach(task => task.tags.forEach(tag => tags.add(tag)));
    return Array.from(tags);
  }, [activeProject]);

  return (
    <div style={{ minHeight: "100vh", display: "flex", background: APP_THEME.background, color: APP_THEME.text, overflow: "hidden" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700;800;900&display=swap');
        * { box-sizing: border-box; }
        html, body, #root { min-height: 100%; }
        body { margin: 0; font-family: 'DM Sans', system-ui, sans-serif; background: ${APP_THEME.background}; }
        button, input, select, textarea { font: inherit; }
        ::-webkit-scrollbar { width: 8px; height: 8px; }
        ::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 999px; }
        ::-webkit-scrollbar-track { background: transparent; }
      `}</style>

      <aside style={{ width: 304, minWidth: 304, background: "#fff", borderRight: "1px solid #e2e8f0", display: "flex", flexDirection: "column" }}>
        <div style={{ padding: 20, borderBottom: "1px solid #e2e8f0", display: "grid", gap: 14 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div
              style={{
                width: 50,
                height: 50,
                borderRadius: 15,
                background: "linear-gradient(145deg, #0f172a, #1e293b)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 10px 22px rgba(15,23,42,0.22)",
              }}
              aria-hidden="true"
            >
              <div
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: 10,
                  background: "#ffffff",
                  border: "2px solid #B2E4BA",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "inset 0 -1px 0 rgba(15,23,42,0.08)",
                }}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" role="img" aria-label="TaskManager logo">
                  <path d="M4.7 12.6l4.4 4.4L19.3 7.7" stroke="#0f172a" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            </div>
            <div>
              <div style={{ fontWeight: 900, fontSize: 16 }}>TaskManager</div>
              <div style={{ color: APP_THEME.muted, fontSize: 12 }}>Projects, tasks, activity, and autosave.</div>
            </div>
          </div>
          <button style={primaryButtonStyle} onClick={() => setShowProjectModal({ project: null })}>+ New Project</button>
        </div>

        <div style={{ padding: 14, display: "grid", gap: 12, overflow: "auto" }}>
          <div style={{ display: "grid", gap: 8 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ color: APP_THEME.muted, fontSize: 12, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.06em" }}>Projects</div>
              <button style={iconButtonStyle} onClick={() => dispatch({ type: ACTIONS.SET_UI, payload: { showArchived: !state.ui.showArchived } })}>⟳</button>
            </div>
            <div style={{ display: "grid", gap: 8 }}>
              {projects.map(project => {
                const isActive = project.id === activeProject?.id;
                const count = Object.values(project.tasks).length;
                return (
                  <button
                    key={project.id}
                    onClick={() => dispatch({ type: ACTIONS.SET_ACTIVE_PROJECT, payload: project.id })}
                    style={{
                      textAlign: "left",
                      border: isActive ? `2px solid ${project.color}` : "1px solid #e2e8f0",
                      background: isActive ? `${project.color}14` : "#fff",
                      borderRadius: 14,
                      padding: 12,
                      cursor: "pointer",
                      display: "grid",
                      gap: 8,
                      boxShadow: isActive ? "0 16px 30px rgba(15,23,42,0.08)" : "none",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "start" }}>
                      <div>
                        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                          <div style={{ width: 10, height: 10, borderRadius: "50%", background: project.color }} />
                          <div style={{ fontWeight: 900, color: APP_THEME.text }}>{project.name}</div>
                        </div>
                        <div style={{ color: APP_THEME.muted, fontSize: 12, marginTop: 4 }}>{project.client}</div>
                      </div>
                      <div style={{ fontSize: 11, fontWeight: 900, color: APP_THEME.muted }}>{count} tasks</div>
                    </div>
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                      <span style={{ fontSize: 11, fontWeight: 800, color: project.archived ? "#b45309" : "#166534", background: project.archived ? "#fef3c7" : "#dcfce7", padding: "3px 8px", borderRadius: 999 }}>{project.archived ? "Archived" : "Active"}</span>
                      <span style={{ fontSize: 11, fontWeight: 800, color: project.color, background: `${project.color}14`, padding: "3px 8px", borderRadius: 999 }}>{project.status}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div style={{ background: "#f8fafc", borderRadius: 16, padding: 14, border: "1px solid #e2e8f0", display: "grid", gap: 8 }}>
            <div style={{ fontWeight: 900 }}>Workspace summary</div>
            <div style={{ display: "grid", gap: 8, fontSize: 13, color: APP_THEME.muted }}>
              <div>{state.projects.length} projects</div>
              <div>{state.projects.filter(project => !project.archived).length} active</div>
              <div>{state.projects.filter(project => project.archived).length} archived</div>
              <div>Demo resets on refresh</div>
            </div>
          </div>

          <div style={{ display: "grid", gap: 8 }}>
            <button style={secondaryButtonStyle} onClick={() => setShowActivityLog(true)}>View activity</button>
            <button style={secondaryButtonStyle} onClick={archiveActiveProject} disabled={!activeProject}>Archive project</button>
            <button style={{ ...secondaryButtonStyle, color: "#b91c1c" }} onClick={deleteActiveProject} disabled={!activeProject}>Delete project</button>
          </div>
        </div>
      </aside>

      <main style={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <header style={{ padding: "18px 24px", background: APP_THEME.surface, borderBottom: "1px solid #e2e8f0", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 20 }}>
          <div style={{ display: "grid", gap: 8 }}>
            <div style={{ color: APP_THEME.muted, fontSize: 13 }}>
              {activeProject ? `${activeProject.client} / ${activeProject.name}` : "No project selected"}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div>
                <h1 style={{ margin: 0, fontSize: 24 }}>{activeProject?.name || "TaskManager"}</h1>
                <div style={{ color: APP_THEME.muted, fontSize: 13, marginTop: 4 }}>{activeProject?.description || "Create projects, manage tasks, and keep work moving."}</div>
              </div>
            </div>
          </div>

          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "end" }}>
            <button style={secondaryButtonStyle} onClick={() => setShowProjectModal({ project: activeProject })} disabled={!activeProject}>Edit project</button>
              <button style={secondaryButtonStyle} onClick={() => setShowTaskModal({ task: null, initialStatus: "todo" })} disabled={!activeProject}>+ Task</button>
          </div>
        </header>

        <section style={{ flex: 1, minHeight: 0, padding: 24, overflow: "auto", display: "grid", gap: 20 }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: 16 }}>
            <StatCard label="Tasks" value={stats.total} detail="Current project" accent={activeProject?.color} />
            <StatCard label="Completed" value={stats.completed} detail="Done column" accent="#16a34a" />
            <StatCard label="In flight" value={stats.inFlight} detail="Work in progress" accent="#2563eb" />
            <StatCard label="Avg progress" value={`${stats.avgProgress}%`} detail="Across all tasks" accent="#7c3aed" />
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center", flex: "1 1 480px" }}>
              <div style={{ background: "#fff", border: "1px solid #dbe4ef", borderRadius: 12, padding: "8px 10px", minWidth: 220, flex: "1 1 260px" }}>
                <input
                  value={state.ui.search}
                  onChange={e => dispatch({ type: ACTIONS.SET_UI, payload: { search: e.target.value } })}
                  placeholder="Search tasks, tags, or assignees"
                  style={{ width: "100%", border: "none", outline: "none", background: "transparent", fontSize: 14 }}
                />
              </div>
              <select
                value={state.ui.sortBy}
                onChange={e => dispatch({ type: ACTIONS.SET_UI, payload: { sortBy: e.target.value } })}
                style={{ ...inputStyle, width: "auto", minWidth: 170, flex: "0 1 190px", padding: "8px 10px", borderRadius: 12 }}
              >
                <option value="priority">Sort by priority</option>
                <option value="progress">Sort by progress</option>
                <option value="date">Sort by date</option>
              </select>
              <select
                value={state.ui.filterTag}
                onChange={e => dispatch({ type: ACTIONS.SET_UI, payload: { filterTag: e.target.value } })}
                style={{ ...inputStyle, width: "auto", minWidth: 140, flex: "0 1 170px", padding: "8px 10px", borderRadius: 12 }}
              >
                {tagOptions.map(tag => <option key={tag} value={tag}>{tag === "all" ? "All tags" : tag}</option>)}
              </select>
            </div>
            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
              <button style={secondaryButtonStyle} onClick={() => dispatch({ type: ACTIONS.SET_UI, payload: { showArchived: !state.ui.showArchived } })}>
                {state.ui.showArchived ? "Hide archived" : "Show archived"}
              </button>
              <button style={secondaryButtonStyle} onClick={() => setShowActivityLog(true)}>Activity</button>
            </div>
          </div>

          <div style={{ display: "flex", gap: 16, alignItems: "start", overflowX: "auto", paddingBottom: 12, WebkitOverflowScrolling: "touch" }}>
            {visibleColumns.map(column => (
              <Column
                key={column.id}
                column={column}
                tasks={filteredTasks.filter(task => task.status === column.id)}
                onDropTask={moveTask}
                onAddTask={() => setShowTaskModal({ task: null, status: column.id })}
                onEditTask={task => setShowTaskModal({ task })}
                onDeleteTask={deleteTask}
                onDragStart={(_, taskId) => setDraggingTaskId(taskId)}
              />
            ))}
          </div>
        </section>
      </main>

      {showProjectModal ? (
        <ProjectFormModal
          project={showProjectModal.project}
          onClose={() => setShowProjectModal(null)}
          onSave={saveProject}
        />
      ) : null}

      {showTaskModal && activeProject ? (
        <TaskFormModal
          project={activeProject}
          task={showTaskModal.task}
          initialStatus={showTaskModal.initialStatus || "todo"}
          onClose={() => setShowTaskModal(null)}
          onSave={form => showTaskModal.task ? updateTask(showTaskModal.task.id, form) : createTask(form)}
        />
      ) : null}

      {showActivityLog ? <ActivityLog items={state.activityLog} onClose={() => setShowActivityLog(false)} /> : null}
      <NotificationStack notifications={state.notifications} onDismiss={id => dispatch({ type: ACTIONS.REMOVE_NOTIFICATION, payload: id })} />
    </div>
  );
}
