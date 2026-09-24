const express = require('express')
const taskController = require('../controllers/taskController')
const authenticate = require('../middleware/authMiddleware')

const router = express.Router()

router.use(authenticate)

router.get('/', taskController.list)
router.post('/', taskController.create)
router.get('/:taskId', taskController.getById)
router.patch('/:taskId', taskController.update)
router.delete('/:taskId', taskController.remove)
router.patch('/:taskId/status', taskController.updateStatus)
router.patch('/:taskId/assignee', taskController.assign)

module.exports = router