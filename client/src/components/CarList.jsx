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
        <div className="card border border-gray-100 overflow-hidden animate-pulse">
            <div className="flex flex-col md:flex-row gap-6">
                <div className="w-full md:w-56 h-40 bg-gray-200 rounded-xl" />
                <div className="flex-1 flex flex-col justify-between py-1">
                    <div>
                        <div className="flex justify-between items-start mb-3">
                            <div className="space-y-2">
                                <div className="h-6 w-32 bg-gray-200 rounded" />
                                <div className="h-4 w-20 bg-gray-200 rounded" />
                            </div>
                            <div className="h-8 w-24 bg-gray-200 rounded" />
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
                            {[...Array(8)].map((_, i) => (
                                <div key={i} className="h-4 w-16 bg-gray-200 rounded" />
                            ))}
                        </div>
                    </div>
                    <div className="flex gap-3 pt-4 border-t border-gray-50 mt-auto">
                        <div className="h-10 flex-1 bg-gray-200 rounded-lg" />
                        <div className="h-10 flex-1 bg-gray-200 rounded-lg" />
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
                    <div className="card text-center py-12">
                        <p className="text-gray-500">No cars found. Add your first car to get started!</p>
                    </div>
                ) : (
                    cars.map((car) => (
                        <div key={car._id} className="card group hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-100 overflow-hidden">
                            <div className="flex flex-col md:flex-row gap-6">
                                {/* Car Image - Clickable for Gallery */}
                                <div
                                    className="w-full md:w-56 h-40 flex-shrink-0 bg-gray-100 rounded-xl overflow-hidden relative shadow-inner cursor-pointer"
                                    onClick={() => openGallery(car)}
                                >
                                    {car.images && car.images.length > 0 ? (
                                        <img
                                            src={car.images[0]}
                                            alt={`${car.brand?.name} ${car.model?.name}`}
                                            className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 bg-gray-50">
                                            <span className="text-4xl mb-2">📷</span>
                                            <span className="text-sm font-medium">No Image</span>
                                        </div>
                                    )}
                                    <div className="absolute top-2 left-2 px-2 py-1 bg-black/60 backdrop-blur-sm text-white text-xs font-bold rounded-md">
                                        {car.stock_code}
                                    </div>
                                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                                        <span className="bg-black/50 text-white px-3 py-1 rounded-full text-xs font-medium backdrop-blur-sm">view gallery</span>
                                    </div>
                                </div>

                                <div className="flex-1 flex flex-col justify-between py-1">
                                    <div>
                                        <div className="flex justify-between items-start mb-3">
                                            <div>
                                                <h3 className="text-xl font-bold text-gray-900 group-hover:text-primary-600 transition-colors">
                                                    {car.brand?.name} {car.model?.name}
                                                </h3>
                                                <p className="text-sm text-gray-500 font-medium">{car.variant}</p>
                                            </div>
                                            <div className="text-right">
                                                <span className="block text-2xl font-bold text-primary-600">
                                                    ₹{car.price?.toLocaleString()}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-y-3 gap-x-6 text-sm text-gray-600 mb-4">
                                            <div className="flex items-center gap-2">
                                                <span className="w-1.5 h-1.5 rounded-full bg-gray-400"></span>
                                                {car.year_of_manufacture}
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="w-1.5 h-1.5 rounded-full bg-gray-400"></span>
                                                {car.fuel_type}
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="w-1.5 h-1.5 rounded-full bg-gray-400"></span>
                                                {car.transmission}
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="w-1.5 h-1.5 rounded-full bg-gray-400"></span>
                                                {car.km?.toLocaleString()} km
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="w-1.5 h-1.5 rounded-full bg-gray-400"></span>
                                                {car.ownership}
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="w-1.5 h-1.5 rounded-full bg-gray-400"></span>
                                                {car.registration_state}
                                            </div>
                                            <div className="flex items-center gap-2 col-span-2">
                                                <span className="w-1.5 h-1.5 rounded-full bg-primary-500"></span>
                                                <span className="font-semibold text-gray-900">RTO: {car.rto || 'N/A'}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex gap-3 pt-4 border-t border-gray-50 mt-auto">
                                        <button
                                            onClick={() => onEdit(car)}
                                            className="btn btn-secondary text-sm flex-1"
                                        >
                                            Edit Details
                                        </button>
                                        <button
                                            onClick={() => handleDelete(car._id)}
                                            className="btn btn-danger text-sm flex-1 opacity-90 hover:opacity-100"
                                        >
                                            Delete Car
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
