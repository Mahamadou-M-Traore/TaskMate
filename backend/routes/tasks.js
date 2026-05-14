const express = require('express');
const router  = express.Router();
const svc     = require('../services/taskService');

/**
 * @swagger
 * components:
 *   schemas:
 *     Task:
 *       type: object
 *       properties:
 *         id:          { type: integer, example: 1 }
 *         title:       { type: string,  example: "Study for exam" }
 *         description: { type: string,  example: "Chapter 5 and 6" }
 *         category:
 *           type: string
 *           enum: [Work, Personal, School, General]
 *           example: School
 *         status:
 *           type: string
 *           enum: [pending, done]
 *           example: pending
 *         created_at:  { type: string,  example: "2026-05-15 10:30:00" }
 *     TaskInput:
 *       type: object
 *       required: [title]
 *       properties:
 *         title:       { type: string }
 *         description: { type: string }
 *         category:    { type: string, enum: [Work, Personal, School, General] }
 *         status:      { type: string, enum: [pending, done] }
 */

/**
 * @swagger
 * /api/tasks:
 *   get:
 *     summary: Get all tasks (with optional filters)
 *     tags: [Tasks]
 *     parameters:
 *       - in: query
 *         name: category
 *         schema: { type: string, enum: [Work, Personal, School, General] }
 *       - in: query
 *         name: status
 *         schema: { type: string, enum: [pending, done] }
 *     responses:
 *       200:
 *         description: List of tasks
 */
router.get('/', async (req, res) => {
  const tasks = await svc.getAllTasks(req.query.category, req.query.status);
  res.json({ success: true, data: tasks });
});

/**
 * @swagger
 * /api/tasks/{id}:
 *   get:
 *     summary: Get a task by ID
 *     tags: [Tasks]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Task found
 *       404:
 *         description: Not found
 */
router.get('/:id', async (req, res) => {
  const task = await svc.getTaskById(parseInt(req.params.id));
  if (!task) return res.status(404).json({ success: false, message: 'Task not found' });
  res.json({ success: true, data: task });
});

/**
 * @swagger
 * /api/tasks:
 *   post:
 *     summary: Create a new task
 *     tags: [Tasks]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/TaskInput' }
 *     responses:
 *       201:
 *         description: Task created
 *       400:
 *         description: Validation error
 */
router.post('/', async (req, res) => {
  const result = await svc.createTask(req.body);
  if (!result.success) return res.status(400).json({ success: false, errors: result.errors });
  res.status(201).json({ success: true, data: result.task });
});

/**
 * @swagger
 * /api/tasks/{id}:
 *   put:
 *     summary: Update a task
 *     tags: [Tasks]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/TaskInput' }
 *     responses:
 *       200:
 *         description: Task updated
 *       400:
 *         description: Validation error
 *       404:
 *         description: Not found
 */
router.put('/:id', async (req, res) => {
  const result = await svc.updateTask(parseInt(req.params.id), req.body);
  if (!result.success) {
    const status = result.errors.includes('Task not found') ? 404 : 400;
    return res.status(status).json({ success: false, errors: result.errors });
  }
  res.json({ success: true, data: result.task });
});

/**
 * @swagger
 * /api/tasks/{id}:
 *   delete:
 *     summary: Delete a task
 *     tags: [Tasks]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Task deleted
 *       404:
 *         description: Not found
 */
router.delete('/:id', async (req, res) => {
  const result = await svc.deleteTask(parseInt(req.params.id));
  if (!result.success) return res.status(404).json({ success: false, errors: result.errors });
  res.json({ success: true, message: 'Task deleted successfully' });
});

module.exports = router;
