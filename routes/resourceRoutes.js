const express = require('express');
const router = express.Router();
const {
    getResources,
    createResource,
    deleteResource,
} = require('../controllers/resourceController');
const { protect, authorize } = require('../middleware/auth');

router
    .route('/')
    .get(getResources)
    .post(protect, authorize('admin'), createResource);

router.route('/:id').delete(protect, authorize('admin'), deleteResource);

module.exports = router;
