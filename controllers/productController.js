const Product = require('../models/Product');
const Startup = require('../models/Startup');

// @desc    Get all products
// @route   GET /api/products
// @access  Public
exports.getProducts = async (req, res) => {
    try {
        let keyword = {};

        if (req.query.search) {
            const matchingStartups = await Startup.find({ name: { $regex: req.query.search, $options: 'i' } });
            const startupIds = matchingStartups.map(s => s._id);

            keyword = {
                $or: [
                    { name: { $regex: req.query.search, $options: 'i' } },
                    { description: { $regex: req.query.search, $options: 'i' } },
                    { startup: { $in: startupIds } }
                ],
            };
        }

        if (req.query.startup) {
            keyword.startup = req.query.startup;
        }

        const products = await Product.find({ ...keyword }).populate('startup', 'name').populate('createdBy', 'name');
        res.status(200).json(products);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Create a product
// @route   POST /api/products
// @access  Private (Owner only)
exports.createProduct = async (req, res) => {
    const { name, description, price, startupId } = req.body;

    try {
        // Check if startup exists and user is owner
        const startup = await Startup.findById(startupId);
        if (!startup) {
            return res.status(404).json({ message: 'Startup not found' });
        }

        if (startup.owner.toString() !== req.user.id) {
            return res.status(401).json({ message: 'Not authorized to add products for this startup' });
        }

        const newProduct = new Product({
            name,
            description,
            price,
            startup: startupId,
            createdBy: req.user.id,
        });

        const product = await newProduct.save();
        res.status(201).json(product);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Private (Owner only)
exports.updateProduct = async (req, res) => {
    const { name, description, price } = req.body;

    try {
        let product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        // Verify ownership
        if (product.createdBy.toString() !== req.user.id) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        product.name = name || product.name;
        product.description = description || product.description;
        product.price = price || product.price;

        await product.save();
        res.json(product);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Private (Owner only)
exports.deleteProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        // Verify ownership
        if (product.createdBy.toString() !== req.user.id) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        await product.deleteOne(); // Use deleteOne() instead of remove()
        res.json({ message: 'Product removed' });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Server Error' });
    }
};
