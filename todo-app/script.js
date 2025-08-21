(function () {
	"use strict";

	const storageKeys = {
		tasks: "todo.tasks",
		filter: "todo.filter",
		theme: "todo.theme"
	};

	/** @typedef {{ id: string, title: string, completed: boolean, createdAt: number }} Task */

	/** @type {Task[]} */
	let tasks = [];
	/** @type {"all"|"active"|"completed"} */
	let currentFilter = "all";

	const elements = {
		form: document.getElementById("newTodoForm"),
		input: document.getElementById("newTodoInput"),
		list: document.getElementById("todoList"),
		filterButtons: Array.from(document.querySelectorAll(".filter")),
		toggleAll: document.getElementById("toggleAll"),
		clearCompleted: document.getElementById("clearCompleted"),
		themeToggle: document.getElementById("themeToggle")
	};

	function generateId() {
		return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
	}

	function readFromLocalStorage() {
		try {
			const saved = localStorage.getItem(storageKeys.tasks);
			tasks = Array.isArray(JSON.parse(saved)) ? JSON.parse(saved) : [];
		} catch (_) {
			tasks = [];
		}
		try {
			const savedFilter = localStorage.getItem(storageKeys.filter);
			if (savedFilter === "active" || savedFilter === "completed" || savedFilter === "all") {
				currentFilter = savedFilter;
			}
		} catch (_) {}
	}

	function writeToLocalStorage() {
		localStorage.setItem(storageKeys.tasks, JSON.stringify(tasks));
		localStorage.setItem(storageKeys.filter, currentFilter);
	}

	function setTheme(theme) {
		const root = document.documentElement;
		if (theme === "dark") {
			root.setAttribute("data-theme", "dark");
			localStorage.setItem(storageKeys.theme, "dark");
			elements.themeToggle.textContent = "☀️";
			elements.themeToggle.setAttribute("aria-label", "Switch to light mode");
		} else {
			root.setAttribute("data-theme", "light");
			localStorage.setItem(storageKeys.theme, "light");
			elements.themeToggle.textContent = "🌙";
			elements.themeToggle.setAttribute("aria-label", "Switch to dark mode");
		}
	}

	function loadTheme() {
		const saved = localStorage.getItem(storageKeys.theme);
		if (saved === "dark" || saved === "light") {
			setTheme(saved);
			return;
		}
		const prefersDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
		setTheme(prefersDark ? "dark" : "light");
	}

	function getVisibleTasks() {
		if (currentFilter === "active") return tasks.filter(t => !t.completed);
		if (currentFilter === "completed") return tasks.filter(t => t.completed);
		return tasks.slice();
	}

	function updateFilterButtons() {
		for (const button of elements.filterButtons) {
			const isActive = button.dataset.filter === currentFilter;
			button.classList.toggle("is-active", isActive);
			button.setAttribute("aria-pressed", String(isActive));
		}
	}

	function setFilter(newFilter) {
		currentFilter = newFilter;
		updateFilterButtons();
		writeToLocalStorage();
		render();
	}

	function addTask(title) {
		const trimmed = title.trim();
		if (!trimmed) return;
		const task = { id: generateId(), title: trimmed, completed: false, createdAt: Date.now() };
		tasks.unshift(task);
		writeToLocalStorage();
		render();
	}

	function removeTask(taskId) {
		tasks = tasks.filter(t => t.id !== taskId);
		writeToLocalStorage();
		render();
	}

	function toggleTask(taskId) {
		for (const task of tasks) {
			if (task.id === taskId) {
				task.completed = !task.completed;
				break;
			}
		}
		writeToLocalStorage();
		render();
	}

	function updateTaskTitle(taskId, newTitle) {
		const trimmed = newTitle.trim();
		if (!trimmed) {
			removeTask(taskId);
			return;
		}
		for (const task of tasks) {
			if (task.id === taskId) {
				task.title = trimmed;
				break;
			}
		}
		writeToLocalStorage();
		render();
	}

	function clearCompleted() {
		tasks = tasks.filter(t => !t.completed);
		writeToLocalStorage();
		render();
	}

	function toggleAll() {
		const hasActive = tasks.some(t => !t.completed);
		for (const task of tasks) {
			task.completed = hasActive;
		}
		writeToLocalStorage();
		render();
	}

	function createTodoItemElement(task) {
		const li = document.createElement("li");
		li.dataset.id = task.id;
		li.className = task.completed ? "completed" : "";

		const checkbox = document.createElement("input");
		checkbox.type = "checkbox";
		checkbox.className = "toggle";
		checkbox.checked = task.completed;
		checkbox.id = `todo-${task.id}`;
		checkbox.setAttribute("aria-label", "Mark completed");

		const title = document.createElement("label");
		title.className = "title";
		title.htmlFor = checkbox.id;
		title.textContent = task.title;
		title.title = "Double-click to edit";

		const editInput = document.createElement("input");
		editInput.type = "text";
		editInput.className = "edit-input";
		editInput.value = task.title;
		editInput.setAttribute("aria-label", "Edit todo title");

		const actions = document.createElement("div");
		actions.className = "actions";
		const editBtn = document.createElement("button");
		editBtn.className = "edit-btn";
		editBtn.textContent = "Edit";
		editBtn.setAttribute("aria-label", "Edit todo");
		const delBtn = document.createElement("button");
		delBtn.className = "delete-btn";
		delBtn.textContent = "Delete";
		delBtn.setAttribute("aria-label", "Delete todo");
		actions.appendChild(editBtn);
		actions.appendChild(delBtn);

		li.appendChild(checkbox);
		li.appendChild(title);
		li.appendChild(editInput);
		li.appendChild(actions);
		return li;
	}

	function render() {
		const fragment = document.createDocumentFragment();
		const visible = getVisibleTasks();
		for (const task of visible) {
			fragment.appendChild(createTodoItemElement(task));
		}
		elements.list.innerHTML = "";
		elements.list.appendChild(fragment);
	}

	function startEditing(listItem) {
		listItem.classList.add("editing");
		const input = listItem.querySelector(".edit-input");
		input.value = tasks.find(t => t.id === listItem.dataset.id)?.title || input.value;
		setTimeout(() => input.focus(), 0);
		input.selectionStart = input.selectionEnd = input.value.length;
	}

	function stopEditing(listItem, save) {
		const input = listItem.querySelector(".edit-input");
		listItem.classList.remove("editing");
		if (save) {
			updateTaskTitle(listItem.dataset.id, input.value);
		}
	}

	function onListClick(event) {
		const target = event.target;
		const listItem = target.closest("li");
		if (!listItem) return;
		const taskId = listItem.dataset.id;

		if (target.matches("input.toggle")) {
			toggleTask(taskId);
			return;
		}
		if (target.matches("button.delete-btn")) {
			removeTask(taskId);
			return;
		}
		if (target.matches("button.edit-btn")) {
			startEditing(listItem);
			return;
		}
	}

	function onListDblClick(event) {
		const title = event.target.closest("label.title");
		if (!title) return;
		const listItem = title.closest("li");
		if (!listItem) return;
		startEditing(listItem);
	}

	function onListKeyDown(event) {
		const input = event.target.closest("input.edit-input");
		if (!input) return;
		const listItem = input.closest("li");
		if (!listItem) return;
		if (event.key === "Enter") {
			event.preventDefault();
			stopEditing(listItem, true);
		}
		if (event.key === "Escape") {
			event.preventDefault();
			stopEditing(listItem, false);
		}
	}

	function onListBlur(event) {
		const input = event.target.closest("input.edit-input");
		if (!input) return;
		const listItem = input.closest("li");
		if (!listItem) return;
		stopEditing(listItem, true);
	}

	// Wire up events
	elements.form.addEventListener("submit", function (event) {
		event.preventDefault();
		addTask(elements.input.value);
		elements.input.value = "";
		elements.input.focus();
	});

	elements.list.addEventListener("click", onListClick);
	elements.list.addEventListener("dblclick", onListDblClick);
	elements.list.addEventListener("keydown", onListKeyDown);
	elements.list.addEventListener("focusout", onListBlur);

	for (const button of elements.filterButtons) {
		button.addEventListener("click", function () {
			setFilter(this.dataset.filter);
		});
	}

	elements.toggleAll.addEventListener("click", toggleAll);
	elements.clearCompleted.addEventListener("click", clearCompleted);

	elements.themeToggle.addEventListener("click", function () {
		const isDark = document.documentElement.getAttribute("data-theme") === "dark";
		setTheme(isDark ? "light" : "dark");
	});

	// Keyboard shortcut: focus new item input with "n"
	document.addEventListener("keydown", function (event) {
		if ((event.key === "n" || event.key === "N") && !event.ctrlKey && !event.metaKey && !event.altKey) {
			elements.input.focus();
		}
	});

	// Initialize
	readFromLocalStorage();
	loadTheme();
	updateFilterButtons();
	render();
})();
