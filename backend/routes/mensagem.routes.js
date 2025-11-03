const express = require('express');
const router = express.Router();
const { getMensagens, markAsRead } = require('../controllers/mensagemController');
const { protect } = require('../middleware/auth');

router.get('/', protect, getMensagens);
router.put('/:id/read', protect, markAsRead);

module.exports = router;