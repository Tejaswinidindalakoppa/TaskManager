import { useState, useRef, useEffect, useCallback, useMemo, useReducer } from "react";

// ============================================
// REAL-TIME TASK MANAGEMENT SYSTEM
// ============================================

const INITIAL_DATA = {
  columns: {
    todo: { id: "todo", title: "To Do", color: "#ef4444", dotColor: "#ef4444", tasks: ["t1", "t2", "t3"] },
    inprogress: { id: "inprogress", title: "In Progress", color: "#3b82f6", dotColor: "#3b82f6", tasks: ["t4", "t5", "t6"] },
    review: { id: "review", title: "Review", color: "#f59e0b", dotColor: "#f59e0b", tasks: ["t7", "t8", "t9"] },
    complete: { id: "complete", title: "Complete", color: "#22c55e", dotColor: "#22c55e", tasks: ["t10", "t11"] },
  },
  tasks: {
    t1: { id: "t1", title: "Homepage UI Design Draft", desc: "Building the first version of homepage layout focusing on usability and flow.", tags: ["Design UI/UX", "Frontend"], progress: 0, total: 4, files: 3, comments: 1, assignees: ["MA", "SC"] },
    t2: { id: "t2", title: "Product Detail Wireframe", desc: "Wireframing the product detail page with focus on images and description.", tags: ["UX", "Research"], progress: 0, total: 4, files: 2, comments: 3, assignees: ["DJ", "JW"] },
    t3: { id: "t3", title: "Shopping Cart Structure", desc: "Planning the shopping cart page to ensure user-friendly checkout flow.", tags: ["Backend", "API"], progress: 0, total: 4, files: 3, comments: 5, assignees: ["MA", "SC"] },
    t4: { id: "t4", title: "User Registration Flow", desc: "Building user account creation system with secure authentication.", tags: ["Frontend", "Auth"], progress: 1, total: 4, files: 3, comments: 8, assignees: ["DJ", "MA"] },
    t5: { id: "t5", title: "Product Catalog Layout", desc: "Creating responsive product grid for better shopping experience.", tags: ["Design UI/UX", "Frontend"], progress: 2, total: 4, files: 3, comments: 11, assignees: ["SC", "JW"] },
    t6: { id: "t6", title: "Payment Gateway Setup", desc: "Integrating payment gateway API to support multiple methods.", tags: ["Backend", "API"], progress: 3, total: 4, files: 2, comments: 9, assignees: ["MA", "DJ"] },
    t7: { id: "t7", title: "Homepage Responsive Check", desc: "Testing homepage layout across devices to ensure responsiveness.", tags: ["QA", "Frontend"], progress: 2, total: 4, files: 2, comments: 18, assignees: ["SC", "MA"] },
    t8: { id: "t8", title: "Product Image Optimization", desc: "Checking optimized images for clarity and performance balance.", tags: ["Media", "Performance"], progress: 3, total: 4, files: 3, comments: 16, assignees: ["JW", "SC"] },
    t9: { id: "t9", title: "Checkout Flow Testing", desc: "Reviewing checkout process to ensure smooth user experience.", tags: ["QA", "Backend"], progress: 3, total: 4, files: 2, comments: 5, assignees: ["MA", "DJ"] },
    t10: { id: "t10", title: "Login Page Interface", desc: "Finished building login interface including input validation.", tags: ["Design UI/UX", "Frontend"], progress: 4, total: 4, files: 1, comments: 8, assignees: ["MA", "SC"] },
    t11: { id: "t11", title: "Database Schema Setup", desc: "Delivered database setup with tables for users, orders, and items.", tags: ["Backend", "Database"], progress: 4, total: 4, files: 3, comments: 19, assignees: ["DJ", "MA"] },
  },
};

// ============================================
// STATE MANAGEMENT & ACTIONS
// ============================================

// Action types for reducer
const ACTIONS = {
  SET_DATA: "SET_DATA",
  ADD_TASK: "ADD_TASK",
  UPDATE_TASK: "UPDATE_TASK",
  DELETE_TASK: "DELETE_TASK",
  MOVE_TASK: "MOVE_TASK",
  UNDO: "UNDO",
  REDO: "REDO",
  SET_LOADING: "SET_LOADING",
  ADD_NOTIFICATION: "ADD_NOTIFICATION",
  REMOVE_NOTIFICATION: "REMOVE_NOTIFICATION",
  BULK_DELETE: "BULK_DELETE",
};

