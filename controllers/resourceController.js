const Resource = require('../models/Resource');

// @desc    Get all resources
// @route   GET /api/resources
// @access  Public
exports.getResources = async (req, res) => {
    try {
        const resources = await Resource.find();
        res.json(resources);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create new resource
// @route   POST /api/resources
// @access  Private (Admin)
exports.createResource = async (req, res) => {
    try {
        const { title, description, type, link, expertise, image } = req.body;

        const resource = await Resource.create({
            title,
            description,
            type,
            link,
            expertise: expertise ? expertise.split(',').map(e => e.trim()) : [],
            image,
        });

        res.status(201).json(resource);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete resource
// @route   DELETE /api/resources/:id
// @access  Private (Admin)
exports.deleteResource = async (req, res) => {
    try {
        const resource = await Resource.findById(req.params.id);

        if (!resource) {
            return res.status(404).json({ message: 'Resource not found' });
        }

        await resource.deleteOne();

        res.json({ message: 'Resource removed' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
