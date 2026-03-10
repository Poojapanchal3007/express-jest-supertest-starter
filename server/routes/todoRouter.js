import express from "express";  // Import express
import { auth } from "../helper/auth.js";              // Authentication middleware
import * as todoRepo from "../repository/todoRepository.js"; // Repository functions

const router = express.Router();  // Initialize the router

// Define the routes
router.get("/", (req, res) => {
  // Return a copy of all tasks from the repository
  const tasks = todoRepo.getAll();
  res.status(200).json(tasks);
});

router.post("/create", auth, (req, res) => {
  // Ensure the request body has a task object with a description
  const description = req?.body?.task?.description;

  // Validation: Ensure description is not empty and has minimum length
  if (!description || description.length < 3) {
    return res.status(400).json({ error: "Task description must be at least 3 characters long." });
  }

  // Create a new task via repository
  const newTask = todoRepo.create(description);

  // Respond with the created task
  res.status(201).json(newTask);
});

router.delete("/:id", auth, (req, res) => {
  const { id } = req.params;
  const taskId = parseInt(id, 10);

  // Try to remove the task
  const removed = todoRepo.remove(taskId);

  if (!removed) {
    return res.status(404).json({ error: "Task not found" });
  }

  // Task was removed successfully — return 204 No Content
  res.status(204).send();
});

export { router };  // Export the router so it can be used in app.js