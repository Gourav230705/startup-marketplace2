const ResourceRequest = require('../models/ResourceRequest');
const Resource = require('../models/Resource');

// @desc    Create a new resource request
// @route   POST /api/resource-requests
// @access  Private
exports.createRequest = async (req, res) => {
    try {
        const { resourceId, reason, need } = req.body;

        const resource = await Resource.findById(resourceId);
        if (!resource) {
            return res.status(404).json({ message: 'Resource not found' });
        }

        const request = await ResourceRequest.create({
            user: req.user.id,
            resource: resourceId,
            reason,
            need,
        });

        res.status(201).json(request);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get my resource requests
// @route   GET /api/resource-requests/my
// @access  Private
exports.getMyRequests = async (req, res) => {
    try {
        const requests = await ResourceRequest.find({ user: req.user.id })
            .populate('resource', 'title type image')
            .sort('-createdAt');
        res.json(requests);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
