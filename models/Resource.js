const mongoose = require('mongoose');

const resourceSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    type: {
        type: String,
        enum: ['investor', 'mentor', 'tool', 'general'],
        default: 'general',
    },
    expertise: {
        type: [String],
        default: [],
    },
    image: {
        type: String,
        default: '',
    },
    link: {
        type: String,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model('Resource', resourceSchema);
