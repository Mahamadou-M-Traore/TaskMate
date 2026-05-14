/**
 * Unit tests for taskService.js
 * NODE_ENV=test → in-memory SQLite (no files created or modified).
 */

process.env.NODE_ENV = 'test';

const { resetDb }    = require('../backend/db/database');
const {
  validateTask,
  getAllTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
} = require('../backend/services/taskService');

beforeEach(async () => {
  await resetDb(); // fresh in-memory DB for every test
});

// ─── validateTask (synchronous — no DB needed) ────────────────────────────────

describe('validateTask', () => {
  test('error when title is missing', () => {
    expect(validateTask({})).toContain('Title is required');
  });

  test('error when title is only spaces', () => {
    expect(validateTask({ title: '   ' })).toContain('Title is required');
  });

  test('error when title exceeds 100 characters', () => {
    expect(validateTask({ title: 'a'.repeat(101) })).toContain('Title must be 100 characters or fewer');
  });

  test('error for invalid category', () => {
    const errors = validateTask({ title: 'Test', category: 'Fun' });
    expect(errors.some(e => e.includes('Category'))).toBe(true);
  });

  test('error for invalid status', () => {
    const errors = validateTask({ title: 'Test', status: 'maybe' });
    expect(errors.some(e => e.includes('Status'))).toBe(true);
  });

  test('no errors for a valid task', () => {
    expect(validateTask({ title: 'Study', category: 'School', status: 'pending' })).toHaveLength(0);
  });
});

// ─── createTask ───────────────────────────────────────────────────────────────

describe('createTask', () => {
  test('creates a task and returns it', async () => {
    const result = await createTask({ title: 'Buy groceries', category: 'Personal' });
    expect(result.success).toBe(true);
    expect(result.task.title).toBe('Buy groceries');
    expect(result.task.id).toBeDefined();
  });

  test('fails when title is missing', async () => {
    const result = await createTask({ category: 'Work' });
    expect(result.success).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
  });

  test('applies default values for optional fields', async () => {
    const result = await createTask({ title: 'Simple task' });
    expect(result.task.category).toBe('General');
    expect(result.task.status).toBe('pending');
    expect(result.task.description).toBe('');
  });
});

// ─── getAllTasks ──────────────────────────────────────────────────────────────

describe('getAllTasks', () => {
  beforeEach(async () => {
    await createTask({ title: 'Work task',     category: 'Work',     status: 'pending' });
    await createTask({ title: 'School task',   category: 'School',   status: 'done'    });
    await createTask({ title: 'Personal task', category: 'Personal', status: 'pending' });
  });

  test('returns all tasks without filters', async () => {
    const tasks = await getAllTasks();
    expect(tasks).toHaveLength(3);
  });

  test('filters by category', async () => {
    const tasks = await getAllTasks('Work');
    expect(tasks).toHaveLength(1);
    expect(tasks[0].category).toBe('Work');
  });

  test('filters by status', async () => {
    const tasks = await getAllTasks(null, 'done');
    expect(tasks).toHaveLength(1);
    expect(tasks[0].status).toBe('done');
  });

  test('filters by category AND status', async () => {
    const tasks = await getAllTasks('Personal', 'pending');
    expect(tasks).toHaveLength(1);
    expect(tasks[0].title).toBe('Personal task');
  });
});

// ─── getTaskById ──────────────────────────────────────────────────────────────

describe('getTaskById', () => {
  test('returns the correct task', async () => {
    const created = await createTask({ title: 'Find me' });
    const found   = await getTaskById(created.task.id);
    expect(found).not.toBeNull();
    expect(found.title).toBe('Find me');
  });

  test('returns null for a non-existent id', async () => {
    const task = await getTaskById(99999);
    expect(task).toBeNull();
  });
});

// ─── updateTask ───────────────────────────────────────────────────────────────

describe('updateTask', () => {
  test('updates title and status', async () => {
    const created = await createTask({ title: 'Old title' });
    const result  = await updateTask(created.task.id, { title: 'New title', status: 'done' });
    expect(result.success).toBe(true);
    expect(result.task.title).toBe('New title');
    expect(result.task.status).toBe('done');
  });

  test('fails for non-existent task', async () => {
    const result = await updateTask(99999, { title: 'Ghost' });
    expect(result.success).toBe(false);
    expect(result.errors).toContain('Task not found');
  });

  test('fails with invalid status', async () => {
    const created = await createTask({ title: 'My task' });
    const result  = await updateTask(created.task.id, { status: 'invalid' });
    expect(result.success).toBe(false);
  });

  test('partial update preserves unchanged fields', async () => {
    const created = await createTask({ title: 'Keep me', category: 'Work' });
    const result  = await updateTask(created.task.id, { status: 'done' });
    expect(result.task.title).toBe('Keep me');
    expect(result.task.category).toBe('Work');
  });
});

// ─── deleteTask ───────────────────────────────────────────────────────────────

describe('deleteTask', () => {
  test('deletes an existing task', async () => {
    const created = await createTask({ title: 'Delete me' });
    const result  = await deleteTask(created.task.id);
    expect(result.success).toBe(true);
    expect(await getTaskById(created.task.id)).toBeNull();
  });

  test('fails when task does not exist', async () => {
    const result = await deleteTask(99999);
    expect(result.success).toBe(false);
    expect(result.errors).toContain('Task not found');
  });
});
