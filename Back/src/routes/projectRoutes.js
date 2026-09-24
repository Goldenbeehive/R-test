const express = require('express')
const projectController = require('../controllers/projectController')
const authenticate = require('../middleware/authMiddleware')

const router = express.Router()

router.use(authenticate)

router.get('/', projectController.list)
router.post('/', projectController.create)
router.get('/:projectId', projectController.getById)
router.patch('/:projectId', projectController.update)
router.delete('/:projectId', projectController.remove)
router.get('/:projectId/members', projectController.listMembers)
router.post('/:projectId/members', projectController.addMember)
router.delete('/:projectId/members/:memberId', projectController.removeMember)

module.exports = router