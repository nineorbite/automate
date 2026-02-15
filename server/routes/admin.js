const express = require('express');
const router = express.Router();
const Brand = require('../models/Brand');
const Model = require('../models/Model');
const DropdownOption = require('../models/DropdownOption');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');

// ============= BRANDS =============

// @route   GET /api/admin/brands
// @desc    Get all brands
// @access  Private (All authenticated users)
router.get('/brands', auth, async (req, res) => {
    try {
        const brands = await Brand.find().sort({ name: 1 });
        res.json({
            success: true,
            brands
        });
    } catch (error) {
        console.error('Get brands error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching brands'
        });
    }
});

// @route   POST /api/admin/brands
// @desc    Add new brand
// @access  Private (Admin only)
router.post('/brands', auth, roleCheck('admin'), async (req, res) => {
    try {
        const { name, category } = req.body;

        const brand = new Brand({ name, category });
        await brand.save();

        res.status(201).json({
            success: true,
            message: 'Brand added successfully',
            brand
        });
    } catch (error) {
        console.error('Add brand error:', error);
        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                message: 'Brand already exists'
            });
        }
        res.status(500).json({
            success: false,
            message: 'Error adding brand'
        });
    }
});

// @route   PUT /api/admin/brands/:id
// @desc    Update brand
// @access  Private (Admin only)
router.put('/brands/:id', auth, roleCheck('admin'), async (req, res) => {
    try {
        const brand = await Brand.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        if (!brand) {
            return res.status(404).json({
                success: false,
                message: 'Brand not found'
            });
        }

        res.json({
            success: true,
            message: 'Brand updated successfully',
            brand
        });
    } catch (error) {
        console.error('Update brand error:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating brand'
        });
    }
});

// @route   DELETE /api/admin/brands/:id
// @desc    Delete brand
// @access  Private (Admin only)
router.delete('/brands/:id', auth, roleCheck('admin'), async (req, res) => {
    try {
        const brand = await Brand.findById(req.params.id);

        if (!brand) {
            return res.status(404).json({
                success: false,
                message: 'Brand not found'
            });
        }

        // Check if brand has models
        const modelCount = await Model.countDocuments({ brand: req.params.id });
        if (modelCount > 0) {
            return res.status(400).json({
                success: false,
                message: `Cannot delete brand. It has ${modelCount} associated models.`
            });
        }

        await brand.deleteOne();

        res.json({
            success: true,
            message: 'Brand deleted successfully'
        });
    } catch (error) {
        console.error('Delete brand error:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting brand'
        });
    }
});

// ============= MODELS =============

// @route   GET /api/admin/models
// @desc    Get all models (optionally filter by brand)
// @access  Private (All authenticated users)
router.get('/models', auth, async (req, res) => {
    try {
        const { brand } = req.query;
        const filter = brand ? { brand } : {};

        const models = await Model.find(filter)
            .populate('brand', 'name')
            .sort({ name: 1 });

        res.json({
            success: true,
            models
        });
    } catch (error) {
        console.error('Get models error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching models'
        });
    }
});

// @route   POST /api/admin/models
// @desc    Add new model
// @access  Private (Admin only)
router.post('/models', auth, roleCheck('admin'), async (req, res) => {
    try {
        const { name, brand } = req.body;

        const model = new Model({ name, brand });
        await model.save();
        await model.populate('brand', 'name');

        res.status(201).json({
            success: true,
            message: 'Model added successfully',
            model
        });
    } catch (error) {
        console.error('Add model error:', error);
        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                message: 'Model already exists for this brand'
            });
        }
        res.status(500).json({
            success: false,
            message: 'Error adding model'
        });
    }
});

// @route   PUT /api/admin/models/:id
// @desc    Update model
// @access  Private (Admin only)
router.put('/models/:id', auth, roleCheck('admin'), async (req, res) => {
    try {
        const model = await Model.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        ).populate('brand', 'name');

        if (!model) {
            return res.status(404).json({
                success: false,
                message: 'Model not found'
            });
        }

        res.json({
            success: true,
            message: 'Model updated successfully',
            model
        });
    } catch (error) {
        console.error('Update model error:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating model'
        });
    }
});

// @route   DELETE /api/admin/models/:id
// @desc    Delete model
// @access  Private (Admin only)
router.delete('/models/:id', auth, roleCheck('admin'), async (req, res) => {
    try {
        const model = await Model.findById(req.params.id);

        if (!model) {
            return res.status(404).json({
                success: false,
                message: 'Model not found'
            });
        }

        await model.deleteOne();

        res.json({
            success: true,
            message: 'Model deleted successfully'
        });
    } catch (error) {
        console.error('Delete model error:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting model'
        });
    }
});

// ============= DROPDOWN OPTIONS =============

// @route   GET /api/admin/dropdowns
// @desc    Get all dropdown options
// @access  Private (All authenticated users)
router.get('/dropdowns', auth, async (req, res) => {
    try {
        const dropdowns = await DropdownOption.find();
        res.json({
            success: true,
            dropdowns
        });
    } catch (error) {
        console.error('Get dropdowns error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching dropdown options'
        });
    }
});

// @route   GET /api/admin/dropdowns/:field_name
// @desc    Get dropdown options for specific field
// @access  Private (All authenticated users)
router.get('/dropdowns/:field_name', auth, async (req, res) => {
    try {
        const dropdown = await DropdownOption.findOne({ field_name: req.params.field_name });

        if (!dropdown) {
            return res.status(404).json({
                success: false,
                message: 'Dropdown options not found'
            });
        }

        res.json({
            success: true,
            dropdown
        });
    } catch (error) {
        console.error('Get dropdown error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching dropdown options'
        });
    }
});

// @route   PUT /api/admin/dropdowns/:field_name
// @desc    Update dropdown options
// @access  Private (Admin only)
router.put('/dropdowns/:field_name', auth, roleCheck('admin'), async (req, res) => {
    try {
        const { options } = req.body;

        if (!Array.isArray(options)) {
            return res.status(400).json({
                success: false,
                message: 'Options must be an array'
            });
        }

        let dropdown = await DropdownOption.findOne({ field_name: req.params.field_name });

        if (dropdown) {
            dropdown.options = options;
            dropdown.updatedAt = Date.now();
            await dropdown.save();
        } else {
            dropdown = new DropdownOption({
                field_name: req.params.field_name,
                options
            });
            await dropdown.save();
        }

        res.json({
            success: true,
            message: 'Dropdown options updated successfully',
            dropdown
        });
    } catch (error) {
        console.error('Update dropdown error:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating dropdown options'
        });
    }
});

module.exports = router;
