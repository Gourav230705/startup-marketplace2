const express = require('express');
const router = express.Router();
const {
    getStartups,
    getStartup,
    createStartup,
    updateStartup,
    deleteStartup,
    getAdminStartups,
    updateStartupStatus,
} = require('../controllers/startupController');
const { protect, authorize } = require('../middleware/auth');

router
    .route('/')
    .get(getStartups)
    .post(protect, authorize('owner', 'admin'), createStartup);

router.get('/admin', protect, authorize('admin'), getAdminStartups);
router.put('/:id/status', protect, authorize('admin'), updateStartupStatus);

router
    .route('/:id')
    .get(getStartup)
    .put(protect, authorize('owner', 'admin'), updateStartup)
    .delete(protect, authorize('owner', 'admin'), deleteStartup);

module.exports = router;
