import React, { useState, useEffect } from "react";
import "./ToDoList.css";

function ToDoList() {
  const [tasks, setTasks] = useState(() => {
    const saved = JSON.parse(sessionStorage.getItem("tasks")) || [];
    return saved.map((t) =>
      typeof t === "string"
        ? { id: String(Date.now() + Math.random()), title: t, completed: false }
        : t
    );
  });

  const [newTask, setNewTask] = useState("");
  const [editingIndex, setEditingIndex] = useState(null);
  const [editingText, setEditingText] = useState("");
  const [filter, setFilter] = useState(
    sessionStorage.getItem("filter") || "all"
  );

  const [isDarkBg, setIsDarkBg] = useState(false);

  useEffect(() => {
    sessionStorage.setItem("tasks", JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    sessionStorage.setItem("filter", filter);
  }, [filter]);

  function addTask() {
    const trimmed = newTask.trim();
    if (!trimmed) return;
    setTasks((t) => [
      ...t,
      {
        id: String(Date.now() + Math.random()),
        title: trimmed,
        completed: false,
      },
    ]);
    setNewTask("");
  }

  function toggleComplete(index) {
    setTasks((prev) =>
      prev.map((t, i) => (i === index ? { ...t, completed: !t.completed } : t))
    );
  }

  function startEdit(index) {
    setEditingIndex(index);
    setEditingText(tasks[index].title);
  }
  function saveEdit() {
    const trimmed = editingText.trim();
    if (!trimmed) return cancelEdit();
    setTasks((prev) =>
      prev.map((t, i) => (i === editingIndex ? { ...t, title: trimmed } : t))
    );
    cancelEdit();
  }
  function cancelEdit() {
    setEditingIndex(null);
    setEditingText("");
  }

  function deleteTask(index) {
    setTasks((prev) => prev.filter((_, i) => i !== index));
    if (editingIndex === index) cancelEdit();
  }
  function moveTaskUp(index) {
    if (index === 0) return;
    const copy = [...tasks];
    [copy[index - 1], copy[index]] = [copy[index], copy[index - 1]];
    setTasks(copy);
  }
  function moveTaskDown(index) {
    if (index === tasks.length - 1) return;
    const copy = [...tasks];
    [copy[index], copy[index + 1]] = [copy[index + 1], copy[index]];
    setTasks(copy);
  }

  const visibleTasks = tasks.filter((t) =>
    filter === "completed"
      ? t.completed
      : filter === "pending"
      ? !t.completed
      : true
  );

  const counts = {
    all: tasks.length,
    completed: tasks.filter((t) => t.completed).length,
    pending: tasks.filter((t) => !t.completed).length,
  };

  return (
    <div className={`to-do-list ${isDarkBg ? "dark-bg" : ""}`}>
      <h1>To-Do-List</h1>

      <div className="top-actions">
        <button
          onClick={() => {
            setIsDarkBg((v) => !v);
            document.body.classList.toggle("dark-body");
          }}
        >
          {isDarkBg ? "Light Background" : "Dark Background"}
        </button>
      </div>

      <div>
        <input
          type="text"
          placeholder="Enter a new task..."
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && addTask()}
        />
        <button onClick={addTask}>Add</button>
      </div>

      <div className="filters">
        {["all", "completed", "pending"].map((f) => (
          <button
            key={f}
            className={`filter-btn ${filter === f ? "active" : ""}`}
            onClick={() => setFilter(f)}
          >
            {f[0].toUpperCase() + f.slice(1)} ({counts[f]})
          </button>
        ))}
      </div>

      <ul className="task-list">
        {visibleTasks.map((task) => {
          const realIndex = tasks.findIndex((t) => t.id === task.id);
          const isEditing = editingIndex === realIndex;

          return (
            <li key={task.id} className={task.completed ? "completed" : ""}>
              {isEditing ? (
                <>
                  <input
                    value={editingText}
                    onChange={(e) => setEditingText(e.target.value)}
                    onKeyDown={(e) =>
                      e.key === "Enter"
                        ? saveEdit()
                        : e.key === "Escape" && cancelEdit()
                    }
                    autoFocus
                  />
                  <div className="actions">
                    <button onClick={saveEdit}>Save</button>
                    <button onClick={cancelEdit}>Cancel</button>
                  </div>
                </>
              ) : (
                <>
                  <button onClick={() => toggleComplete(realIndex)}>
                    {task.completed ? "✅" : "☐"}
                  </button>
                  <span className="text">{task.title}</span>
                  <div className="actions">
                    <button onClick={() => startEdit(realIndex)}>Edit</button>
                    <button onClick={() => deleteTask(realIndex)}>
                      Delete
                    </button>
                    <button onClick={() => moveTaskUp(realIndex)}>Up</button>
                    <button onClick={() => moveTaskDown(realIndex)}>
                      Down
                    </button>
                  </div>
                </>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export default ToDoList;
