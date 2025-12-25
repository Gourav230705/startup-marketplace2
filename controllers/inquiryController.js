const Inquiry = require('../models/Inquiry');
const Startup = require('../models/Startup');

// @desc    Create new inquiry
// @route   POST /api/inquiries
// @access  Private (Customer)
exports.createInquiry = async (req, res) => {
    try {
        const { startupId, message } = req.body;

        const startup = await Startup.findById(startupId);

        if (!startup) {
            return res.status(404).json({ message: 'Startup not found' });
        }

        const inquiry = await Inquiry.create({
            sender: req.user._id,
            startup: startupId,
            message,
        });

        res.status(201).json(inquiry);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get inquiries for startup owner
// @route   GET /api/inquiries/startup/:startupId
// @access  Private (Owner)
exports.getInquiriesForStartup = async (req, res) => {
    try {
        const startup = await Startup.findById(req.params.startupId);

        if (!startup) {
            return res.status(404).json({ message: 'Startup not found' });
        }

        // Ensure strictly owner can view messages
        if (startup.owner.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        const inquiries = await Inquiry.find({ startup: req.params.startupId })
            .populate('sender', 'name email')
            .sort('-createdAt');

        res.json(inquiries);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get my inquiries (as customer)
// @route   GET /api/inquiries/my
// @access  Private
exports.getMyInquiries = async (req, res) => {
    try {
        const inquiries = await Inquiry.find({ sender: req.user._id })
            .populate('startup', 'name')
            .sort('-createdAt');

        res.json(inquiries);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Reply to an inquiry
// @route   POST /api/inquiries/:id/reply
// @access  Private (Owner)
exports.replyToInquiry = async (req, res) => {
    try {
        const { reply } = req.body;
        const inquiry = await Inquiry.findById(req.params.id).populate('startup');

        if (!inquiry) {
            return res.status(404).json({ message: 'Inquiry not found' });
        }

        // Verify ownership
        if (inquiry.startup.owner.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: 'Not authorized to reply to this inquiry' });
        }

        inquiry.reply = reply;
        inquiry.repliedAt = Date.now();
        await inquiry.save();

        res.json(inquiry);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

