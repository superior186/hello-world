(function () {
  const STORAGE_KEY = "todo-app-data";

  const todoInput = document.getElementById("todoInput");
  const addBtn = document.getElementById("addBtn");
  const todoList = document.getElementById("todoList");
  const counter = document.getElementById("counter");
  const footer = document.getElementById("footer");
  const clearCompletedBtn = document.getElementById("clearCompleted");
  const emptyState = document.getElementById("emptyState");
  const filterBtns = document.querySelectorAll(".filter-btn");

  let todos = loadTodos();
  let currentFilter = "all";

  function loadTodos() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    } catch {
      return [];
    }
  }

  function saveTodos() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
  }

  function formatDate(ts) {
    const d = new Date(ts);
    const month = d.getMonth() + 1;
    const day = d.getDate();
    const hour = String(d.getHours()).padStart(2, "0");
    const min = String(d.getMinutes()).padStart(2, "0");
    return `${month}/${day} ${hour}:${min}`;
  }

  function createTodoElement(todo) {
    const li = document.createElement("li");
    li.className = "todo-item" + (todo.completed ? " completed" : "");
    li.dataset.id = todo.id;

    li.innerHTML = `
      <label class="todo-checkbox">
        <input type="checkbox" ${todo.completed ? "checked" : ""}>
        <span class="checkmark">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
        </span>
      </label>
      <span class="todo-text">${escapeHtml(todo.text)}</span>
      <span class="todo-date">${formatDate(todo.createdAt)}</span>
      <button class="delete-btn" aria-label="删除">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      </button>
    `;

    const checkbox = li.querySelector("input[type=checkbox]");
    checkbox.addEventListener("change", () => toggleTodo(todo.id));

    const deleteBtn = li.querySelector(".delete-btn");
    deleteBtn.addEventListener("click", () => removeTodo(todo.id, li));

    return li;
  }

  function escapeHtml(str) {
    const div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
  }

  function render() {
    const filtered = todos.filter((t) => {
      if (currentFilter === "active") return !t.completed;
      if (currentFilter === "completed") return t.completed;
      return true;
    });

    todoList.innerHTML = "";
    filtered.forEach((todo) => {
      todoList.appendChild(createTodoElement(todo));
    });

    const activeCount = todos.filter((t) => !t.completed).length;
    counter.textContent = `${activeCount} 个待完成`;

    const hasCompleted = todos.some((t) => t.completed);
    clearCompletedBtn.style.display = hasCompleted ? "inline-block" : "none";

    if (todos.length === 0) {
      footer.classList.add("hidden");
      emptyState.classList.add("visible");
    } else {
      footer.classList.remove("hidden");
      emptyState.classList.remove("visible");
    }
  }

  function addTodo() {
    const text = todoInput.value.trim();
    if (!text) return;

    const todo = {
      id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
      text,
      completed: false,
      createdAt: Date.now(),
    };

    todos.unshift(todo);
    saveTodos();
    render();
    todoInput.value = "";
    todoInput.focus();
  }

  function toggleTodo(id) {
    const todo = todos.find((t) => t.id === id);
    if (todo) {
      todo.completed = !todo.completed;
      saveTodos();
      render();
    }
  }

  function removeTodo(id, element) {
    element.classList.add("removing");
    element.addEventListener("animationend", () => {
      todos = todos.filter((t) => t.id !== id);
      saveTodos();
      render();
    });
  }

  function clearCompleted() {
    todos = todos.filter((t) => !t.completed);
    saveTodos();
    render();
  }

  function setFilter(filter) {
    currentFilter = filter;
    filterBtns.forEach((btn) => {
      btn.classList.toggle("active", btn.dataset.filter === filter);
    });
    render();
  }

  // Event listeners
  addBtn.addEventListener("click", addTodo);

  todoInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") addTodo();
  });

  clearCompletedBtn.addEventListener("click", clearCompleted);

  filterBtns.forEach((btn) => {
    btn.addEventListener("click", () => setFilter(btn.dataset.filter));
  });

  render();
})();