// Enhanced reducer for state management
function appReducer(state, action) {
  switch (action.type) {
    case ACTIONS.SET_DATA:
      return { ...state, data: action.payload, history: [...state.history, state.data], historyIndex: state.history.length };
    case ACTIONS.ADD_TASK: {
      const newTasks = { ...state.data.tasks, [action.payload.id]: action.payload };
      const newCols = { ...state.data.columns };
      newCols[action.payload.columnId] = {
        ...newCols[action.payload.columnId],
        tasks: [...newCols[action.payload.columnId].tasks, action.payload.id]
      };
      return {
        ...state,
        data: { ...state.data, tasks: newTasks, columns: newCols },
        history: [...state.history.slice(0, state.historyIndex + 1), { ...state.data, tasks: newTasks, columns: newCols }],
        historyIndex: state.history.length
      };
    }
    case ACTIONS.UPDATE_TASK: {
      const updatedTask = { ...state.data.tasks[action.payload.id], ...action.payload };
      return {
        ...state,
        data: { ...state.data, tasks: { ...state.data.tasks, [action.payload.id]: updatedTask } },
        history: [...state.history.slice(0, state.historyIndex + 1), { ...state.data, tasks: { ...state.data.tasks, [action.payload.id]: updatedTask } }],
        historyIndex: state.history.length
      };
    }
    case ACTIONS.DELETE_TASK: {
      const newTasks = { ...state.data.tasks };
      delete newTasks[action.payload];
      const newCols = {};
      Object.keys(state.data.columns).forEach(k => {
        newCols[k] = { ...state.data.columns[k], tasks: state.data.columns[k].tasks.filter(id => id !== action.payload) };
      });
      return {
        ...state,
        data: { ...state.data, tasks: newTasks, columns: newCols },
        history: [...state.history.slice(0, state.historyIndex + 1), { ...state.data, tasks: newTasks, columns: newCols }],
        historyIndex: state.history.length
      };
    }
    case ACTIONS.MOVE_TASK: {
      const newCols = { ...state.data.columns };
      Object.keys(newCols).forEach(k => {
        newCols[k] = { ...newCols[k], tasks: newCols[k].tasks.filter(id => id !== action.payload.taskId) };
      });
      newCols[action.payload.toColId] = {
        ...newCols[action.payload.toColId],
        tasks: [...newCols[action.payload.toColId].tasks, action.payload.taskId]
      };
      return {
        ...state,
        data: { ...state.data, columns: newCols },
        history: [...state.history.slice(0, state.historyIndex + 1), { ...state.data, columns: newCols }],
        historyIndex: state.history.length
      };
    }
    case ACTIONS.UNDO:
      return state.historyIndex > 0 ? { ...state, historyIndex: state.historyIndex - 1, data: state.history[state.historyIndex - 1] } : state;
    case ACTIONS.REDO:
      return state.historyIndex < state.history.length - 1 ? { ...state, historyIndex: state.historyIndex + 1, data: state.history[state.historyIndex + 1] } : state;
    case ACTIONS.ADD_NOTIFICATION:
      return { ...state, notifications: [...state.notifications, { id: Date.now(), ...action.payload }] };
    case ACTIONS.REMOVE_NOTIFICATION:
      return { ...state, notifications: state.notifications.filter(n => n.id !== action.payload) };
    case ACTIONS.SET_LOADING:
      return { ...state, loading: action.payload };
    default:
      return state;
  }
}

const TAG_COLORS = {
  "Design UI/UX": { bg: "#fce7f3", color: "#be185d" },
  "Frontend": { bg: "#ede9fe", color: "#7c3aed" },
  "Auth": { bg: "#dbeafe", color: "#1d4ed8" },
  "UX": { bg: "#fef9c3", color: "#a16207" },
  "Research": { bg: "#dcfce7", color: "#15803d" },
  "Backend": { bg: "#f0fdf4", color: "#166534" },
  "API": { bg: "#e0f2fe", color: "#0369a1" },
  "QA": { bg: "#fef3c7", color: "#b45309" },
  "Media": { bg: "#fae8ff", color: "#9333ea" },
  "Performance": { bg: "#fee2e2", color: "#dc2626" },
  "Database": { bg: "#ecfdf5", color: "#065f46" },
};

const MEMBERS = [
  { id: "MA", name: "Michael Anderson", role: "UI/UX Designer", color: "#f97316", initials: "MA" },
  { id: "SC", name: "Sophia Carter", role: "Graphic Designer", color: "#ec4899", initials: "SC" },
  { id: "DJ", name: "Daniel Johnson", role: "Frontend Developer", color: "#8b5cf6", initials: "DJ" },
  { id: "JW", name: "James Wilson", role: "Backend Programmer", color: "#06b6d4", initials: "JW" },
];

function Avatar({ initials, color, size = 28 }) {
  const m = MEMBERS.find(m => m.id === initials);
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%",
      background: m?.color || color || "#6366f1",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: size * 0.35, fontWeight: 700, color: "#fff",
      border: "2px solid #fff", flexShrink: 0,
      fontFamily: "'DM Sans', sans-serif",
      boxShadow: "0 1px 3px rgba(0,0,0,0.15)"
    }}>{initials}</div>
  );
}

function Tag({ label }) {
  const style = TAG_COLORS[label] || { bg: "#f1f5f9", color: "#475569" };
  return (
    <span style={{
      background: style.bg, color: style.color,
      padding: "2px 10px", borderRadius: 20, fontSize: 11,
      fontWeight: 600, whiteSpace: "nowrap", letterSpacing: "0.01em"
    }}>{label}</span>
  );
}

