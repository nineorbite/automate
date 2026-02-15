const mongoose = require('mongoose');

const modelSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    brand: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Brand',
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Compound index to ensure unique model names per brand
modelSchema.index({ name: 1, brand: 1 }, { unique: true });

module.exports = mongoose.model('Model', modelSchema);
