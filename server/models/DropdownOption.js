const mongoose = require('mongoose');

const dropdownOptionSchema = new mongoose.Schema({
    field_name: {
        type: String,
        required: true,
        unique: true,
        enum: ['fuel_type', 'transmission', 'ownership', 'registration_state']
    },
    options: [{
        type: String,
        required: true
    }],
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('DropdownOption', dropdownOptionSchema);