function ProgressBar({ value, total, color }) {
  const pct = total > 0 ? (value / total) * 100 : 0;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <div style={{ flex: 1, background: "#e2e8f0", borderRadius: 99, height: 5, overflow: "hidden" }}>
        <div style={{
          width: `${pct}%`, height: "100%",
          background: color || "#6366f1",
          borderRadius: 99, transition: "width 0.4s ease"
        }} />
      </div>
      <span style={{ fontSize: 11, color: "#94a3b8", fontWeight: 600, minWidth: 28, textAlign: "right" }}>
        {value}/{total}
      </span>
    </div>
  );
}

function TaskCard({ task, columnColor, onDragStart, onEdit, onDelete }) {
  const [hover, setHover] = useState(false);
  return (
    <div
      draggable
      onDragStart={e => onDragStart(e, task.id)}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        background: "#fff",
        borderRadius: 14,
        padding: "14px 16px",
        marginBottom: 10,
        boxShadow: hover ? "0 8px 24px rgba(0,0,0,0.10)" : "0 2px 8px rgba(0,0,0,0.05)",
        border: "1px solid",
        borderColor: hover ? "#c7d2fe" : "#f1f5f9",
        cursor: "grab",
        transition: "all 0.18s ease",
        transform: hover ? "translateY(-2px)" : "none",
        position: "relative"
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
        <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
          {task.tags.map(t => <Tag key={t} label={t} />)}
        </div>
        <div style={{ display: "flex", gap: 4 }}>
          <button onClick={() => onEdit(task)} style={{ background: "none", border: "none", cursor: "pointer", color: "#94a3b8", fontSize: 14, padding: "2px 4px", borderRadius: 6, lineHeight: 1 }}
            onMouseEnter={e => e.currentTarget.style.color = "#6366f1"}
            onMouseLeave={e => e.currentTarget.style.color = "#94a3b8"}
          >✎</button>
          <button onClick={() => onDelete(task.id)} style={{ background: "none", border: "none", cursor: "pointer", color: "#94a3b8", fontSize: 16, padding: "2px 4px", borderRadius: 6, lineHeight: 1 }}
            onMouseEnter={e => e.currentTarget.style.color = "#ef4444"}
            onMouseLeave={e => e.currentTarget.style.color = "#94a3b8"}
          >⋯</button>
        </div>
      </div>
      <div style={{ fontWeight: 700, fontSize: 14, color: "#0f172a", marginBottom: 5, lineHeight: 1.4 }}>{task.title}</div>
      <div style={{ fontSize: 12, color: "#64748b", lineHeight: 1.55, marginBottom: 12 }}>{task.desc}</div>
      <div style={{ marginBottom: 12 }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
          <span style={{ fontSize: 11, fontWeight: 600, color: "#64748b" }}>Progress</span>
        </div>
        <ProgressBar value={task.progress} total={task.total} color={columnColor} />
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex" }}>
          {task.assignees.map((a, i) => (
            <div key={a} style={{ marginLeft: i === 0 ? 0 : -8 }}>
              <Avatar initials={a} size={26} />
            </div>
          ))}
        </div>
        <div style={{ display: "flex", gap: 12, color: "#94a3b8", fontSize: 12 }}>
          <span>📁 {task.files}</span>
          <span>💬 {task.comments}</span>
        </div>
      </div>
    </div>
  );
}

function Column({ col, tasks, onDragStart, onDrop, onDragOver, onAddTask, onEdit, onDelete }) {
  const [dragOver, setDragOver] = useState(false);
  return (
    <div
      onDrop={e => { setDragOver(false); onDrop(e, col.id); }}
      onDragOver={e => { e.preventDefault(); setDragOver(true); }}
      onDragLeave={() => setDragOver(false)}
      style={{
        flex: "1 1 0", minWidth: 260, maxWidth: 320,
        background: dragOver ? "#f0f9ff" : "#f8fafc",
        borderRadius: 18,
        padding: "16px 14px",
        border: "2px solid",
        borderColor: dragOver ? col.color : "transparent",
        transition: "all 0.18s ease"
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 10, height: 10, borderRadius: "50%", background: col.dotColor }} />
          <span style={{ fontWeight: 700, fontSize: 14, color: "#0f172a" }}>{col.title}</span>
          <span style={{
            background: col.color + "20", color: col.color,
            borderRadius: 20, padding: "1px 8px", fontSize: 12, fontWeight: 700
          }}>{tasks.length}</span>
        </div>
        <button
          onClick={() => onAddTask(col.id)}
          style={{
            width: 26, height: 26, borderRadius: 8, border: "none",
            background: "#e2e8f0", color: "#64748b",
            cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 18, lineHeight: 1, transition: "all 0.15s"
          }}
          onMouseEnter={e => { e.currentTarget.style.background = col.color; e.currentTarget.style.color = "#fff"; }}
          onMouseLeave={e => { e.currentTarget.style.background = "#e2e8f0"; e.currentTarget.style.color = "#64748b"; }}
        >+</button>
      </div>
      <div>
        {tasks.map(task => (
          <TaskCard
            key={task.id}
            task={task}
            columnColor={col.color}
            onDragStart={onDragStart}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))}
        {tasks.length === 0 && (
          <div style={{
            border: "2px dashed #e2e8f0", borderRadius: 12,
            padding: "24px", textAlign: "center", color: "#cbd5e1",
            fontSize: 13
          }}>Drop tasks here</div>
        )}
      </div>
    </div>
  );
}

function Modal({ task, columns, onClose, onSave }) {
  const isNew = !task.id;
  const [form, setForm] = useState({
    title: task.title || "",
    desc: task.desc || "",
    tags: task.tags || [],
    progress: task.progress ?? 0,
    total: task.total || 4,
    files: task.files || 0,
    comments: task.comments || 0,
    assignees: task.assignees || [],
    columnId: task.columnId || "todo",
  });
  const [tagInput, setTagInput] = useState("");

  function toggleAssignee(id) {
    setForm(f => ({
      ...f,
      assignees: f.assignees.includes(id)
        ? f.assignees.filter(a => a !== id)
        : [...f.assignees, id]
    }));
  }

  function addTag() {
    if (tagInput.trim() && !form.tags.includes(tagInput.trim())) {
      setForm(f => ({ ...f, tags: [...f.tags, tagInput.trim()] }));
      setTagInput("");
    }
  }

  function removeTag(t) {
    setForm(f => ({ ...f, tags: f.tags.filter(x => x !== t) }));
  }

  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(15,23,42,0.5)",
      display: "flex", alignItems: "center", justifyContent: "center",
      zIndex: 1000, backdropFilter: "blur(4px)"
    }} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{
        background: "#fff", borderRadius: 20, padding: "28px 32px",
        width: 480, maxWidth: "95vw", maxHeight: "90vh", overflowY: "auto",
        boxShadow: "0 24px 64px rgba(0,0,0,0.18)"
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <h2 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: "#0f172a" }}>
            {isNew ? "New Task" : "Edit Task"}
          </h2>
          <button onClick={onClose} style={{ background: "none", border: "none", fontSize: 22, cursor: "pointer", color: "#94a3b8" }}>×</button>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div>
            <label style={labelStyle}>Title</label>
            <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              placeholder="Task title..." style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>Description</label>
            <textarea value={form.desc} onChange={e => setForm(f => ({ ...f, desc: e.target.value }))}
              placeholder="Brief description..." rows={3}
              style={{ ...inputStyle, resize: "vertical", height: "auto" }} />
          </div>
          <div>
            <label style={labelStyle}>Column</label>
            <select value={form.columnId} onChange={e => setForm(f => ({ ...f, columnId: e.target.value }))}
              style={inputStyle}>
              {Object.values(columns).map(c => (
                <option key={c.id} value={c.id}>{c.title}</option>
              ))}
            </select>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <label style={labelStyle}>Progress</label>
              <input type="number" min={0} max={form.total} value={form.progress}
                onChange={e => setForm(f => ({ ...f, progress: +e.target.value }))}
                style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Total Steps</label>
              <input type="number" min={1} max={10} value={form.total}
                onChange={e => setForm(f => ({ ...f, total: +e.target.value }))}
                style={inputStyle} />
            </div>
          </div>
          <div>
            <label style={labelStyle}>Tags</label>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 8 }}>
              {form.tags.map(t => (
                <span key={t} style={{ ...tagChipStyle, cursor: "pointer" }} onClick={() => removeTag(t)}>
                  {t} <span style={{ marginLeft: 4, opacity: 0.6 }}>×</span>
                </span>
              ))}
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <input value={tagInput} onChange={e => setTagInput(e.target.value)}
                onKeyDown={e => e.key === "Enter" && addTag()}
                placeholder="Add tag + Enter" style={{ ...inputStyle, flex: 1, marginBottom: 0 }} />
              <button onClick={addTag} style={btnSecStyle}>Add</button>
            </div>
          </div>
          <div>
            <label style={labelStyle}>Assignees</label>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              {MEMBERS.map(m => (
                <div key={m.id}
                  onClick={() => toggleAssignee(m.id)}
                  style={{
                    display: "flex", alignItems: "center", gap: 8,
                    padding: "6px 12px", borderRadius: 10, cursor: "pointer",
                    border: "2px solid",
                    borderColor: form.assignees.includes(m.id) ? m.color : "#e2e8f0",
                    background: form.assignees.includes(m.id) ? m.color + "15" : "#fff",
                    transition: "all 0.15s"
                  }}>
                  <Avatar initials={m.id} size={24} />
                  <span style={{ fontSize: 12, fontWeight: 600, color: "#334155" }}>{m.name.split(" ")[0]}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 10, marginTop: 24 }}>
          <button onClick={onClose} style={btnSecStyle}>Cancel</button>
          <button
            onClick={() => onSave(form)}
            disabled={!form.title.trim()}
            style={{
              flex: 1, background: form.title.trim() ? "linear-gradient(135deg, #6366f1, #8b5cf6)" : "#e2e8f0",
              color: form.title.trim() ? "#fff" : "#94a3b8",
              border: "none", borderRadius: 10, padding: "11px 0",
              fontWeight: 700, fontSize: 14, cursor: form.title.trim() ? "pointer" : "not-allowed",
              transition: "all 0.2s"
            }}
          >{isNew ? "Create Task" : "Save Changes"}</button>
        </div>
      </div>
    </div>
  );
}

