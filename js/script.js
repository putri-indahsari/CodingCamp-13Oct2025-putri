// DOM Elements
const taskForm = document.getElementById("task-form");
const taskTitleInput = document.getElementById("task-title");
const taskDateInput = document.getElementById("task-date");
const taskList = document.getElementById("task-list");
const filterStatus = document.getElementById("filter-status");
const sortBy = document.getElementById("sort-by");
const totalTasksElement = document.getElementById("total-tasks");
const pendingTasksElement = document.getElementById("pending-tasks");
const completedTasksElement = document.getElementById("completed-tasks");
const progressPercentElement = document.getElementById("progress-percent");
const progressFillElement = document.getElementById("progress-fill");
const titleError = document.getElementById("title-error");
const dateError = document.getElementById("date-error");

// State
let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
let currentFilter = "all";
let currentSort = "date";

// Initialize the app
function init() {
  // Set minimum date to today
  const today = new Date().toISOString().split("T")[0];
  taskDateInput.min = today;

  // Load tasks from localStorage
  updateStats();
  renderTasks();

  // Event listeners
  taskForm.addEventListener("submit", addTask);
  filterStatus.addEventListener("change", (e) => {
    currentFilter = e.target.value;
    renderTasks();
  });
  sortBy.addEventListener("change", (e) => {
    currentSort = e.target.value;
    renderTasks();
  });
}

// Add a new task
function addTask(e) {
  e.preventDefault();

  // Reset error states
  resetErrors();

  // Get form values
  const title = taskTitleInput.value.trim();
  const date = taskDateInput.value;

  // Validate inputs
  let isValid = true;

  if (!title) {
    showError(taskTitleInput, titleError);
    isValid = false;
  }

  if (!date) {
    showError(taskDateInput, dateError);
    isValid = false;
  }

  if (!isValid) return;

  // Create new task
  const newTask = {
    id: Date.now(),
    title,
    date,
    completed: false,
    createdAt: new Date().toISOString(),
  };

  // Add to tasks array
  tasks.push(newTask);

  // Save to localStorage
  saveTasks();

  // Update UI
  updateStats();
  renderTasks();

  // Reset form
  taskForm.reset();
}

// Toggle task completion status
function toggleTask(id) {
  tasks = tasks.map((task) => {
    if (task.id === id) {
      return { ...task, completed: !task.completed };
    }
    return task;
  });

  saveTasks();
  updateStats();
  renderTasks();
}

// Delete a task
function deleteTask(id) {
  if (confirm("Are you sure you want to delete this task?")) {
    tasks = tasks.filter((task) => task.id !== id);
    saveTasks();
    updateStats();
    renderTasks();
  }
}

// Update statistics
function updateStats() {
  const total = tasks.length;
  const completed = tasks.filter((task) => task.completed).length;
  const pending = total - completed;
  const progress = total > 0 ? Math.round((completed / total) * 100) : 0;

  totalTasksElement.textContent = total;
  pendingTasksElement.textContent = pending;
  completedTasksElement.textContent = completed;
  progressPercentElement.textContent = `${progress}%`;
  progressFillElement.style.width = `${progress}%`;
}

// Render tasks based on filter and sort
function renderTasks() {
  // Filter tasks
  let filteredTasks = [...tasks];

  if (currentFilter === "pending") {
    filteredTasks = filteredTasks.filter((task) => !task.completed);
  } else if (currentFilter === "completed") {
    filteredTasks = filteredTasks.filter((task) => task.completed);
  }

  // Sort tasks
  if (currentSort === "date") {
    filteredTasks.sort((a, b) => new Date(a.date) - new Date(b.date));
  } else if (currentSort === "title") {
    filteredTasks.sort((a, b) => a.title.localeCompare(b.title));
  }

  // Clear task list
  taskList.innerHTML = "";

  // Show empty state if no tasks
  if (filteredTasks.length === 0) {
    const emptyState = document.createElement("li");
    emptyState.className = "empty-state";
    emptyState.innerHTML = `
            <i>📝</i>
            <p>No tasks ${
              currentFilter !== "all" ? `with status "${currentFilter}"` : ""
            }. ${
      currentFilter !== "all"
        ? "Change filter or add new tasks!"
        : "Add a new task to get started!"
    }</p>
        `;
    taskList.appendChild(emptyState);
    return;
  }

  // Render tasks
  filteredTasks.forEach((task) => {
    const taskItem = document.createElement("li");
    taskItem.className = `task-item ${task.completed ? "task-completed" : ""}`;

    const formattedDate = new Date(task.date).toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });

    taskItem.innerHTML = `
            <div class="task-info">
                <div class="task-title">${task.title}</div>
                <div class="task-date">Due: ${formattedDate}</div>
            </div>
            <div class="task-actions">
                <button class="btn ${
                  task.completed ? "btn-warning" : "btn-success"
                }" onclick="toggleTask(${task.id})">
                    ${task.completed ? "Undo" : "Complete"}
                </button>
                <button class="btn btn-danger" onclick="deleteTask(${
                  task.id
                })">Delete</button>
            </div>
        `;

    taskList.appendChild(taskItem);
  });
}

// Save tasks to localStorage
function saveTasks() {
  localStorage.setItem("tasks", JSON.stringify(tasks));
}

// Show error message
function showError(inputElement, errorElement) {
  inputElement.classList.add("input-error");
  errorElement.style.display = "block";
}

// Reset error states
function resetErrors() {
  taskTitleInput.classList.remove("input-error");
  taskDateInput.classList.remove("input-error");
  titleError.style.display = "none";
  dateError.style.display = "none";
}

// Initialize the app when DOM is loaded
document.addEventListener("DOMContentLoaded", init);
