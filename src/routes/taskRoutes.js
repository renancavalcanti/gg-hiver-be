const express = require("express");
const {
  createTask,
  getTasks,
  deleteTask,
  updateTask
} = require("../controllers/taskController");
const { authMiddleware } = require("../middlewares/authMiddleware");

const router = express.Router();

router.use(authMiddleware);

router.post("/", createTask);
router.get("/", getTasks);
router.delete("/:id", deleteTask);
router.patch("/:id", updateTask)

module.exports = router;