const labelStyle = { display: "block", fontSize: 12, fontWeight: 700, color: "#475569", marginBottom: 6 };
const inputStyle = {
  width: "100%", padding: "9px 12px", borderRadius: 9, border: "1.5px solid #e2e8f0",
  fontSize: 13, color: "#0f172a", outline: "none", background: "#f8fafc",
  boxSizing: "border-box", fontFamily: "inherit", transition: "border-color 0.15s",
  marginBottom: 0
};
const tagChipStyle = {
  background: "#ede9fe", color: "#7c3aed", padding: "3px 10px",
  borderRadius: 20, fontSize: 11, fontWeight: 600
};
const btnSecStyle = {
  background: "#f1f5f9", color: "#475569", border: "none", borderRadius: 10,
  padding: "11px 16px", fontWeight: 600, fontSize: 13, cursor: "pointer"
};

// ============================================
// TOAST NOTIFICATION COMPONENT (Real-time)
// ============================================
function Toast({ notifications, onRemove }) {
  return (
    <div style={{ position: "fixed", bottom: 20, right: 20, zIndex: 5000, display: "flex", flexDirection: "column", gap: 10 }}>
      {notifications.map(notif => (
        <div key={notif.id} style={{
          background: notif.type === "success" ? "#B2E4BA" : notif.type === "error" ? "#fecaca" : "#bfdbfe",
          color: notif.type === "success" ? "#065f46" : notif.type === "error" ? "#7f1d1d" : "#1e40af",
          padding: "12px 16px", borderRadius: 10, boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
          display: "flex", justifyContent: "space-between", alignItems: "center", minWidth: 280,
          animation: "slideIn 0.3s ease-out"
        }}>
          <span style={{ fontSize: 13, fontWeight: 600 }}>{notif.message}</span>
          <button onClick={() => onRemove(notif.id)} style={{ background: "none", border: "none", color: "inherit", cursor: "pointer", fontSize: 16 }}>×</button>
        </div>
      ))}
    </div>
  );
}

