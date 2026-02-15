require('dotenv').config();
const mongoose = require('mongoose');
const Brand = require('../models/Brand');
const Model = require('../models/Model');
const DropdownOption = require('../models/DropdownOption');

// Indian car brands and models data
const brandsData = [
    // Regular Brands
    {
        name: 'Maruti Suzuki',
        category: 'regular',
        models: ['Alto K10', 'S-Presso', 'Celerio', 'Wagon R', 'Swift', 'Dzire', 'Baleno', 'Fronx', 'Brezza', 'Ertiga', 'XL6', 'Jimny', 'Grand Vitara', 'Invicto']
    },
    {
        name: 'Hyundai',
        category: 'regular',
        models: ['Grand i10 Nios', 'i20', 'Aura', 'Exter', 'Venue', 'Creta', 'Alcazar', 'Verna', 'Tucson', 'Ioniq 5']
    },
    {
        name: 'Tata Motors',
        category: 'regular',
        models: ['Tiago', 'Tigor', 'Altroz', 'Punch', 'Nexon', 'Harrier', 'Safari', 'Nexon EV', 'Tiago EV', 'Punch EV', 'Tigor EV']
    },
    {
        name: 'Mahindra',
        category: 'regular',
        models: ['Thar', 'Thar Roxx', 'Bolero', 'Bolero Neo', 'Scorpio Classic', 'Scorpio N', 'XUV 3XO', 'XUV700', 'XUV400 EV']
    },
    {
        name: 'Toyota',
        category: 'regular',
        models: ['Glanza', 'Urban Cruiser Taisor', 'Urban Cruiser Hyryder', 'Innova Crysta', 'Innova Hycross', 'Fortuner', 'Fortuner Legender', 'Camry']
    },
    {
        name: 'Kia',
        category: 'regular',
        models: ['Sonet', 'Seltos', 'Carens', 'Carnival', 'EV6']
    },
    {
        name: 'MG Motor',
        category: 'regular',
        models: ['Comet EV', 'Astor', 'Hector', 'Hector Plus', 'ZS EV', 'Gloster', 'Windsor EV']
    },
    {
        name: 'Honda',
        category: 'regular',
        models: ['Amaze', 'City', 'City Hybrid', 'Elevate']
    },
    {
        name: 'Renault',
        category: 'regular',
        models: ['Kwid', 'Triber', 'Kiger']
    },
    {
        name: 'Nissan',
        category: 'regular',
        models: ['Magnite', 'X-Trail']
    },
    {
        name: 'Volkswagen',
        category: 'regular',
        models: ['Virtus', 'Taigun', 'Tiguan']
    },
    {
        name: 'Skoda',
        category: 'regular',
        models: ['Slavia', 'Kushaq', 'Kodiaq', 'Superb']
    },
    {
        name: 'Citroen',
        category: 'regular',
        models: ['C3', 'eC3', 'C3 Aircross', 'C5 Aircross']
    },
    {
        name: 'Jeep',
        category: 'regular',
        models: ['Compass', 'Meridian', 'Wrangler', 'Grand Cherokee']
    },
    {
        name: 'Force Motors',
        category: 'regular',
        models: ['Gurkha', 'Urbania']
    },
    // Luxury Brands
    {
        name: 'Mercedes-Benz',
        category: 'luxury',
        models: ['A-Class', 'C-Class', 'E-Class', 'S-Class', 'GLA', 'GLC', 'GLE', 'GLS', 'G-Class', 'EQB', 'EQE', 'EQS']
    },
    {
        name: 'BMW',
        category: 'luxury',
        models: ['2 Series', '3 Series', '5 Series', '7 Series', 'X1', 'X3', 'X5', 'X7', 'i4', 'iX', 'i7']
    },
    {
        name: 'Audi',
        category: 'luxury',
        models: ['A4', 'A6', 'Q3', 'Q5', 'Q7', 'Q8', 'Q8 e-tron']
    },
    {
        name: 'Jaguar Land Rover',
        category: 'luxury',
        models: ['Range Rover', 'Range Rover Sport', 'Range Rover Velar', 'Range Rover Evoque', 'Defender', 'Discovery Sport', 'F-Pace']
    },
    {
        name: 'Volvo',
        category: 'luxury',
        models: ['XC40', 'XC60', 'XC90', 'C40 Recharge']
    },
    {
        name: 'Lexus',
        category: 'luxury',
        models: ['ES', 'NX', 'RX', 'LX']
    },
    {
        name: 'Porsche',
        category: 'luxury',
        models: ['911', 'Macan', 'Cayenne', 'Panamera', 'Taycan']
    },
    {
        name: 'Mini',
        category: 'luxury',
        models: ['Cooper 3 Door', 'Cooper S', 'Countryman', 'Mini Electric']
    }
];

// Dropdown options
const dropdownData = [
    {
        field_name: 'fuel_type',
        options: ['Petrol', 'Diesel', 'CNG', 'Electric', 'Hybrid']
    },
    {
        field_name: 'transmission',
        options: ['Manual', 'Automatic', 'CVT', 'AMT']
    },
    {
        field_name: 'ownership',
        options: ['1st Owner', '2nd Owner', '3rd Owner', '4th Owner']
    },
    {
        field_name: 'registration_state',
        options: [
            'AN', 'AP', 'AR', 'AS', 'BR', 'CH', 'CT', 'DD', 'DL', 'DN', 'GA', 'GJ',
            'HP', 'HR', 'JH', 'JK', 'KA', 'KL', 'LA', 'LD', 'MH', 'ML', 'MN', 'MP',
            'MZ', 'NL', 'OD', 'PB', 'PY', 'RJ', 'SK', 'TN', 'TG', 'TR', 'UP', 'UT', 'WB'
        ]
    }
];

const seedData = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ MongoDB connected');

        // Clear existing data
        await Brand.deleteMany({});
        await Model.deleteMany({});
        await DropdownOption.deleteMany({});
        console.log('🗑️  Cleared existing brands, models, and dropdown options');

        // Seed brands and models
        let totalModels = 0;
        for (const brandData of brandsData) {
            // Create brand
            const brand = new Brand({
                name: brandData.name,
                category: brandData.category
            });
            await brand.save();
            console.log(`✅ Brand created: ${brand.name} (${brand.category})`);

            // Create models for this brand
            for (const modelName of brandData.models) {
                const model = new Model({
                    name: modelName,
                    brand: brand._id
                });
                await model.save();
                totalModels++;
            }
            console.log(`   ↳ Added ${brandData.models.length} models`);
        }

        console.log(`\n✅ Total brands created: ${brandsData.length}`);
        console.log(`✅ Total models created: ${totalModels}`);

        // Seed dropdown options
        for (const dropdown of dropdownData) {
            const option = new DropdownOption(dropdown);
            await option.save();
            console.log(`✅ Dropdown created: ${dropdown.field_name} (${dropdown.options.length} options)`);
        }

        console.log('\n🎉 Database seeded successfully!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding data:', error);
        process.exit(1);
    }
};

seedData();
