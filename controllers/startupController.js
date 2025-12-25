const Startup = require('../models/Startup');

// @desc    Get all startups (Public: Approved only)
// @route   GET /api/startups
// @access  Public
exports.getStartups = async (req, res) => {
    try {
        const startups = await Startup.find({ status: 'approved' }).populate('owner', 'name email');
        res.json(startups);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all startups (Admin)
// @route   GET /api/startups/admin
// @access  Private (Admin)
exports.getAdminStartups = async (req, res) => {
    try {
        const startups = await Startup.find().populate('owner', 'name email').sort('-createdAt');
        res.json(startups);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


// @desc    Get single startup
// @route   GET /api/startups/:id
// @access  Public
exports.getStartup = async (req, res) => {
    try {
        const startup = await Startup.findById(req.params.id).populate(
            'owner',
            'name email'
        );

        if (!startup) {
            return res.status(404).json({ message: 'Startup not found' });
        }

        res.json(startup);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create new startup
// @route   POST /api/startups
// @access  Private (Owner, Admin)
exports.createStartup = async (req, res) => {
    try {
        const {
            name,
            description,
            industry,
            fundingStage,
            website,
            contactEmail,
        } = req.body;

        const startup = await Startup.create({
            name,
            description,
            industry,
            fundingStage,
            website,
            contactEmail,
            owner: req.user._id,
        });

        res.status(201).json(startup);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update startup
// @route   PUT /api/startups/:id
// @access  Private (Owner, Admin)
exports.updateStartup = async (req, res) => {
    try {
        let startup = await Startup.findById(req.params.id);

        if (!startup) {
            return res.status(404).json({ message: 'Startup not found' });
        }

        // Make sure user is startup owner or admin
        if (
            startup.owner.toString() !== req.user._id.toString() &&
            req.user.role !== 'admin'
        ) {
            return res.status(401).json({
                message: `User ${req.user._id} is not authorized to update this startup`,
            });
        }

        startup = await Startup.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
        });

        res.json(startup);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete startup
// @route   DELETE /api/startups/:id
// @access  Private (Owner, Admin)
exports.deleteStartup = async (req, res) => {
    try {
        const startup = await Startup.findById(req.params.id);

        if (!startup) {
            return res.status(404).json({ message: 'Startup not found' });
        }

        // Make sure user is startup owner or admin
        if (
            startup.owner.toString() !== req.user._id.toString() &&
            req.user.role !== 'admin'
        ) {
            return res.status(401).json({
                message: `User ${req.user._id} is not authorized to delete this startup`,
            });
        }

        await startup.deleteOne();

        res.json({ message: 'Startup removed' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update startup status
// @route   PUT /api/startups/:id/status
// @access  Private (Admin)
exports.updateStartupStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const startup = await Startup.findById(req.params.id);

        if (!startup) {
            return res.status(404).json({ message: 'Startup not found' });
        }

        startup.status = status;
        await startup.save();

        res.json(startup);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

