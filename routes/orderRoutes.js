const express = require('express');
const router = express.Router();
const { createOrder, getMyOrders } = require('../controllers/orderController');
const { protect, authorize } = require('../middleware/auth');

router.post('/:productId', protect, authorize('customer'), createOrder);
router.get('/my', protect, authorize('customer'), getMyOrders);

module.exports = router;
