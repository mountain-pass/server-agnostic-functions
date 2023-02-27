import { AgnosticRouter } from '../../../src/common/AgnosticRouter'

export const router = new AgnosticRouter()

router.get('/users/{userId}', (req, res) => res.json({ message: 'hi', ...req.params }))
router.get('/users/{userId}/nothandled', (req, res) => {})