// ============================================
// KEYBOARD SHORTCUTS HOOK
// ============================================
function useKeyboardShortcuts(handlers) {
  useEffect(() => {
    function handleKeyDown(e) {
      const key = `${e.ctrlKey || e.metaKey ? "Cmd+" : ""}${e.shiftKey ? "Shift+" : ""}${e.key.toUpperCase()}`;
      if (handlers[key]) {
        e.preventDefault();
        handlers[key]();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handlers]);
}

// ============================================
// ACTIVITY LOG COMPONENT
// ============================================
function ActivityLog({ activities, isOpen, onClose }) {
  if (!isOpen) return null;
  
  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(15,23,42,0.5)",
      display: "flex", alignItems: "center", justifyContent: "center",
      zIndex: 1001, backdropFilter: "blur(4px)"
    }} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{
        background: "#fff", borderRadius: 20, padding: "28px 32px",
        width: 500, maxWidth: "95vw", maxHeight: "80vh", overflowY: "auto",
        boxShadow: "0 24px 64px rgba(0,0,0,0.18)"
      }}>
        <h2 style={{ margin: "0 0 20px 0", fontSize: 20, fontWeight: 800, color: "#0f172a" }}>Activity Log</h2>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {activities.length === 0 ? (
            <p style={{ color: "#94a3b8", fontSize: 13 }}>No recent activities</p>
          ) : (
            activities.slice().reverse().map((act, i) => (
              <div key={i} style={{ padding: "12px", background: "#f8fafc", borderRadius: 10, borderLeft: "3px solid #6366f1" }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: "#0f172a" }}>{act.action}</div>
                <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 4 }}>{new Date(act.timestamp).toLocaleString()}</div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const initialState = {
    data: INITIAL_DATA,
    history: [INITIAL_DATA],
    historyIndex: 0,
    notifications: [],
    loading: false,
  };

  const [state, dispatch] = useReducer(appReducer, initialState);
  const [dragging, setDragging] = useState(null);
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState(null);
  const [activeView, setActiveView] = useState("Kanban");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showActivityLog, setShowActivityLog] = useState(false);
  const [activities, setActivities] = useState([]);
  const [sortBy, setSortBy] = useState("none");
  const [filterTags, setFilterTags] = useState([]);
  const [selectedTasks, setSelectedTasks] = useState(new Set());
  const nextId = useRef(20);
  
  // Auto-dismiss notifications
  useEffect(() => {
    if (state.notifications.length > 0) {
      const timer = setTimeout(() => {
        dispatch({ type: ACTIONS.REMOVE_NOTIFICATION, payload: state.notifications[0].id });
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [state.notifications]);

  // Optimized callback for drag start
  const handleDragStart = useCallback((e, taskId) => {
    setDragging(taskId);
    e.dataTransfer.effectAllowed = "move";
  }, []);

  // Optimized callback for drop with real-time update
  const handleDrop = useCallback((e, colId) => {
    e.preventDefault();
    if (!dragging) return;

    dispatch({ type: ACTIONS.MOVE_TASK, payload: { taskId: dragging, toColId: colId } });
    setActivities(prev => [...prev, {
      action: `Task moved to ${state.data.columns[colId]?.title || colId}`,
      timestamp: new Date().toISOString()
    }]);
    dispatch({
      type: ACTIONS.ADD_NOTIFICATION,
      payload: { message: "✓ Task moved successfully", type: "success" }
    });
    setDragging(null);
  }, [dragging, state.data.columns]);

  // Add new task
  const openNewTask = useCallback((columnId) => {
    setModal({ isNew: true, task: { columnId } });
  }, []);

  // Edit task
  const openEdit = useCallback((task) => {
    const columnId = Object.keys(state.data.columns).find(k => 
      state.data.columns[k].tasks.includes(task.id)
    );
    setModal({ isNew: false, task: { ...task, columnId } });
  }, [state.data.columns]);

  // Delete task with real-time notification
  const handleDelete = useCallback((taskId) => {
    const taskName = state.data.tasks[taskId]?.title || "Task";
    dispatch({ type: ACTIONS.DELETE_TASK, payload: taskId });
    setActivities(prev => [...prev, {
      action: `Task "${taskName}" deleted`,
      timestamp: new Date().toISOString()
    }]);
    dispatch({
      type: ACTIONS.ADD_NOTIFICATION,
      payload: { message: `✓ "${taskName}" deleted`, type: "success" }
    });
  }, [state.data.tasks]);

  // Save task (create or update)
  const handleSave = useCallback((form) => {
    if (modal.isNew) {
      const id = `t${nextId.current++}`;
      const newTask = {
        id, title: form.title, desc: form.desc,
        tags: form.tags, progress: form.progress,
        total: form.total, files: form.files,
        comments: form.comments, assignees: form.assignees,
        createdAt: new Date().toISOString(),
        columnId: form.columnId
      };
      dispatch({ type: ACTIONS.ADD_TASK, payload: newTask });
      setActivities(prev => [...prev, {
        action: `New task "${form.title}" created`,
        timestamp: new Date().toISOString()
      }]);
      dispatch({
        type: ACTIONS.ADD_NOTIFICATION,
        payload: { message: `✓ Task "${form.title}" created`, type: "success" }
      });
    } else {
      const oldColId = Object.keys(state.data.columns).find(k => 
        state.data.columns[k].tasks.includes(modal.task.id)
      );
      if (oldColId !== form.columnId) {
        dispatch({ type: ACTIONS.MOVE_TASK, payload: { taskId: modal.task.id, toColId: form.columnId } });
      }
      dispatch({
        type: ACTIONS.UPDATE_TASK,
        payload: { id: modal.task.id, ...form, columnId: form.columnId }
      });
      setActivities(prev => [...prev, {
        action: `Task "${form.title}" updated`,
        timestamp: new Date().toISOString()
      }]);
      dispatch({
        type: ACTIONS.ADD_NOTIFICATION,
        payload: { message: `✓ "${form.title}" updated`, type: "success" }
      });
    }
    setModal(null);
  }, [modal, state.data.columns]);

  // Keyboard shortcuts for Undo/Redo
  useKeyboardShortcuts({
    "CMD+Z": () => { dispatch({ type: ACTIONS.UNDO }); setActivities(prev => [...prev, { action: "Undo performed", timestamp: new Date().toISOString() }]); },
    "CMD+SHIFT+Z": () => { dispatch({ type: ACTIONS.REDO }); setActivities(prev => [...prev, { action: "Redo performed", timestamp: new Date().toISOString() }]); },
  });

  // Memoized filtering & sorting
  const filteredAndSortedData = useMemo(() => {
    const filtered = {
      ...state.data,
      columns: Object.fromEntries(
        Object.entries(state.data.columns).map(([k, col]) => [k, {
          ...col,
          tasks: col.tasks.filter(id => {
            const t = state.data.tasks[id];
            if (!t) return false;
            if (!search) return true;
            const matchesSearch = t.title.toLowerCase().includes(search.toLowerCase()) ||
              t.desc.toLowerCase().includes(search.toLowerCase()) ||
              t.tags.some(tag => tag.toLowerCase().includes(search.toLowerCase()));
            const matchesTags = filterTags.length === 0 || t.tags.some(tag => filterTags.includes(tag));
            return matchesSearch && matchesTags;
          })
        }])
      )
    };

    if (sortBy === "progress") {
      Object.keys(filtered.columns).forEach(k => {
        filtered.columns[k].tasks.sort((a, b) => {
          const taskA = state.data.tasks[a];
          const taskB = state.data.tasks[b];
          return (taskB.progress / taskB.total) - (taskA.progress / taskA.total);
        });
      });
    } else if (sortBy === "date") {
      Object.keys(filtered.columns).forEach(k => {
        filtered.columns[k].tasks.sort((a, b) => {
          const taskA = state.data.tasks[a];
          const taskB = state.data.tasks[b];
          return new Date(taskB.createdAt || 0) - new Date(taskA.createdAt || 0);
        });
      });
    }

    return filtered;
  }, [search, state.data, sortBy, filterTags]);

  // Calculate stats
  const stats = useMemo(() => {
    const totalTasks = Object.values(state.data.tasks).length;
    const completedTasks = state.data.columns.complete?.tasks.filter(id => state.data.tasks[id]).length || 0;
    const inProgressTasks = state.data.columns.inprogress?.tasks.filter(id => state.data.tasks[id]).length || 0;
    const avgProgress = totalTasks > 0 
      ? Math.round(Object.values(state.data.tasks).reduce((sum, t) => sum + (t.progress / t.total), 0) / totalTasks * 100)
      : 0;
    return { totalTasks, completedTasks, inProgressTasks, avgProgress };
  }, [state.data.tasks, state.data.columns]);

  const projects = ["Graphic Design", "Mobile App", "Website", "Illustration Assets", "User Research", "Branding", "Development"];
  const subProjects = ["Company Website", "E-Commerce Website", "Landing Page Campaign"];
  const cats = Object.values(state.data.columns);

  return (
    <div style={{ display: "flex", height: "100vh", background: "#f1f5f9", fontFamily: "'DM Sans', 'Inter', sans-serif", overflow: "hidden" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap');
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 6px; height: 6px; }
        ::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 99px; }
        ::-webkit-scrollbar-track { background: transparent; }
        button:focus { outline: none; }
        input:focus, textarea:focus, select:focus { border-color: #6366f1 !important; outline: none; }
      `}</style>

      {/* Sidebar */}
      {sidebarOpen && (
        <div style={{
          width: 240, background: "#fff", borderRight: "1px solid #e2e8f0",
          display: "flex", flexDirection: "column", overflow: "hidden", flexShrink: 0
        }}>
          {/* Logo */}
          <div style={{ padding: "18px 20px 14px", borderBottom: "1px solid #f1f5f9" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{
                width: 36, height: 36, borderRadius: 10,
                background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0
              }}>
                <span style={{ color: "#fff", fontSize: 16 }}>⇄</span>
              </div>
              <div>
                <div style={{ fontWeight: 800, fontSize: 13, color: "#0f172a" }}>Team Workspace</div>
                <div style={{ fontSize: 11, color: "#94a3b8" }}>Syncboard.Company</div>
              </div>
            </div>
          </div>

          {/* Nav icons */}
          <div style={{ padding: "12px 16px", display: "flex", flexDirection: "column", gap: 2, overflow: "auto", flex: 1 }}>
            {["🏠", "⬛", "👥", "📄", "🔧", "⚙️"].map((icon, i) => (
              <div key={i} style={{
                width: 36, height: 36, borderRadius: 9, display: "flex", alignItems: "center",
                justifyContent: "center", cursor: "pointer", fontSize: 16,
                background: i === 1 ? "#ede9fe" : "none",
                marginBottom: i < 2 ? 0 : 0
              }}>{icon}</div>
            ))}

            <div style={{ marginTop: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em" }}>Projects</span>
                <span style={{ fontSize: 16, color: "#94a3b8", cursor: "pointer" }}>+</span>
              </div>
              {projects.map(p => (
                <div key={p} style={{
                  display: "flex", alignItems: "center", gap: 8, padding: "6px 8px",
                  borderRadius: 8, cursor: "pointer", fontSize: 13, color: "#334155",
                  background: p === "Website" ? "#f8fafc" : "none",
                  fontWeight: p === "Website" ? 600 : 400
                }}>
                  <span>📁</span>{p}
                  {p === "Website" && (
                    <span style={{ marginLeft: "auto", fontSize: 10 }}>▾</span>
                  )}
                </div>
              ))}
              <div style={{ paddingLeft: 20 }}>
                {subProjects.map(sp => (
                  <div key={sp} style={{
                    display: "flex", alignItems: "center", gap: 6, padding: "5px 8px",
                    borderRadius: 8, fontSize: 12, cursor: "pointer",
                    color: sp === "E-Commerce Website" ? "#6366f1" : "#64748b",
                    background: sp === "E-Commerce Website" ? "#ede9fe" : "none",
                    fontWeight: sp === "E-Commerce Website" ? 700 : 400
                  }}>
                    <div style={{ width: 8, height: 8, borderRadius: "50%", background: sp === "E-Commerce Website" ? "#6366f1" : "#94a3b8", flexShrink: 0 }} />
                    {sp}
                  </div>
                ))}
              </div>
            </div>

            <div style={{ marginTop: 12 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 8 }}>Categories</div>
              {cats.map(c => (
                <div key={c.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "5px 8px", borderRadius: 8, fontSize: 13, color: "#334155" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{ width: 8, height: 8, borderRadius: "50%", background: c.dotColor }} />
                    {c.title === "Complete" ? "Completed" : c.title}
                  </div>
                  <span style={{ fontSize: 12, color: "#94a3b8", fontWeight: 600 }}>
                    {filteredData.columns[c.id]?.tasks.length || 0}
                  </span>
                </div>
              ))}
            </div>

            <div style={{ marginTop: 12 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 8 }}>Team</div>
              {MEMBERS.map(m => (
                <div key={m.id} style={{ display: "flex", alignItems: "center", gap: 8, padding: "5px 8px", borderRadius: 8, cursor: "pointer" }}>
                  <Avatar initials={m.id} size={26} />
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 600, color: "#0f172a", lineHeight: 1.3 }}>{m.name}</div>
                    <div style={{ fontSize: 11, color: "#94a3b8", lineHeight: 1.2 }}>{m.role}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Main */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        {/* Top nav */}
        <div style={{
          padding: "12px 24px", background: "#fff", borderBottom: "1px solid #e2e8f0",
          display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <button onClick={() => setSidebarOpen(s => !s)}
              style={{ background: "none", border: "none", cursor: "pointer", fontSize: 18, color: "#64748b", padding: 4 }}>
              ☰
            </button>
            <div style={{ fontSize: 13, color: "#94a3b8" }}>
              Project <span style={{ color: "#cbd5e1", margin: "0 4px" }}>›</span>
              Website <span style={{ color: "#cbd5e1", margin: "0 4px" }}>›</span>
              <span style={{ color: "#0f172a", fontWeight: 600 }}>E-Commerce Website</span>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ fontSize: 18, cursor: "pointer", color: "#64748b" }}>🔔</span>
            <span style={{ fontSize: 18, cursor: "pointer", color: "#64748b" }}>💬</span>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Avatar initials="MA" size={32} />
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#0f172a" }}>Jenno Wilson</div>
                <div style={{ fontSize: 11, color: "#94a3b8" }}>jeno.sonn@gmail.com</div>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflow: "auto", padding: "24px" }}>
          {/* Header */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <div style={{
                width: 44, height: 44, borderRadius: 12,
                background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                display: "flex", alignItems: "center", justifyContent: "center"
              }}>
                <span style={{ color: "#fff", fontSize: 20 }}>⇄</span>
              </div>
              <div>
                <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: "#0f172a" }}>E-Commerce Website</h1>
                <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 2 }}>
                  {totalTasks} tasks · {completedTasks} completed
                </div>
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ display: "flex" }}>
                {MEMBERS.map((m, i) => (
                  <div key={m.id} style={{ marginLeft: i === 0 ? 0 : -8, zIndex: 4 - i }}>
                    <Avatar initials={m.id} size={32} />
                  </div>
                ))}
                <div style={{
                  width: 32, height: 32, borderRadius: "50%", background: "#6366f1",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 11, color: "#fff", fontWeight: 700, marginLeft: -8, border: "2px solid #fff"
                }}>+9</div>
              </div>
              <button
                onClick={() => openNewTask("todo")}
                style={{
                  background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                  color: "#fff", border: "none", borderRadius: 10,
                  padding: "9px 18px", fontWeight: 700, fontSize: 13, cursor: "pointer",
                  display: "flex", alignItems: "center", gap: 6,
                  boxShadow: "0 4px 12px rgba(99,102,241,0.35)",
                  transition: "transform 0.15s, box-shadow 0.15s"
                }}
                onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-1px)"; e.currentTarget.style.boxShadow = "0 6px 16px rgba(99,102,241,0.45)"; }}
                onMouseLeave={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "0 4px 12px rgba(99,102,241,0.35)"; }}
              >
                + New Task
              </button>
            </div>
          </div>

          {/* Toolbar */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
            <div style={{ display: "flex", gap: 2, background: "#f1f5f9", borderRadius: 10, padding: 4 }}>
              {["Kanban", "Board", "List", "Calendar"].map(v => (
                <button
                  key={v}
                  onClick={() => setActiveView(v)}
                  style={{
                    padding: "6px 14px", borderRadius: 8, border: "none", cursor: "pointer",
                    fontWeight: 600, fontSize: 13,
                    background: activeView === v ? "#fff" : "transparent",
                    color: activeView === v ? "#6366f1" : "#64748b",
                    boxShadow: activeView === v ? "0 1px 4px rgba(0,0,0,0.08)" : "none",
                    transition: "all 0.15s"
                  }}
                >{v === "Kanban" ? "⊞ " : v === "Board" ? "⊟ " : v === "List" ? "≡ " : "📅 "}{v}</button>
              ))}
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, background: "#fff", borderRadius: 10, padding: "8px 14px", border: "1.5px solid #e2e8f0" }}>
                <span style={{ color: "#94a3b8", fontSize: 14 }}>🔍</span>
                <input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search tasks..."
                  style={{ border: "none", outline: "none", fontSize: 13, color: "#0f172a", background: "transparent", width: 160 }}
                />
              </div>
              <button style={{
                background: "#fff", border: "1.5px solid #e2e8f0", borderRadius: 10,
                padding: "8px 14px", fontSize: 13, fontWeight: 600, color: "#64748b", cursor: "pointer"
              }}>⊟ Filter</button>
            </div>
          </div>

          {/* Board */}
          <div style={{ display: "flex", gap: 14, alignItems: "flex-start", minHeight: 400 }}>
            {Object.values(filteredData.columns).map(col => (
              <Column
                key={col.id}
                col={col}
                tasks={col.tasks.map(id => data.tasks[id]).filter(Boolean)}
                onDragStart={handleDragStart}
                onDrop={handleDrop}
                onDragOver={e => e.preventDefault()}
                onAddTask={openNewTask}
                onEdit={openEdit}
                onDelete={handleDelete}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Modal */}
      {modal && (
        <Modal
          task={modal.task}
          columns={data.columns}
          onClose={() => setModal(null)}
          onSave={handleSave}
        />
      )}
    </div>
  );
}
