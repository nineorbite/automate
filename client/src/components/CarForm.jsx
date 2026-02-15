import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import axios from 'axios';
import imageCompression from 'browser-image-compression';

const CarForm = ({ car, onSave, onCancel }) => {
    const currentYear = new Date().getFullYear(); // Moved definition to the top

    const [formData, setFormData] = useState({
        stock_code: '',
        brand: '',
        model: '',
        variant: '',
        year_of_manufacture: currentYear,
        registration_year: currentYear,
        fuel_type: '',
        transmission: '',
        km: '',
        price: '',
        ownership: '',
        registration_state: '',
        rto: '',
        plate_number: ''
    });

    // Helper to map State Names to Codes (Common Indian States)
    const getStateCode = (stateName) => {
        const stateMap = {
            'Maharashtra': 'MH',
            'Delhi': 'DL',
            'Karnataka': 'KA',
            'Tamil Nadu': 'TN',
            'Gujarat': 'GJ',
            'West Bengal': 'WB',
            'Rajasthan': 'RJ',
            'Uttar Pradesh': 'UP',
            'Haryana': 'HR',
            'Telangana': 'TS',
            'Andhra Pradesh': 'AP',
            'Kerala': 'KL',
            'Madhya Pradesh': 'MP',
            'Punjab': 'PB',
            'Bihar': 'BR',
            'Odisha': 'OD',
            'Jharkhand': 'JH',
            'Chhattisgarh': 'CG',
            'Assam': 'AS',
            'Himachal Pradesh': 'HP',
            'Uttarakhand': 'UK',
            'Goa': 'GA',
            'Tripura': 'TR',
            'Manipur': 'MN',
            'Meghalaya': 'ML',
            'Nagaland': 'NL',
            'Arunachal Pradesh': 'AR',
            'Mizoram': 'MZ',
            'Sikkim': 'SK',
            'Chandigarh': 'CH',
            'Puducherry': 'PY',
            'Dadra and Nagar Haveli': 'DN',
            'Daman and Diu': 'DD',
            'Lakshadweep': 'LD',
            'Andaman and Nicobar Islands': 'AN',
            'Ladakh': 'LA',
            'Jammu and Kashmir': 'JK'
        };
        return stateMap[stateName] || '';
    };

    const [images, setImages] = useState([]);
    const [existingImages, setExistingImages] = useState([]);
    const [imagesToRemove, setImagesToRemove] = useState([]);
    const [brands, setBrands] = useState([]);
    const [models, setModels] = useState([]);
    const [allModels, setAllModels] = useState([]);
    const [dropdowns, setDropdowns] = useState({});
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchFormData();
    }, []);

    useEffect(() => {
        if (car) {
            setFormData({
                stock_code: car.stock_code || '',
                brand: car.brand?._id || car.brand || '',
                model: car.model?._id || car.model || '',
                variant: car.variant || '',
                year_of_manufacture: car.year_of_manufacture || currentYear,
                registration_year: car.registration_year || currentYear,
                fuel_type: car.fuel_type || '',
                transmission: car.transmission || '',
                km: car.km || '',
                price: car.price || '',
                ownership: car.ownership || '',
                registration_state: car.registration_state || '',
                rto: car.rto || '',
                plate_number: car.plate_number || '', // Critical for uncontrolled input fix
            });
            setExistingImages(car.images || []);
            setImagesToRemove([]);
        }
    }, [car]);

    useEffect(() => {
        if (formData.brand) {
            const filtered = allModels.filter(m => m.brand._id === formData.brand);
            setModels(filtered);
        } else {
            setModels([]);
        }
    }, [formData.brand, allModels]);

    const fetchFormData = async () => {
        try {
            const [brandsRes, modelsRes, dropdownsRes] = await Promise.all([
                axios.get('/api/admin/brands'),
                axios.get('/api/admin/models'),
                axios.get('/api/admin/dropdowns'),
            ]);

            setBrands(brandsRes.data.brands);
            setAllModels(modelsRes.data.models);

            const dropdownMap = {};
            dropdownsRes.data.dropdowns.forEach(d => {
                dropdownMap[d.field_name] = d.options;
            });
            setDropdowns(dropdownMap);
        } catch (err) {
            console.error('Failed to fetch form data:', err);
        }
    };

    const handleChange = (e) => {
        const { name, value, type } = e.target;

        // Clear error when user changes any field
        if (error) setError('');

        if (name === 'stock_code') {
            // Force Uppercase and Alphanumeric
            const cleaned = value.toUpperCase().replace(/[^A-Z0-9]/g, '');
            setFormData(prev => ({ ...prev, [name]: cleaned }));
            return;
        }

        if (name === 'plate_number') {
            // Force Uppercase
            setFormData(prev => ({ ...prev, [name]: value.toUpperCase() }));
            return;
        }

        setFormData(prev => ({
            ...prev,
            [name]: type === 'number' ? Number(value) : value,
            // Reset model when brand changes
            ...(name === 'brand' ? { model: '' } : {})
        }));
    };

    const handleImageChange = async (e) => {
        if (e.target.files && e.target.files.length > 0) {
            const files = Array.from(e.target.files);
            setLoading(true); // Show loading while compressing

            try {
                const compressedFiles = await Promise.all(
                    files.map(async (file) => {
                        // Options for compression
                        const options = {
                            maxSizeMB: 1,          // Max size in MB
                            maxWidthOrHeight: 1920, // Max width/height
                            useWebWorker: true,
                            fileType: 'image/jpeg' // Force convert to JPEG
                        };
                        try {
                            const compressedBlob = await imageCompression(file, options);
                            // Create a new File object from the Blob to keep the name
                            return new File([compressedBlob], file.name, { type: 'image/jpeg' });
                        } catch (error) {
                            console.error('Compression failed for', file.name, error);
                            return file; // Fallback to original if compression fails
                        }
                    })
                );

                setImages(prev => [...prev, ...compressedFiles]);
                if (error) setError('');
            } catch (err) {
                console.error('Error processing images:', err);
                toast.error('Error processing some images');
            } finally {
                setLoading(false);
            }
        }
    };


    const removeNewImage = (index) => {
        setImages(prev => prev.filter((_, i) => i !== index));
    };

    const removeExistingImage = (index) => {
        const imageToRemove = existingImages[index];
        setImagesToRemove(prev => [...prev, imageToRemove]);
        setExistingImages(prev => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        // Validate minimum images
        if (images.length + existingImages.length < 4) {
            toast.error('Please upload at least 4 images of the car.');
            setLoading(false);
            return;
        }

        const data = new FormData();
        Object.keys(formData).forEach(key => {
            data.append(key, formData[key]);
        });

        images.forEach(image => {
            data.append('images', image);
        });

        imagesToRemove.forEach(url => {
            data.append('removeImages', url);
        });

        try {
            if (car) {
                await axios.put(`/api/cars/${car._id}`, data, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                toast.success('Car updated successfully!');
            } else {
                await axios.post('/api/cars', data, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                toast.success('Car added successfully!');
            }
            onSave();
        } catch (err) {
            const errorMessage = err.response?.data?.message || 'Failed to save car';
            toast.error(errorMessage, { duration: 4000 });
            // setError(errorMessage); // Removed inline error state
        } finally {
            setLoading(false);
        }
    };

    const years = Array.from({ length: 30 }, (_, i) => currentYear - i);

    return (
        <div className="card max-w-4xl relative">
            <form onSubmit={handleSubmit} className="space-y-6">
                <fieldset disabled={loading} className="space-y-6 group-disabled:opacity-70 transition-opacity">
                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm mb-6">
                        <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-3">
                            <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 text-sm">
                                01
                            </span>
                            Basic Information
                        </h3>
                        {/* ... rest of the form ... */}
                        {/* I need to make sure I don't delete the content inside. 
                           Actually, I should just wrap the inner content or apply the disabled prop to the fieldset wrapping the whole thing.
                           The current structure is:
                           <form>
                              <div ... Basic Info>
                              <div ... Technical>
                              <div ... Price>
                              <div ... Images>
                              <div ... Actions>
                           </form>
                           
                           I will wrap the DIVs inside a fieldset? Or just make the form acts as one?
                           HTML5 form attributes doesn't automatically disable children if form has no disable.
                           Fieldset is best.
                        */}

                        {/* Basic Information */}
                        <div className="bg-gray-50 p-4 rounded-lg border border-gray-100 mb-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                <span className="w-1 h-6 bg-primary-500 rounded-full"></span>
                                Basic Information
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Stock Code */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Stock Code *
                                    </label>
                                    <input
                                        type="text"
                                        name="stock_code"
                                        value={formData.stock_code}
                                        onChange={handleChange}
                                        className="input-field disabled:bg-gray-100 disabled:text-gray-500"
                                        placeholder="e.g., CAR01"
                                        required
                                        disabled={!!car || loading}
                                    />
                                    <p className="text-xs text-gray-500 mt-1">Uppercase alphanumeric only (Auto-formatted)</p>
                                </div>

                                {/* Brand */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Brand *
                                    </label>
                                    <select
                                        name="brand"
                                        value={formData.brand}
                                        onChange={handleChange}
                                        className="input-field disabled:bg-gray-100 disabled:text-gray-500"
                                        required
                                        disabled={loading}
                                    >
                                        <option value="">Select Brand</option>
                                        {brands.map(brand => (
                                            <option key={brand._id} value={brand._id}>
                                                {brand.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Model */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Model *
                                    </label>
                                    <select
                                        name="model"
                                        value={formData.model}
                                        onChange={handleChange}
                                        className="input-field disabled:bg-gray-100 disabled:text-gray-500"
                                        required
                                        disabled={!formData.brand || loading}
                                    >
                                        <option value="">Select Model</option>
                                        {models.map(model => (
                                            <option key={model._id} value={model._id}>
                                                {model.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Variant - Manually Editable */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Variant * <span className="text-primary-600 text-xs">(Manual Entry)</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="variant"
                                        value={formData.variant}
                                        onChange={handleChange}
                                        className="input-field disabled:bg-gray-100 disabled:text-gray-500"
                                        placeholder="e.g., VX, ZXI, Sportz"
                                        required
                                        disabled={loading}
                                    />
                                </div>

                                {/* Year of Manufacture */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Year of Manufacture *
                                    </label>
                                    <select
                                        name="year_of_manufacture"
                                        value={formData.year_of_manufacture}
                                        onChange={handleChange}
                                        className="input-field disabled:bg-gray-100 disabled:text-gray-500"
                                        required
                                        disabled={loading}
                                    >
                                        {years.map(year => (
                                            <option key={year} value={year}>{year}</option>
                                        ))}
                                    </select>
                                </div>

                            </div>
                        </div>

                        {/* Technical Details */}
                        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm mb-6">
                            <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-3">
                                <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 text-sm">
                                    02
                                </span>
                                Technical Details
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Registration Year */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Registration Year *
                                    </label>
                                    <select
                                        name="registration_year"
                                        value={formData.registration_year}
                                        onChange={handleChange}
                                        className="input-field disabled:bg-gray-100 disabled:text-gray-500"
                                        required
                                        disabled={loading}
                                    >
                                        {years.map(year => (
                                            <option key={year} value={year}>{year}</option>
                                        ))}
                                    </select>
                                </div>

                                {/* Fuel Type */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Fuel Type *
                                    </label>
                                    <select
                                        name="fuel_type"
                                        value={formData.fuel_type}
                                        onChange={handleChange}
                                        className="input-field disabled:bg-gray-100 disabled:text-gray-500"
                                        required
                                        disabled={loading}
                                    >
                                        <option value="">Select Fuel Type</option>
                                        {(dropdowns.fuel_type || []).map(option => (
                                            <option key={option} value={option}>{option}</option>
                                        ))}
                                    </select>
                                </div>

                                {/* Transmission */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Transmission *
                                    </label>
                                    <select
                                        name="transmission"
                                        value={formData.transmission}
                                        onChange={handleChange}
                                        className="input-field disabled:bg-gray-100 disabled:text-gray-500"
                                        required
                                        disabled={loading}
                                    >
                                        <option value="">Select Transmission</option>
                                        {(dropdowns.transmission || []).map(option => (
                                            <option key={option} value={option}>{option}</option>
                                        ))}
                                    </select>
                                </div>

                                {/* KM - Manually Editable */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Kilometers * <span className="text-primary-600 text-xs">(Manual Entry)</span>
                                    </label>
                                    <input
                                        type="number"
                                        name="km"
                                        value={formData.km}
                                        onChange={handleChange}
                                        className="input-field disabled:bg-gray-100 disabled:text-gray-500"
                                        placeholder="e.g., 45000"
                                        required
                                        disabled={loading}
                                    />
                                </div>

                            </div>
                        </div>

                        {/* Price & Registration */}
                        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm mb-6">
                            <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-3">
                                <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-amber-50 text-amber-600 text-sm">
                                    03
                                </span>
                                Price & Registration
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Price - Manually Editable */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Price (₹) * <span className="text-primary-600 text-xs">(Manual Entry)</span>
                                    </label>
                                    <input
                                        type="number"
                                        name="price"
                                        value={formData.price}
                                        onChange={handleChange}
                                        className="input-field disabled:bg-gray-100 disabled:text-gray-500"
                                        placeholder="e.g., 750000"
                                        required
                                        disabled={loading}
                                    />
                                </div>

                                {/* Ownership */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Ownership *
                                    </label>
                                    <select
                                        name="ownership"
                                        value={formData.ownership}
                                        onChange={handleChange}
                                        className="input-field disabled:bg-gray-100 disabled:text-gray-500"
                                        required
                                        disabled={loading}
                                    >
                                        <option value="">Select Ownership</option>
                                        {(dropdowns.ownership || []).map(option => (
                                            <option key={option} value={option}>{option}</option>
                                        ))}
                                    </select>
                                </div>

                                {/* Registration State */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Registration State *
                                    </label>
                                    <select
                                        name="registration_state"
                                        value={formData.registration_state}
                                        onChange={handleChange}
                                        className="input-field disabled:bg-gray-100 disabled:text-gray-500"
                                        required
                                        disabled={loading}
                                    >
                                        <option value="">Select State</option>
                                        {(dropdowns.registration_state || []).map(option => (
                                            <option key={option} value={option}>{option}</option>
                                        ))}
                                    </select>
                                </div>

                                {/* RTO - Manual Entry (Number) */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        RTO (Code) * <span className="text-primary-600 text-xs">(e.g., 12, 63)</span>
                                    </label>
                                    <input
                                        type="number"
                                        name="rto"
                                        value={formData.rto}
                                        onChange={handleChange}
                                        className="input-field disabled:bg-gray-100 disabled:text-gray-500"
                                        placeholder="e.g., 12"
                                        required
                                        disabled={loading}
                                    />
                                </div>

                                {/* Vehicle Plate Number */}
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Vehicle Number * <span className="text-primary-600 text-xs">(Auto-generated from State/RTO)</span>
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            name="plate_number"
                                            value={formData.plate_number}
                                            onChange={handleChange}
                                            className="input-field disabled:bg-gray-100 disabled:text-gray-500 uppercase font-mono tracking-wider"
                                            placeholder="MH 12 AB 1234"
                                            required
                                            disabled={loading}
                                        />
                                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                            <span className="text-gray-400 text-sm">IND</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Car Images */}
                        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm mb-6">
                            <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-3">
                                <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-purple-50 text-purple-600 text-sm">
                                    04
                                </span>
                                Car Images
                            </h3>

                            {/* Images Upload */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Upload Images <span className="text-gray-500 text-xs">(Min 4, Max 10)</span>
                                </label>
                                <div className={`mt-1 flex justify-center px-6 pt-8 pb-10 border-2 border-gray-200 border-dashed rounded-2xl transition-all duration-200 bg-gray-50/50 ${loading ? 'opacity-50 cursor-not-allowed' : 'hover:border-indigo-400 hover:bg-indigo-50/30 group'}`}>
                                    <div className="space-y-2 text-center">
                                        <div className="w-16 h-16 bg-white rounded-2xl shadow-sm border border-gray-100 flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform duration-300">
                                            <span className="text-3xl">📸</span>
                                        </div>
                                        <div className="flex text-sm text-gray-600 justify-center mt-2">
                                            <label
                                                htmlFor="file-upload"
                                                className={`relative cursor-pointer font-bold text-indigo-600 focus-within:outline-none ${!loading && 'hover:text-indigo-500'}`}
                                            >
                                                <span>Upload files</span>
                                                <input
                                                    id="file-upload"
                                                    name="file-upload"
                                                    type="file"
                                                    multiple
                                                    accept="image/*"
                                                    className="sr-only"
                                                    onChange={handleImageChange}
                                                    disabled={loading}
                                                />
                                            </label>
                                            <p className="pl-1">or drag and drop</p>
                                        </div>
                                        <p className="text-xs text-gray-500">
                                            PNG, JPG, GIF up to 10MB
                                        </p>
                                    </div>
                                </div>

                                {/* Selected New Images Preview */}
                                {images.length > 0 && (
                                    <div className="mt-4">
                                        <p className="text-sm font-medium text-gray-700 mb-2">Selected New Images:</p>
                                        <div className="flex gap-3 flex-wrap">
                                            {images.map((file, idx) => (
                                                <div key={idx} className="relative group w-24 h-24">
                                                    <img
                                                        src={URL.createObjectURL(file)}
                                                        alt={`New ${idx}`}
                                                        className="w-full h-full object-cover rounded-lg border border-gray-200 shadow-sm"
                                                    />
                                                    {!loading && (
                                                        <button
                                                            type="button"
                                                            onClick={() => removeNewImage(idx)}
                                                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-md hover:bg-red-600 transition-colors"
                                                            title="Remove image"
                                                        >
                                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                                                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                                            </svg>
                                                        </button>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Existing Images Preview (if editing) */}
                                {existingImages.length > 0 && (
                                    <div className="mt-4 pt-4 border-t border-gray-100">
                                        <p className="text-sm font-medium text-gray-700 mb-2">Previous Images:</p>
                                        <div className="flex gap-3 flex-wrap">
                                            {existingImages.map((img, idx) => (
                                                <div key={idx} className="relative group w-24 h-24">
                                                    <img src={img} alt={`Car ${idx}`} className="w-full h-full object-cover rounded-lg border border-gray-200 shadow-sm" />
                                                    {!loading && (
                                                        <button
                                                            type="button"
                                                            onClick={() => removeExistingImage(idx)}
                                                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-md hover:bg-red-600 transition-colors"
                                                            title="Remove image"
                                                        >
                                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                                                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                                            </svg>
                                                        </button>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </fieldset>

                {/* Form Actions */}
                <div className="flex gap-3 pt-4 border-t border-gray-200">
                    <button
                        type="submit"
                        disabled={loading}
                        className="btn btn-primary flex-1 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {loading ? (
                            <>
                                <svg className="animate-spin -ml-1 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                {/* Check if we are checking images or submitting */}
                                {images.length === 0 && !car && loading ? 'Processing Images...' : (car ? 'Updating Car...' : 'Adding Car...')}
                            </>
                        ) : (
                            car ? 'Update Car' : 'Add Car'
                        )}
                    </button>
                    <button
                        type="button"
                        onClick={onCancel}
                        disabled={loading}
                        className="btn btn-secondary flex-1 disabled:opacity-70"
                    >
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    );
};

export default CarForm;
