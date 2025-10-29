const express = require('express');
const router = express.Router();
const {
  getStats,
  getUrgentMaintenances,
  getRecentActivities,
  getMaintenancesChart
} = require('../controllers/dashboardController');
const { protect } = require('../middleware/auth');

router.get('/stats', protect, getStats);
router.get('/urgent-maintenances', protect, getUrgentMaintenances);
router.get('/recent-activities', protect, getRecentActivities);
router.get('/maintenances-chart', protect, getMaintenancesChart);

module.exports = router;