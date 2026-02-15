require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

const seedUsers = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ MongoDB connected');

        // Clear existing users
        await User.deleteMany({});
        console.log('🗑️  Cleared existing users');

        // Create admin user
        const admin = new User({
            email: process.env.ADMIN_EMAIL,
            password: process.env.ADMIN_PASSWORD,
            role: 'admin'
        });
        await admin.save();
        console.log(`✅ Admin user created: ${admin.email}`);

        // Create agent user
        const agent = new User({
            email: process.env.AGENT_EMAIL,
            password: process.env.AGENT_PASSWORD,
            role: 'agent'
        });
        await agent.save();
        console.log(`✅ Agent user created: ${agent.email}`);

        console.log('\n🎉 Users seeded successfully!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding users:', error);
        process.exit(1);
    }
};

seedUsers();
