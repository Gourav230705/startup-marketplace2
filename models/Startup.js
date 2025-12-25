const mongoose = require('mongoose');

const startupSchema = new mongoose.Schema({
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    name: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    industry: {
        type: String,
        required: true,
    },
    fundingStage: {
        type: String, // e.g., Seed, Series A, Bootstrapped
    },
    website: {
        type: String,
    },
    contactEmail: {
        type: String,
        required: true,
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending',
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model('Startup', startupSchema);
