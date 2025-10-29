const express = require('express');
const router = express.Router();
const {
  getCtes,
  getCte,
  createCte,
  updateCte,
  downloadCte,
  deleteCte
} = require('../controllers/cteController');
const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');
const { cteValidation, validate } = require('../middleware/validators');

router.route('/')
  .get(protect, getCtes)
  .post(protect, upload.single('arquivo'), cteValidation, validate, createCte);

router.route('/:id')
  .get(protect, getCte)
  .put(protect, upload.single('arquivo'), updateCte)
  .delete(protect, authorize('Gerente'), deleteCte);

router.get('/:id/download', protect, downloadCte);

module.exports = router;
