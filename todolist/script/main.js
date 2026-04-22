const monthDropdown = document.getElementById("monthDropdown");
const monthTrigger = document.getElementById("monthTrigger");
const monthList = document.getElementById("monthList");

const dateTrack = document.getElementById("dateTrack");
const summaryTitle = document.getElementById("summaryTitle");
const summaryDesc = document.getElementById("summaryDesc");
const progressRing = document.getElementById("progressRing");
const progressText = document.getElementById("progressText");

const todoList = document.getElementById("todoList");
const emptyState = document.getElementById("emptyState");
const tabButtons = document.querySelectorAll(".tab-btn");

const openAddBtn = document.getElementById("openAddBtn");
const todoModal = document.getElementById("todoModal");
const todoForm = document.getElementById("todoForm");
const modalTitle = document.getElementById("modalTitle");
const todoInput = document.getElementById("todoInput");
const formError = document.getElementById("formError");
const closeModalBtn = document.getElementById("closeModalBtn");

const categoryDropdown = document.getElementById("categoryDropdown");
const categoryTrigger = document.getElementById("categoryTrigger");
const categoryList = document.getElementById("categoryList");

const deleteConfirm = document.getElementById("deleteConfirm");
const cancelDeleteBtn = document.getElementById("cancelDeleteBtn");
const confirmDeleteBtn = document.getElementById("confirmDeleteBtn");

const today = new Date();
const currentYear = today.getFullYear();

let selectedMonth = today.getMonth();
let selectedDate = today.getDate();
let currentFilter = "all";
let editId = null;
let selectedCategory = "work";
let deleteTargetId = null;

let isDraggingDate = false;
let dateStartX = 0;
let dateStartScrollLeft = 0;
let didDragDate = false;

const categoryLabel = {
  work: "업무",
  study: "공부",
  personal: "개인",
};

const categoryOptions = [
  { value: "work", label: "업무" },
  { value: "study", label: "공부" },
  { value: "personal", label: "개인" },
];

let todos = [
  {
    id: makeId(),
    year: currentYear,
    month: today.getMonth(),
    date: today.getDate(),
    text: "월별 할 일 앱 구조 잡기",
    category: "work",
    done: false,
  },
  {
    id: makeId(),
    year: currentYear,
    month: today.getMonth(),
    date: today.getDate(),
    text: "날짜 스와이프 UI 확인",
    category: "study",
    done: true,
  },
];

function makeId() {
  if (window.crypto && crypto.randomUUID) {
    return crypto.randomUUID();
  }

  return String(Date.now()) + Math.random().toString(16).slice(2);
}

