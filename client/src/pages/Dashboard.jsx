import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import CarList from '../components/CarList';
import CarForm from '../components/CarForm';
import AdminPanel from '../components/AdminPanel';

const Dashboard = () => {
    const { user, logout, isAdmin } = useAuth();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('cars');
    const [editingCar, setEditingCar] = useState(null);
    const [showCarForm, setShowCarForm] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const handleAddCar = () => {
        setEditingCar(null);
        setShowCarForm(true);
        setActiveTab('add-car');
    };

    const handleEditCar = (car) => {
        setEditingCar(car);
        setShowCarForm(true);
        setActiveTab('add-car');
    };

    const handleCarSaved = () => {
        setShowCarForm(false);
        setEditingCar(null);
        setActiveTab('cars');
    };

    const handleCancelForm = () => {
        setShowCarForm(false);
        setEditingCar(null);
        setActiveTab('cars');
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white shadow-md z-10 sticky top-0">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="bg-primary-600 p-2 rounded-lg shadow-lg">
                            <span className="text-2xl">🚗</span>
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 tracking-tight leading-none">
                                Automate <span className="text-primary-600">By NineOrbite</span>
                            </h1>
                            <p className="text-xs text-gray-500 font-medium tracking-wide uppercase mt-1">
                                Premium Car Management
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-6">
                        <div className="text-right hidden sm:block">
                            <p className="text-sm font-medium text-gray-900">{user?.email}</p>
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-50 text-primary-700 mt-0.5">
                                {user?.role?.toUpperCase()}
                            </span>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors border border-gray-200"
                        >
                            Logout
                        </button>
                    </div>
                </div>
            </header>

            {/* Navigation Tabs */}
            <div className="bg-white border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <nav className="flex space-x-8" aria-label="Tabs">
                        <button
                            onClick={() => setActiveTab('cars')}
                            className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'cars'
                                ? 'border-primary-500 text-primary-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                        >
                            All Cars
                        </button>
                        {isAdmin && (
                            <button
                                onClick={() => setActiveTab('admin')}
                                className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'admin'
                                    ? 'border-primary-500 text-primary-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    }`}
                            >
                                Admin Panel
                            </button>
                        )}
                    </nav>
                </div>
            </div>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {activeTab === 'cars' && (
                    <div>
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-semibold text-gray-900">Car Inventory</h2>
                            <button onClick={handleAddCar} className="btn btn-primary">
                                + Add New Car
                            </button>
                        </div>
                        <CarList onEdit={handleEditCar} />
                    </div>
                )}

                {activeTab === 'add-car' && showCarForm && (
                    <div>
                        <h2 className="text-xl font-semibold text-gray-900 mb-6">
                            {editingCar ? 'Edit Car' : 'Add New Car'}
                        </h2>
                        <CarForm
                            car={editingCar}
                            onSave={handleCarSaved}
                            onCancel={handleCancelForm}
                        />
                    </div>
                )}

                {activeTab === 'admin' && isAdmin && (
                    <div>
                        <h2 className="text-xl font-semibold text-gray-900 mb-6">Admin Panel</h2>
                        <AdminPanel />
                    </div>
                )}
            </main>
        </div>
    );
};

export default Dashboard;
