const express = require('express');
const router = express.Router();
const Car = require('../models/Car');
const auth = require('../middleware/auth');
const upload = require('../config/cloudinary');

// @route   GET /api/cars
// @desc    Get all cars with filtering and pagination
// @access  Private
router.get('/', auth, async (req, res) => {
    try {
        const { page = 1, limit = 20, brand, model, fuel_type, transmission, rto, registration_state } = req.query;

        const filter = {};
        if (brand) filter.brand = brand;
        if (model) filter.model = model;
        if (fuel_type) filter.fuel_type = fuel_type;
        if (transmission) filter.transmission = transmission;
        if (rto) filter.rto = rto;
        if (registration_state) filter.registration_state = registration_state;

        const cars = await Car.find(filter)
            .populate('brand', 'name')
            .populate('model', 'name')
            .populate('createdBy', 'email')
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .sort({ createdAt: -1 });

        const count = await Car.countDocuments(filter);

        res.json({
            success: true,
            cars,
            totalPages: Math.ceil(count / limit),
            currentPage: page,
            totalCars: count
        });
    } catch (error) {
        console.error('Get cars error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching cars'
        });
    }
});

// @route   GET /api/cars/:id
// @desc    Get single car by ID
// @access  Private
router.get('/:id', auth, async (req, res) => {
    try {
        const car = await Car.findById(req.params.id)
            .populate('brand', 'name')
            .populate('model', 'name')
            .populate('createdBy', 'email role');

        if (!car) {
            return res.status(404).json({
                success: false,
                message: 'Car not found'
            });
        }

        res.json({
            success: true,
            car
        });
    } catch (error) {
        console.error('Get car error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching car'
        });
    }
});

// @route   POST /api/cars
// @desc    Add new car
// @access  Private (Agent + Admin)
router.post('/', auth, upload.array('images', 10), async (req, res) => {
    try {
        const {
            stock_code,
            brand,
            model,
            variant,
            year_of_manufacture,
            registration_year,
            fuel_type,
            transmission,
            km,
            price,
            ownership,
            registration_state,
            rto,
            plate_number
        } = req.body;

        // Check if stock_code already exists
        const existingCar = await Car.findOne({ $or: [{ stock_code }, { plate_number }] });
        if (existingCar) {
            let message = 'Car already exists';
            if (existingCar.stock_code === stock_code) message = 'Stock code already exists';
            if (existingCar.plate_number === plate_number) message = 'Plate number already exists';

            return res.status(400).json({
                success: false,
                message
            });
        }

        // Get image URLs from Cloudinary response
        const images = req.files ? req.files.map(file => file.path) : [];

        // Validate minimum images (at least 4 required)
        if (images.length < 4) {
            return res.status(400).json({
                success: false,
                message: 'Please upload at least 4 images'
            });
        }

        const car = new Car({
            stock_code,
            plate_number,
            brand,
            model,
            variant,
            year_of_manufacture,
            registration_year,
            fuel_type,
            transmission,
            km,
            price,
            ownership,
            registration_state,
            rto,
            images,
            createdBy: req.user._id
        });

        await car.save();

        await car.populate(['brand', 'model', 'createdBy']);

        res.status(201).json({
            success: true,
            message: 'Car added successfully',
            car
        });
    } catch (error) {
        console.error('Add car error:', error);
        res.status(500).json({
            success: false,
            message: 'Error adding car',
            error: error.message
        });
    }
});

// @route   PUT /api/cars/:id
// @desc    Update car
// @access  Private (Agent + Admin)
router.put('/:id', auth, upload.array('images', 10), async (req, res) => {
    try {
        const car = await Car.findById(req.params.id);

        if (!car) {
            return res.status(404).json({
                success: false,
                message: 'Car not found'
            });
        }

        // Check if updating sensitive fields (stock_code/plate_number) causes duplication
        if (req.body.stock_code || req.body.plate_number) {
            const duplicateCheck = await Car.findOne({
                $and: [
                    { _id: { $ne: req.params.id } },
                    {
                        $or: [
                            { stock_code: req.body.stock_code },
                            { plate_number: req.body.plate_number }
                        ]
                    }
                ]
            });

            if (duplicateCheck) {
                let message = 'Duplicate entry found';
                if (duplicateCheck.stock_code === req.body.stock_code) message = 'Stock code already exists';
                if (duplicateCheck.plate_number === req.body.plate_number) message = 'Plate number already exists';
                return res.status(400).json({ success: false, message });
            }
        }

        let updatedImages = car.images || [];

        // If new files uploaded, add them
        if (req.files && req.files.length > 0) {
            const newImages = req.files.map(file => file.path);
            updatedImages = [...updatedImages, ...newImages];
        }

        // If 'removeImages' array is passed (URLs to remove)
        if (req.body.removeImages) {
            const imagesToRemove = Array.isArray(req.body.removeImages)
                ? req.body.removeImages
                : [req.body.removeImages];
            updatedImages = updatedImages.filter(img => !imagesToRemove.includes(img));
        }

        // Update other fields
        Object.keys(req.body).forEach(key => {
            if (req.body[key] !== undefined && key !== 'images' && key !== 'removeImages') {
                car[key] = req.body[key];
            }
        });

        car.images = updatedImages;

        await car.save();
        await car.populate(['brand', 'model', 'createdBy']);

        res.json({
            success: true,
            message: 'Car updated successfully',
            car
        });
    } catch (error) {
        console.error('Update car error:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating car'
        });
    }
});

// @route   DELETE /api/cars/:id
// @desc    Delete car
// @access  Private (Agent + Admin)
router.delete('/:id', auth, async (req, res) => {
    try {
        const car = await Car.findById(req.params.id);

        if (!car) {
            return res.status(404).json({
                success: false,
                message: 'Car not found'
            });
        }

        await car.deleteOne();

        res.json({
            success: true,
            message: 'Car deleted successfully'
        });
    } catch (error) {
        console.error('Delete car error:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting car'
        });
    }
});

module.exports = router;