function escapeHTML(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function getLastDate(year, month) {
  return new Date(year, month + 1, 0).getDate();
}

function getDayName(year, month, date) {
  return ["일", "월", "화", "수", "목", "금", "토"][
    new Date(year, month, date).getDay()
  ];
}

function getSelectedTodos() {
  return todos.filter((todo) => {
    return (
      todo.year === currentYear &&
      todo.month === selectedMonth &&
      todo.date === selectedDate
    );
  });
}

function setActiveTab(filter) {
  currentFilter = filter;

  tabButtons.forEach((button) => {
    button.classList.toggle(
      "is-active",
      button.dataset.filter === currentFilter,
    );
  });
}

function renderMonthDropdown() {
  monthTrigger.textContent = `${selectedMonth + 1}월`;

  monthList.innerHTML = Array.from({ length: 12 }, (_, index) => {
    const isActive = index === selectedMonth;

    return `
      <button
        type="button"
        class="month-option ${isActive ? "is-active" : ""}"
        role="option"
        aria-selected="${isActive}"
        data-month="${index}"
      >
        ${index + 1}월
      </button>
    `;
  }).join("");
}

function openMonthDropdown() {
  monthDropdown.classList.add("is-open");
  monthTrigger.setAttribute("aria-expanded", "true");
}

function closeMonthDropdown() {
  monthDropdown.classList.remove("is-open");
  monthTrigger.setAttribute("aria-expanded", "false");
}

function toggleMonthDropdown() {
  if (monthDropdown.classList.contains("is-open")) {
    closeMonthDropdown();
  } else {
    openMonthDropdown();
  }
}

function renderCategoryDropdown() {
  categoryTrigger.textContent = categoryLabel[selectedCategory];

  categoryList.innerHTML = categoryOptions
    .map((option) => {
      const isActive = option.value === selectedCategory;

      return `
        <button
          type="button"
          class="category-option ${isActive ? "is-active" : ""}"
          role="option"
          aria-selected="${isActive}"
          data-category="${option.value}"
        >
          <span class="category-dot ${option.value}"></span>
          <span>${option.label}</span>
        </button>
      `;
    })
    .join("");
}

function openCategoryDropdown() {
  categoryDropdown.classList.add("is-open");
  categoryTrigger.setAttribute("aria-expanded", "true");
}

function closeCategoryDropdown() {
  categoryDropdown.classList.remove("is-open");
  categoryTrigger.setAttribute("aria-expanded", "false");
}

function toggleCategoryDropdown() {
  if (categoryDropdown.classList.contains("is-open")) {
    closeCategoryDropdown();
  } else {
    openCategoryDropdown();
  }
}

function renderDates(shouldScroll = true) {
  const lastDate = getLastDate(currentYear, selectedMonth);

  if (selectedDate > lastDate) {
    selectedDate = lastDate;
  }

  dateTrack.innerHTML = Array.from({ length: lastDate }, (_, index) => {
    const date = index + 1;
    const day = getDayName(currentYear, selectedMonth, date);
    const isActive = date === selectedDate;

    return `
      <button
        type="button"
        class="date-card ${isActive ? "is-active" : ""}"
        data-date="${date}"
      >
        <span class="day">${day}</span>
        <span class="num">${date}</span>
      </button>
    `;
  }).join("");

  if (!shouldScroll) return;

  const activeDateCard = dateTrack.querySelector(".date-card.is-active");

  if (activeDateCard) {
    activeDateCard.scrollIntoView({
      behavior: "smooth",
      inline: "center",
      block: "nearest",
    });
  }
}

function renderSummary() {
  const selectedTodos = getSelectedTodos();
  const totalCount = selectedTodos.length;
  const doneCount = selectedTodos.filter((todo) => todo.done).length;
  const percent =
    totalCount === 0 ? 0 : Math.round((doneCount / totalCount) * 100);

  summaryTitle.textContent = `${selectedMonth + 1}월 ${selectedDate}일 할 일`;

  summaryDesc.textContent =
    totalCount === 0
      ? "우하단 버튼으로 새 할 일을 추가해보세요."
      : `전체 ${totalCount}개 중 ${doneCount}개를 완료했어요.`;

  progressRing.style.setProperty("--rate", `${percent * 3.6}deg`);
  progressText.textContent = `${percent}%`;
}

function renderTodos() {
  const selectedTodos = getSelectedTodos();

  const filteredTodos = selectedTodos.filter((todo) => {
    if (currentFilter === "all") return true;
    if (currentFilter === "done") return todo.done;
    return !todo.done;
  });

  todoList.innerHTML = filteredTodos
    .map((todo) => {
      return `
        <article class="todo-item ${todo.done ? "is-done" : ""}" data-id="${todo.id}">
          <button
            type="button"
            class="check-btn"
            aria-label="완료 상태 변경"
          ></button>

          <div class="todo-main">
            <p class="todo-text">${escapeHTML(todo.text)}</p>
            <div class="todo-meta">
              <span class="category-dot ${todo.category}"></span>
              <span>${categoryLabel[todo.category]}</span>
            </div>
          </div>

          <div class="todo-actions">
            <button type="button" class="todo-action-btn edit">수정</button>
            <button type="button" class="todo-action-btn delete">삭제</button>
          </div>
        </article>
      `;
    })
    .join("");

  const emptyText =
    currentFilter === "all"
      ? "아직 등록된 할 일이 없습니다."
      : currentFilter === "done"
        ? "완료된 할 일이 없습니다."
        : "미완료 할 일이 없습니다.";

  emptyState.textContent =
    selectedTodos.length === 0 ? "아직 등록된 할 일이 없습니다." : emptyText;

  emptyState.classList.toggle("is-show", filteredTodos.length === 0);
}

function render() {
  renderMonthDropdown();
  renderCategoryDropdown();
  renderDates();
  renderSummary();
  renderTodos();
}

function openTodoModal(mode = "add", todo = null) {
  editId = todo ? todo.id : null;
  selectedCategory = todo ? todo.category : "work";

  modalTitle.textContent = mode === "edit" ? "할 일 수정" : "할 일 추가";
  todoInput.value = todo ? todo.text : "";
  formError.classList.remove("is-show");

  renderCategoryDropdown();

  todoModal.classList.add("is-open");
  todoModal.setAttribute("aria-hidden", "false");

  setTimeout(() => {
    todoInput.focus();
  }, 80);
}

function closeTodoModal() {
  todoModal.classList.remove("is-open");
  todoModal.setAttribute("aria-hidden", "true");

  todoForm.reset();
  selectedCategory = "work";
  editId = null;

  closeCategoryDropdown();
}

function openDeleteConfirm(id) {
  deleteTargetId = id;
  deleteConfirm.classList.add("is-open");
  deleteConfirm.setAttribute("aria-hidden", "false");
}

function closeDeleteConfirm() {
  deleteTargetId = null;
  deleteConfirm.classList.remove("is-open");
  deleteConfirm.setAttribute("aria-hidden", "true");
}

monthTrigger.addEventListener("click", (event) => {
  event.stopPropagation();
  toggleMonthDropdown();
});

monthList.addEventListener("click", (event) => {
  const option = event.target.closest(".month-option");
  if (!option) return;

  selectedMonth = Number(option.dataset.month);
  selectedDate = 1;

  setActiveTab("all");
  closeMonthDropdown();
  render();
});

categoryTrigger.addEventListener("click", (event) => {
  event.stopPropagation();
  toggleCategoryDropdown();
});

categoryList.addEventListener("click", (event) => {
  const option = event.target.closest(".category-option");
  if (!option) return;

  selectedCategory = option.dataset.category;

  renderCategoryDropdown();
  closeCategoryDropdown();
});

document.addEventListener("click", (event) => {
  if (!monthDropdown.contains(event.target)) {
    closeMonthDropdown();
  }

  if (!categoryDropdown.contains(event.target)) {
    closeCategoryDropdown();
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closeMonthDropdown();
    closeCategoryDropdown();
    closeTodoModal();
    closeDeleteConfirm();
  }
});

dateTrack.addEventListener("pointerdown", (event) => {
  isDraggingDate = true;
  didDragDate = false;
  dateStartX = event.clientX;
  dateStartScrollLeft = dateTrack.scrollLeft;
  dateTrack.classList.add("is-dragging");
});

dateTrack.addEventListener("pointermove", (event) => {
  if (!isDraggingDate) return;

  const moveX = event.clientX - dateStartX;

  if (Math.abs(moveX) > 5) {
    didDragDate = true;
  }

  dateTrack.scrollLeft = dateStartScrollLeft - moveX;
});

dateTrack.addEventListener("pointerup", () => {
  isDraggingDate = false;
  dateTrack.classList.remove("is-dragging");
});

dateTrack.addEventListener("pointercancel", () => {
  isDraggingDate = false;
  dateTrack.classList.remove("is-dragging");
});

dateTrack.addEventListener("pointerleave", () => {
  isDraggingDate = false;
  dateTrack.classList.remove("is-dragging");
});

dateTrack.addEventListener("click", (event) => {
  if (didDragDate) {
    event.preventDefault();
    didDragDate = false;
    return;
  }

  const dateButton = event.target.closest(".date-card");
  if (!dateButton) return;

  selectedDate = Number(dateButton.dataset.date);

  renderDates(false);
  renderSummary();
  renderTodos();
});

tabButtons.forEach((button) => {
  button.addEventListener("click", () => {
    setActiveTab(button.dataset.filter);
    renderTodos();
  });
});

todoList.addEventListener("click", (event) => {
  const item = event.target.closest(".todo-item");
  if (!item) return;

  const id = item.dataset.id;

  if (event.target.closest(".check-btn")) {
    todos = todos.map((todo) => {
      return todo.id === id ? { ...todo, done: !todo.done } : todo;
    });

    renderSummary();
    renderTodos();
    return;
  }

  if (event.target.closest(".todo-action-btn.edit")) {
    const todo = todos.find((item) => item.id === id);

    if (todo) {
      openTodoModal("edit", todo);
    }

    return;
  }

  if (event.target.closest(".todo-action-btn.delete")) {
    openDeleteConfirm(id);
  }
});

cancelDeleteBtn.addEventListener("click", () => {
  closeDeleteConfirm();
});

confirmDeleteBtn.addEventListener("click", () => {
  if (!deleteTargetId) return;

  todos = todos.filter((todo) => todo.id !== deleteTargetId);

  closeDeleteConfirm();
  renderSummary();
  renderTodos();
});

deleteConfirm.addEventListener("click", (event) => {
  if (event.target === deleteConfirm) {
    closeDeleteConfirm();
  }
});

openAddBtn.addEventListener("click", () => {
  openTodoModal("add");
});

closeModalBtn.addEventListener("click", () => {
  closeTodoModal();
});

todoModal.addEventListener("click", (event) => {
  if (event.target === todoModal) {
    closeTodoModal();
  }
});

todoForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const text = todoInput.value.trim();
  const category = selectedCategory;

  if (!text) {
    formError.classList.add("is-show");
    todoInput.focus();
    return;
  }

  if (editId) {
    todos = todos.map((todo) => {
      return todo.id === editId ? { ...todo, text, category } : todo;
    });
  } else {
    todos.unshift({
      id: makeId(),
      year: currentYear,
      month: selectedMonth,
      date: selectedDate,
      text,
      category,
      done: false,
    });

    setActiveTab("all");
  }

  closeTodoModal();
  renderSummary();
  renderTodos();
});

render();
