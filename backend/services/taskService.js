/**
 * taskService.js
 * All business logic lives here — routes only call these functions.
 * Separation from routes makes unit testing possible without a server.
 */

const db = require('../db/database');

const VALID_CATEGORIES = ['Work', 'Personal', 'School', 'General'];
const VALID_STATUSES   = ['pending', 'done'];

// ─── Validation ──────────────────────────────────────────────────────────────

function validateTask(data) {
  const errors = [];

  if (!data.title || data.title.trim() === '') {
    errors.push('Title is required');
  } else if (data.title.trim().length > 100) {
    errors.push('Title must be 100 characters or fewer');
  }

  if (data.description && data.description.length > 500) {
    errors.push('Description must be 500 characters or fewer');
  }

  if (data.category && !VALID_CATEGORIES.includes(data.category)) {
    errors.push(`Category must be one of: ${VALID_CATEGORIES.join(', ')}`);
  }

  if (data.status && !VALID_STATUSES.includes(data.status)) {
    errors.push(`Status must be one of: ${VALID_STATUSES.join(', ')}`);
  }

  return errors;
}

// ─── CRUD Operations ─────────────────────────────────────────────────────────

async function getAllTasks(category, status) {
  let sql    = 'SELECT * FROM tasks WHERE 1=1';
  const params = [];

  if (category && VALID_CATEGORIES.includes(category)) {
    sql += ' AND category = ?';
    params.push(category);
  }
  if (status && VALID_STATUSES.includes(status)) {
    sql += ' AND status = ?';
    params.push(status);
  }
  sql += ' ORDER BY created_at DESC';

  return db.all(sql, params);
}

async function getTaskById(id) {
  return db.get('SELECT * FROM tasks WHERE id = ?', [id]);
}

async function createTask(data) {
  const errors = validateTask(data);
  if (errors.length > 0) return { success: false, errors };

  const result = await db.run(
    'INSERT INTO tasks (title, description, category, status) VALUES (?, ?, ?, ?)',
    [
      data.title.trim(),
      (data.description || '').trim(),
      data.category || 'General',
      data.status   || 'pending',
    ]
  );

  const task = await getTaskById(result.lastInsertRowid);
  return { success: true, task };
}

async function updateTask(id, data) {
  const existing = await getTaskById(id);
  if (!existing) return { success: false, errors: ['Task not found'] };

  const merged = {
    title:       data.title       !== undefined ? data.title       : existing.title,
    description: data.description !== undefined ? data.description : existing.description,
    category:    data.category    !== undefined ? data.category    : existing.category,
    status:      data.status      !== undefined ? data.status      : existing.status,
  };

  const errors = validateTask(merged);
  if (errors.length > 0) return { success: false, errors };

  await db.run(
    'UPDATE tasks SET title = ?, description = ?, category = ?, status = ? WHERE id = ?',
    [merged.title.trim(), (merged.description || '').trim(), merged.category, merged.status, id]
  );

  return { success: true, task: await getTaskById(id) };
}

async function deleteTask(id) {
  const existing = await getTaskById(id);
  if (!existing) return { success: false, errors: ['Task not found'] };

  await db.run('DELETE FROM tasks WHERE id = ?', [id]);
  return { success: true };
}

module.exports = {
  validateTask,
  getAllTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
};
