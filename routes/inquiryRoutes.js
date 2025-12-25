const express = require('express');
const router = express.Router();
const {
    createInquiry,
    getInquiriesForStartup,
    getMyInquiries,
    replyToInquiry,
} = require('../controllers/inquiryController');
const { protect, authorize } = require('../middleware/auth');

router.post('/', protect, createInquiry);
router.get('/my', protect, getMyInquiries);
router.post('/:id/reply', protect, authorize('owner'), replyToInquiry);

router.get(
    '/startup/:startupId',
    protect,
    authorize('owner', 'admin'),
    getInquiriesForStartup
);

module.exports = router;
