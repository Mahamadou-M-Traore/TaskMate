/**
 * app.js — TaskMate Frontend
 * Single-Page Application using vanilla JavaScript + fetch API
 * No frameworks. All DOM updates are dynamic (no page reloads).
 */

const API = '/api/tasks';

// ── State ─────────────────────────────────────────────────────────────────────
let editingId    = null;   // null = creating, number = editing
let filterCat    = '';
let filterStatus = '';

// ── DOM refs ──────────────────────────────────────────────────────────────────
const taskList      = document.getElementById('task-list');
const emptyState    = document.getElementById('empty-state');
const formOverlay   = document.getElementById('form-overlay');
const formTitle     = document.getElementById('form-title');
const inputTitle    = document.getElementById('input-title');
const inputDesc     = document.getElementById('input-desc');
const inputCategory = document.getElementById('input-category');
const inputStatus   = document.getElementById('input-status');
const errTitle      = document.getElementById('err-title');
const statTotal     = document.getElementById('stat-total');
const statDone      = document.getElementById('stat-done');

// ── API Calls ─────────────────────────────────────────────────────────────────

async function fetchTasks() {
  const params = new URLSearchParams();
  if (filterCat)    params.set('category', filterCat);
  if (filterStatus) params.set('status',   filterStatus);

  const res  = await fetch(`${API}?${params}`);
  const data = await res.json();
  return data.data;
}

async function createTask(payload) {
  const res  = await fetch(API, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify(payload),
  });
  return res.json();
}

async function updateTask(id, payload) {
  const res = await fetch(`${API}/${id}`, {
    method:  'PUT',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify(payload),
  });
  return res.json();
}

async function deleteTask(id) {
  const res = await fetch(`${API}/${id}`, { method: 'DELETE' });
  return res.json();
}

// ── Render ────────────────────────────────────────────────────────────────────

async function loadAndRender() {
  const tasks = await fetchTasks();
  renderTasks(tasks);
  updateStats(tasks);
}

function renderTasks(tasks) {
  // Remove existing cards (keep empty-state in DOM)
  document.querySelectorAll('.task-card').forEach(el => el.remove());

  if (tasks.length === 0) {
    emptyState.style.display = 'block';
    return;
  }
  emptyState.style.display = 'none';

  tasks.forEach(task => {
    const card = buildCard(task);
    taskList.appendChild(card);
  });
}

function buildCard(task) {
  const card = document.createElement('div');
  card.className = `task-card${task.status === 'done' ? ' done' : ''}`;
  card.dataset.id = task.id;

  const dateStr = new Date(task.created_at).toLocaleDateString('en-GB', {
    day: 'numeric', month: 'short', year: 'numeric',
  });

  card.innerHTML = `
    <div class="task-check" title="Toggle done">${task.status === 'done' ? '✓' : ''}</div>
    <div class="task-body">
      <div class="task-title">${escHtml(task.title)}</div>
      ${task.description ? `<div class="task-desc">${escHtml(task.description)}</div>` : ''}
      <div class="task-meta">
        <span class="badge badge-cat">${escHtml(task.category)}</span>
        <span class="badge ${task.status === 'done' ? 'badge-done' : 'badge-pending'}">
          ${task.status}
        </span>
        <span class="task-date">${dateStr}</span>
      </div>
    </div>
    <div class="task-actions">
      <button class="btn-icon btn-edit" title="Edit">✎ Edit</button>
      <button class="btn-icon danger btn-delete" title="Delete">✕</button>
    </div>
  `;

  // Toggle done
  card.querySelector('.task-check').addEventListener('click', () => onToggle(task));

  // Edit
  card.querySelector('.btn-edit').addEventListener('click', () => openForm(task));

  // Delete
  card.querySelector('.btn-delete').addEventListener('click', () => onDelete(task.id));

  return card;
}

function updateStats(tasks) {
  const total = tasks.length;
  const done  = tasks.filter(t => t.status === 'done').length;
  // Fetch all tasks (unfiltered) for header stats
  fetch(API)
    .then(r => r.json())
    .then(d => {
      const all  = d.data;
      statTotal.textContent = `${all.length} task${all.length !== 1 ? 's' : ''}`;
      statDone.textContent  = `${all.filter(t => t.status === 'done').length} done`;
    });
}

// ── Form ──────────────────────────────────────────────────────────────────────

function openForm(task = null) {
  editingId = task ? task.id : null;
  formTitle.textContent = task ? 'Edit Task' : 'New Task';
  inputTitle.value    = task ? task.title       : '';
  inputDesc.value     = task ? task.description : '';
  inputCategory.value = task ? task.category    : 'General';
  inputStatus.value   = task ? task.status      : 'pending';
  errTitle.textContent = '';
  formOverlay.hidden   = false;
  inputTitle.focus();
}

function closeForm() {
  formOverlay.hidden = true;
  editingId = null;
}

async function submitForm() {
  const title    = inputTitle.value.trim();
  const desc     = inputDesc.value.trim();
  const category = inputCategory.value;
  const status   = inputStatus.value;

  // Frontend validation
  if (!title) {
    errTitle.textContent = 'Title is required';
    inputTitle.focus();
    return;
  }
  errTitle.textContent = '';

  const payload = { title, description: desc, category, status };
  let result;

  if (editingId) {
    result = await updateTask(editingId, payload);
  } else {
    result = await createTask(payload);
  }

  if (!result.success) {
    errTitle.textContent = result.errors.join(', ');
    return;
  }

  closeForm();
  await loadAndRender();
  showToast(editingId ? 'Task updated ✓' : 'Task created ✓');
}

// ── Actions ───────────────────────────────────────────────────────────────────

async function onToggle(task) {
  const newStatus = task.status === 'done' ? 'pending' : 'done';
  const result = await updateTask(task.id, { status: newStatus });
  if (result.success) {
    await loadAndRender();
    showToast(newStatus === 'done' ? 'Marked as done ✓' : 'Marked as pending');
  }
}

async function onDelete(id) {
  if (!confirm('Delete this task?')) return;
  const result = await deleteTask(id);
  if (result.success) {
    await loadAndRender();
    showToast('Task deleted');
  }
}

// ── Toast ─────────────────────────────────────────────────────────────────────

function showToast(msg) {
  const toast = document.getElementById('toast');
  toast.textContent = msg;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 2500);
}

// ── Filters ───────────────────────────────────────────────────────────────────

document.querySelectorAll('.filter-btn[data-cat]').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.filter-btn[data-cat]').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    filterCat = btn.dataset.cat;
    loadAndRender();
  });
});

document.querySelectorAll('.filter-btn[data-status]').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.filter-btn[data-status]').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    filterStatus = btn.dataset.status;
    loadAndRender();
  });
});

// ── Events ────────────────────────────────────────────────────────────────────

document.getElementById('btn-open-form').addEventListener('click', () => openForm());
document.getElementById('btn-close-form').addEventListener('click', closeForm);
document.getElementById('btn-cancel-form').addEventListener('click', closeForm);
document.getElementById('btn-submit-form').addEventListener('click', submitForm);

// Close overlay on backdrop click
formOverlay.addEventListener('click', e => {
  if (e.target === formOverlay) closeForm();
});

// Keyboard shortcut: Enter to submit, Escape to close
document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && !formOverlay.hidden) closeForm();
  if (e.key === 'Enter'  && !formOverlay.hidden && e.target.tagName !== 'TEXTAREA') submitForm();
});

// ── Utility ───────────────────────────────────────────────────────────────────

function escHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

// ── Init ──────────────────────────────────────────────────────────────────────

loadAndRender();
