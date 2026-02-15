const mongoose = require('mongoose');

const carSchema = new mongoose.Schema({
    stock_code: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        uppercase: true
    },
    plate_number: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        uppercase: true
    },
    brand: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Brand',
        required: true
    },
    model: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Model',
        required: true
    },
    variant: {
        type: String,
        required: true,
        trim: true
    },
    year_of_manufacture: {
        type: Number,
        required: true
    },
    registration_year: {
        type: Number,
        required: true
    },
    fuel_type: {
        type: String,
        required: true
    },
    transmission: {
        type: String,
        required: true
    },
    km: {
        type: Number,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    ownership: {
        type: String,
        required: true
    },
    registration_state: {
        type: String,
        required: true
    },
    rto: {
        type: String,
        required: true,
        trim: true
    },
    insurance_valid_till: {
        type: Date,
        required: false
    },
    images: [{
        type: String, // Cloudinary URLs
    }],
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Car', carSchema);
