const Order = require('../models/Order');
const Product = require('../models/Product');

// @desc    Create an order (Buy product)
// @route   POST /api/orders/:productId
// @access  Private (Customer only)
exports.createOrder = async (req, res) => {
    try {
        const product = await Product.findById(req.params.productId);

        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        // Prevent founder from buying own product
        if (product.createdBy.toString() === req.user.id) {
            return res.status(400).json({ message: 'Cannot buy your own product' });
        }

        const order = new Order({
            product: product._id,
            buyer: req.user.id,
            startup: product.startup,
            price: product.price,
            status: 'completed', // Simulate immediate completion
        });

        await order.save();

        res.status(201).json(order);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get my orders
// @route   GET /api/orders/my
// @access  Private (Customer only)
exports.getMyOrders = async (req, res) => {
    try {
        const orders = await Order.find({ buyer: req.user.id })
            .populate('product', 'name description')
            .populate('startup', 'name')
            .sort({ purchaseDate: -1 });

        res.json(orders);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Server Error' });
    }
};
