import { useState, useEffect } from 'react';
import axios from 'axios';

const CarList = ({ onEdit }) => {
    const [cars, setCars] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [filter, setFilter] = useState({ brand: '', model: '', fuel_type: '', transmission: '' });

    // Gallery State
    const [galleryCar, setGalleryCar] = useState(null);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    useEffect(() => {
        fetchCars();
    }, []);

    // Keyboard Navigation for Gallery
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (!galleryCar) return;
            if (e.key === 'Escape') closeGallery();
            if (e.key === 'ArrowRight') nextImage();
            if (e.key === 'ArrowLeft') prevImage();
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [galleryCar, currentImageIndex]);

    const fetchCars = async () => {
        try {
            setLoading(true);
            const params = {};
            if (filter.brand) params.brand = filter.brand;
            if (filter.model) params.model = filter.model;
            if (filter.fuel_type) params.fuel_type = filter.fuel_type;
            if (filter.transmission) params.transmission = filter.transmission;

            const response = await axios.get('/api/cars', { params });
            setCars(response.data.cars);
            setError('');
        } catch (err) {
            setError('Failed to fetch cars');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this car?')) return;

        try {
            await axios.delete(`/api/cars/${id}`);
            setCars(cars.filter(car => car._id !== id));
        } catch (err) {
            alert('Failed to delete car');
            console.error(err);
        }
    };

    const openGallery = (car) => {
        setGalleryCar(car);
        setCurrentImageIndex(0);
        document.body.style.overflow = 'hidden'; // Prevent background scrolling
    };

    const closeGallery = () => {
        setGalleryCar(null);
        setCurrentImageIndex(0);
        document.body.style.overflow = 'unset';
    };

    const nextImage = () => {
        if (galleryCar?.images?.length) {
            setCurrentImageIndex((prev) => (prev + 1) % galleryCar.images.length);
        }
    };

    const prevImage = () => {
        if (galleryCar?.images?.length) {
            setCurrentImageIndex((prev) => (prev - 1 + galleryCar.images.length) % galleryCar.images.length);
        }
    };

    // Skeleton Component
    const CarSkeleton = () => (
        <div className="card group p-0 overflow-hidden border-0 shadow-sm animate-pulse">
            <div className="flex flex-col md:flex-row h-full">
                <div className="w-full md:w-72 lg:w-80 h-56 md:h-auto bg-gray-200" />
                <div className="flex-1 p-6 space-y-6">
                    <div>
                        <div className="flex justify-between items-start mb-4">
                            <div className="space-y-2">
                                <div className="h-3 w-16 bg-gray-200 rounded-full" />
                                <div className="h-8 w-48 bg-gray-200 rounded-xl" />
                            </div>
                            <div className="h-8 w-24 bg-gray-200 rounded-xl" />
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                            {[...Array(6)].map((_, i) => (
                                <div key={i} className="h-10 bg-gray-100 rounded-lg" />
                            ))}
                        </div>
                    </div>
                    <div className="flex gap-3 pt-5 border-t border-gray-100">
                        <div className="h-10 flex-1 bg-gray-100 rounded-xl" />
                        <div className="h-10 flex-1 bg-gray-100 rounded-xl" />
                    </div>
                </div>
            </div>
        </div>
    );

    if (loading) {
        return (
            <div className="space-y-4">
                {[...Array(3)].map((_, i) => <CarSkeleton key={i} />)}
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                    {error}
                </div>
            )}

            {/* Cars Grid/List */}
            <div className="grid gap-4">
                {cars.length === 0 ? (
                    <div className="card text-center py-16 bg-white border border-dashed border-gray-300 rounded-3xl">
                        <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                            <span className="text-4xl">🚗</span>
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">No cars found</h3>
                        <p className="text-gray-500 max-w-sm mx-auto">Click the "Add New Car" button to start building your inventory.</p>
                    </div>
                ) : (
                    cars.map((car) => (
                        <div key={car._id} className="card group p-0 overflow-hidden border-0 shadow-sm hover:shadow-xl transition-all duration-300">
                            <div className="flex flex-col md:flex-row h-full">
                                {/* Car Image - Clickable for Gallery */}
                                <div
                                    className="w-full md:w-72 lg:w-80 h-56 md:h-auto relative cursor-pointer overflow-hidden"
                                    onClick={() => openGallery(car)}
                                >
                                    {car.images && car.images.length > 0 ? (
                                        <img
                                            src={car.images[0]}
                                            alt={`${car.brand?.name} ${car.model?.name}`}
                                            className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700 ease-out"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 bg-gray-100">
                                            <span className="text-4xl mb-2 opacity-30">📷</span>
                                            <span className="text-sm font-medium opacity-50">No Image</span>
                                        </div>
                                    )}

                                    {/* Overlay Gradient on Image */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-60 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-300"></div>

                                    <div className="absolute top-3 left-3 px-3 py-1 bg-white/90 backdrop-blur-md text-gray-900 text-xs font-bold rounded-full shadow-sm">
                                        {car.stock_code}
                                    </div>

                                    {/* View Gallery Badge */}
                                    <div className="absolute bottom-3 right-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                                        <span className="bg-white/90 text-gray-900 px-3 py-1.5 rounded-full text-xs font-bold backdrop-blur-md shadow-sm flex items-center gap-1.5">
                                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                            View Photos
                                        </span>
                                    </div>
                                </div>

                                <div className="flex-1 flex flex-col justify-between p-6 bg-white relative">
                                    <div>
                                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-5">
                                            <div>
                                                <div className="text-xs font-bold text-indigo-600 mb-1 uppercase tracking-wider">{car.brand?.name}</div>
                                                <h3 className="text-2xl font-bold text-gray-900 group-hover:text-indigo-600 transition-colors leading-tight">
                                                    {car.model?.name} <span className="text-gray-400 font-normal ml-1">{car.variant}</span>
                                                </h3>
                                            </div>
                                            <div className="text-left sm:text-right">
                                                <span className="block text-2xl font-bold text-gray-900 tracking-tight">
                                                    ₹{car.price?.toLocaleString()}
                                                </span>
                                                <span className="text-xs text-gray-500 font-medium">+ Taxes/Registration</span>
                                            </div>
                                        </div>

                                        {/* Specs Grid */}
                                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                                            <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg border border-gray-100">
                                                <span className="text-gray-400">📅</span>
                                                <span className="text-sm font-semibold text-gray-700">{car.year_of_manufacture}</span>
                                            </div>
                                            <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg border border-gray-100">
                                                <span className="text-gray-400">⛽</span>
                                                <span className="text-sm font-semibold text-gray-700">{car.fuel_type}</span>
                                            </div>
                                            <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg border border-gray-100">
                                                <span className="text-gray-400">⚙️</span>
                                                <span className="text-sm font-semibold text-gray-700">{car.transmission}</span>
                                            </div>
                                            <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg border border-gray-100">
                                                <span className="text-gray-400">🛣️</span>
                                                <span className="text-sm font-semibold text-gray-700">{car.km?.toLocaleString()} km</span>
                                            </div>
                                            <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg border border-gray-100">
                                                <span className="text-gray-400">👤</span>
                                                <span className="text-sm font-semibold text-gray-700">{car.ownership}</span>
                                            </div>
                                            <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg border border-gray-100 sm:col-span-2">
                                                <span className="text-gray-400">📍</span>
                                                <span className="text-sm font-semibold text-gray-700 truncate">{car.registration_state} ({car.rto || 'N/A'})</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex gap-3 pt-5 border-t border-gray-100 mt-auto">
                                        <button
                                            onClick={() => onEdit(car)}
                                            className="flex-1 px-4 py-2.5 bg-white border border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all text-sm flex items-center justify-center gap-2 group/btn"
                                        >
                                            <svg className="w-4 h-4 text-gray-400 group-hover/btn:text-indigo-600 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                                            Edit Details
                                        </button>
                                        <button
                                            onClick={() => handleDelete(car._id)}
                                            className="flex-1 px-4 py-2.5 bg-white border border-red-100 text-red-600 font-semibold rounded-xl hover:bg-red-50 hover:border-red-200 transition-all text-sm flex items-center justify-center gap-2 group/btn"
                                        >
                                            <svg className="w-4 h-4 text-red-400 group-hover/btn:text-red-600 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Image Gallery Modal */}
            {galleryCar && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-sm" onClick={closeGallery}>
                    <button
                        className="absolute top-4 right-4 text-white hover:text-gray-300 p-2 z-50"
                        onClick={closeGallery}
                    >
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>

                    <div className="relative w-full max-w-6xl h-screen md:h-[90vh] flex flex-col items-center justify-center p-4" onClick={e => e.stopPropagation()}>

                        {/* Main Image */}
                        <div className="relative w-full h-full flex items-center justify-center">
                            {galleryCar.images?.length > 0 ? (
                                <img
                                    src={galleryCar.images[currentImageIndex]}
                                    alt={`Gallery ${currentImageIndex + 1}`}
                                    className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
                                />
                            ) : (
                                <div className="text-gray-500 text-xl">No images available</div>
                            )}

                            {/* Navigation Buttons */}
                            {galleryCar.images?.length > 1 && (
                                <>
                                    <button
                                        className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full transition-colors"
                                        onClick={(e) => { e.stopPropagation(); prevImage(); }}
                                    >
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
                                    </button>
                                    <button
                                        className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full transition-colors"
                                        onClick={(e) => { e.stopPropagation(); nextImage(); }}
                                    >
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
                                    </button>
                                </>
                            )}
                        </div>

                        {/* Thumbnails Strip */}
                        {galleryCar.images?.length > 1 && (
                            <div className="mt-4 flex gap-2 overflow-x-auto max-w-full py-2 px-4 scrollbar-hide">
                                {galleryCar.images.map((img, idx) => (
                                    <button
                                        key={idx}
                                        onClick={(e) => { e.stopPropagation(); setCurrentImageIndex(idx); }}
                                        className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${currentImageIndex === idx ? 'border-primary-500 scale-105 ring-2 ring-primary-500/50' : 'border-transparent opacity-60 hover:opacity-100'
                                            }`}
                                    >
                                        <img src={img} alt={`Thumb ${idx}`} className="w-full h-full object-cover" />
                                    </button>
                                ))}
                            </div>
                        )}

                        {/* Counter */}
                        <div className="absolute top-4 left-4 sm:left-auto text-white/80 font-medium bg-black/50 px-3 py-1 rounded-full text-sm">
                            {currentImageIndex + 1} / {galleryCar.images?.length || 0}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CarList;
