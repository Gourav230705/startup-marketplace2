const express = require('express');
const router = express.Router();
const { createRequest, getMyRequests } = require('../controllers/resourceRequestController');
const { protect } = require('../middleware/auth');

router.route('/')
    .post(protect, createRequest);

router.route('/my')
    .get(protect, getMyRequests);

module.exports = router;
