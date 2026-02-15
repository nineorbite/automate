import { useState, useEffect } from 'react';
import axios from 'axios';

const AdminPanel = () => {
    const [activeSection, setActiveSection] = useState('brands');
    const [brands, setBrands] = useState([]);
    const [models, setModels] = useState([]);
    const [allModels, setAllModels] = useState([]);
    const [dropdowns, setDropdowns] = useState([]);
    const [loading, setLoading] = useState(false);

    // Brand form
    const [brandForm, setBrandForm] = useState({ name: '', category: 'regular' });
    const [editingBrand, setEditingBrand] = useState(null);

    // Model form
    const [modelForm, setModelForm] = useState({ name: '', brand: '' });
    const [editingModel, setEditingModel] = useState(null);

    // Dropdown form
    const [selectedDropdown, setSelectedDropdown] = useState('');
    const [dropdownOptions, setDropdownOptions] = useState('');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [brandsRes, modelsRes, dropdownsRes] = await Promise.all([
                axios.get('/api/admin/brands'),
                axios.get('/api/admin/models'),
                axios.get('/api/admin/dropdowns'),
            ]);

            setBrands(brandsRes.data.brands);
            setAllModels(modelsRes.data.models);
            setDropdowns(dropdownsRes.data.dropdowns);
        } catch (err) {
            console.error('Failed to fetch admin data:', err);
        } finally {
            setLoading(false);
        }
    };

    // Brand Management
    const handleBrandSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingBrand) {
                await axios.put(`/api/admin/brands/${editingBrand._id}`, brandForm);
            } else {
                await axios.post('/api/admin/brands', brandForm);
            }
            setBrandForm({ name: '', category: 'regular' });
            setEditingBrand(null);
            fetchData();
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to save brand');
        }
    };

    const handleDeleteBrand = async (id) => {
        if (!window.confirm('Delete this brand?')) return;
        try {
            await axios.delete(`/api/admin/brands/${id}`);
            fetchData();
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to delete brand');
        }
    };

    const handleEditBrand = (brand) => {
        setEditingBrand(brand);
        setBrandForm({ name: brand.name, category: brand.category });
    };

    // Model Management
    const handleModelSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingModel) {
                await axios.put(`/api/admin/models/${editingModel._id}`, modelForm);
            } else {
                await axios.post('/api/admin/models', modelForm);
            }
            setModelForm({ name: '', brand: '' });
            setEditingModel(null);
            fetchData();
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to save model');
        }
    };

    const handleDeleteModel = async (id) => {
        if (!window.confirm('Delete this model?')) return;
        try {
            await axios.delete(`/api/admin/models/${id}`);
            fetchData();
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to delete model');
        }
    };

    const handleEditModel = (model) => {
        setEditingModel(model);
        setModelForm({ name: model.name, brand: model.brand._id });
    };

    // Dropdown Management
    const handleDropdownSubmit = async (e) => {
        e.preventDefault();
        try {
            const options = dropdownOptions.split(',').map(opt => opt.trim()).filter(opt => opt);
            await axios.put(`/api/admin/dropdowns/${selectedDropdown}`, { options });
            setSelectedDropdown('');
            setDropdownOptions('');
            fetchData();
        } catch (err) {
            alert('Failed to update dropdown options');
        }
    };

    const loadDropdownOptions = (fieldName) => {
        const dropdown = dropdowns.find(d => d.field_name === fieldName);
        if (dropdown) {
            setSelectedDropdown(fieldName);
            setDropdownOptions(dropdown.options.join(', '));
        }
    };

    return (
        <div className="space-y-6">
            {/* Section Tabs */}
            <div className="flex gap-2 flex-wrap">
                <button
                    onClick={() => setActiveSection('brands')}
                    className={`btn ${activeSection === 'brands' ? 'btn-primary' : 'btn-secondary'}`}
                >
                    Brands
                </button>
                <button
                    onClick={() => setActiveSection('models')}
                    className={`btn ${activeSection === 'models' ? 'btn-primary' : 'btn-secondary'}`}
                >
                    Models
                </button>
                <button
                    onClick={() => setActiveSection('dropdowns')}
                    className={`btn ${activeSection === 'dropdowns' ? 'btn-primary' : 'btn-secondary'}`}
                >
                    Dropdowns
                </button>
            </div>

            {/* Brand Management */}
            {activeSection === 'brands' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="card">
                        <h3 className="text-lg font-semibold mb-4">
                            {editingBrand ? 'Edit Brand' : 'Add New Brand'}
                        </h3>
                        <form onSubmit={handleBrandSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Brand Name</label>
                                <input
                                    type="text"
                                    value={brandForm.name}
                                    onChange={(e) => setBrandForm({ ...brandForm, name: e.target.value })}
                                    className="input-field"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                                <select
                                    value={brandForm.category}
                                    onChange={(e) => setBrandForm({ ...brandForm, category: e.target.value })}
                                    className="input-field"
                                >
                                    <option value="regular">Regular</option>
                                    <option value="luxury">Luxury</option>
                                </select>
                            </div>
                            <div className="flex gap-2">
                                <button type="submit" className="btn btn-primary flex-1">
                                    {editingBrand ? 'Update' : 'Add'} Brand
                                </button>
                                {editingBrand && (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setEditingBrand(null);
                                            setBrandForm({ name: '', category: 'regular' });
                                        }}
                                        className="btn btn-secondary"
                                    >
                                        Cancel
                                    </button>
                                )}
                            </div>
                        </form>
                    </div>

                    <div className="card">
                        <h3 className="text-lg font-semibold mb-4">All Brands ({brands.length})</h3>
                        <div className="space-y-2 max-h-96 overflow-y-auto">
                            {brands.map(brand => (
                                <div key={brand._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                    <div>
                                        <span className="font-medium">{brand.name}</span>
                                        <span className="ml-2 text-xs text-gray-500">({brand.category})</span>
                                    </div>
                                    <div className="flex gap-2">
                                        <button onClick={() => handleEditBrand(brand)} className="text-primary-600 hover:text-primary-800 text-sm">
                                            Edit
                                        </button>
                                        <button onClick={() => handleDeleteBrand(brand._id)} className="text-red-600 hover:text-red-800 text-sm">
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Model Management */}
            {activeSection === 'models' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="card">
                        <h3 className="text-lg font-semibold mb-4">
                            {editingModel ? 'Edit Model' : 'Add New Model'}
                        </h3>
                        <form onSubmit={handleModelSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Brand</label>
                                <select
                                    value={modelForm.brand}
                                    onChange={(e) => setModelForm({ ...modelForm, brand: e.target.value })}
                                    className="input-field"
                                    required
                                >
                                    <option value="">Select Brand</option>
                                    {brands.map(brand => (
                                        <option key={brand._id} value={brand._id}>{brand.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Model Name</label>
                                <input
                                    type="text"
                                    value={modelForm.name}
                                    onChange={(e) => setModelForm({ ...modelForm, name: e.target.value })}
                                    className="input-field"
                                    required
                                />
                            </div>
                            <div className="flex gap-2">
                                <button type="submit" className="btn btn-primary flex-1">
                                    {editingModel ? 'Update' : 'Add'} Model
                                </button>
                                {editingModel && (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setEditingModel(null);
                                            setModelForm({ name: '', brand: '' });
                                        }}
                                        className="btn btn-secondary"
                                    >
                                        Cancel
                                    </button>
                                )}
                            </div>
                        </form>
                    </div>

                    <div className="card">
                        <h3 className="text-lg font-semibold mb-4">All Models ({allModels.length})</h3>
                        <div className="space-y-2 max-h-96 overflow-y-auto">
                            {allModels.map(model => (
                                <div key={model._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                    <div>
                                        <span className="font-medium">{model.name}</span>
                                        <span className="ml-2 text-xs text-gray-500">({model.brand?.name})</span>
                                    </div>
                                    <div className="flex gap-2">
                                        <button onClick={() => handleEditModel(model)} className="text-primary-600 hover:text-primary-800 text-sm">
                                            Edit
                                        </button>
                                        <button onClick={() => handleDeleteModel(model._id)} className="text-red-600 hover:text-red-800 text-sm">
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Dropdown Management */}
            {activeSection === 'dropdowns' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="card">
                        <h3 className="text-lg font-semibold mb-4">Manage Dropdown Options</h3>
                        <form onSubmit={handleDropdownSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Select Field</label>
                                <select
                                    value={selectedDropdown}
                                    onChange={(e) => loadDropdownOptions(e.target.value)}
                                    className="input-field"
                                    required
                                >
                                    <option value="">Choose a field</option>
                                    <option value="fuel_type">Fuel Type</option>
                                    <option value="transmission">Transmission</option>
                                    <option value="ownership">Ownership</option>
                                    <option value="registration_state">Registration State</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Options (comma separated)
                                </label>
                                <textarea
                                    value={dropdownOptions}
                                    onChange={(e) => setDropdownOptions(e.target.value)}
                                    className="input-field"
                                    rows="4"
                                    placeholder="e.g., Petrol, Diesel, CNG"
                                    required
                                />
                            </div>
                            <button type="submit" className="btn btn-primary w-full">
                                Update Options
                            </button>
                        </form>
                    </div>

                    <div className="card">
                        <h3 className="text-lg font-semibold mb-4">Current Dropdown Options</h3>
                        <div className="space-y-4">
                            {dropdowns.map(dropdown => (
                                <div key={dropdown.field_name} className="border-b pb-4 last:border-b-0">
                                    <h4 className="font-medium text-gray-900 mb-2">
                                        {dropdown.field_name.replace(/_/g, ' ').toUpperCase()}
                                    </h4>
                                    <div className="flex flex-wrap gap-2">
                                        {dropdown.options.map(option => (
                                            <span key={option} className="px-2 py-1 bg-primary-100 text-primary-800 text-xs rounded">
                                                {option}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminPanel;
