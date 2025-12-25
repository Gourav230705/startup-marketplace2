const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Startup = require('./models/Startup');
const Resource = require('./models/Resource');
const Inquiry = require('./models/Inquiry');
const connectDB = require('./config/db');

dotenv.config();
connectDB();

const importData = async () => {
    try {
        await User.deleteMany();
        await Startup.deleteMany();
        await Resource.deleteMany();
        await Inquiry.deleteMany();

        // Create Users
        const hashedPassword = await bcrypt.hash('password123', 10);

        const users = await User.insertMany([
            {
                name: 'Admin User',
                email: 'admin@test.com',
                password: hashedPassword, // Manually hashed to avoid pre-save hook issues in bulk insert if not careful, but insertMany triggers hooks? No, usually not. Let's rely on standard creation or pre-hash.
                // Actually insertMany might not trigger pre-save hooks depending on mongoose version/options.
                // Safer to use create or pre-hash. I'll pre-hash here effectively.
                // Wait, the User model has a pre-save hook that hashes. insertMany typically skips pre-save hooks!
                // So I should provide the hashed password directly or use create inside a loop.
                // But for simplicity in seeder with insertMany, I will provide the hashed string assuming I know it or use a helper.
                // Note: The User model checks `if (!this.isModified('password'))`.
                // If I pass the raw password and insertMany skips hooks, it's stored raw. Bad for auth logic which does compare.
                // So I MUST hash it here or use User.create loop.
                // Let's use a fixed hash for 'password123'. 
                // Or better:
                role: 'admin',
            },
            {
                name: 'Startup Owner One',
                email: 'owner1@test.com',
                password: hashedPassword,
                role: 'owner',
            },
            {
                name: 'Startup Owner Two',
                email: 'owner2@test.com',
                password: hashedPassword,
                role: 'owner',
            },
            {
                name: 'Investor John',
                email: 'investor@test.com',
                password: hashedPassword,
                role: 'customer',
            },
            {
                name: 'Customer Jane',
                email: 'customer@test.com',
                password: hashedPassword,
                role: 'customer',
            },
        ]);

        const admin = users[0];
        const owner1 = users[1];
        const owner2 = users[2];
        const investor = users[3];

        // Create Startups
        const startups = await Startup.insertMany([
            {
                owner: owner1._id,
                name: 'TechNova',
                description: 'AI-powered efficiency tools for small businesses. We automate the boring stuff so you can focus on growth.',
                industry: 'Artificial Intelligence',
                fundingStage: 'Seed',
                website: 'https://technova.example.com',
                contactEmail: 'contact@technova.example.com',
            },
            {
                owner: owner1._id,
                name: 'GreenEarth Solutions',
                description: 'Sustainable packaging materials made from agricultural waste. Fully biodegradable and compostable.',
                industry: 'CleanTech',
                fundingStage: 'Series A',
                website: 'https://greenearth.example.com',
                contactEmail: 'info@greenearth.example.com',
            },
            {
                owner: owner2._id,
                name: 'HealthPlus',
                description: 'Telemedicine platform connecting rural patients with top-tier specialists via mobile app.',
                industry: 'HealthTech',
                fundingStage: 'Bootstrapped',
                website: 'https://healthplus.example.com',
                contactEmail: 'support@healthplus.example.com',
            },
        ]);

        // Create Resources
        await Resource.insertMany([
            {
                title: 'Y Combinator Startup Library',
                description: 'Essential advice for founders from YC partners.',
                type: 'general',
                expertise: ['Fundraising', 'Product Market Fit', 'Growth'],
                link: 'https://www.ycombinator.com/library',
            },
            {
                title: 'Sequoia Capital',
                description: 'Leading venture capital firm focused on energy, financial, enterprise, healthcare, mobile, and internet startups.',
                type: 'investor',
                expertise: ['Series A', 'Seed Funding', 'IPO'],
                link: 'https://www.sequoiacap.com/',
            },
            {
                title: 'TechStars Mentorship',
                description: 'Global ecosystem that helps entrepreneurs build great businesses.',
                type: 'mentor',
                expertise: ['Mentoring', 'Networking', 'Accelerator'],
                link: 'https://www.techstars.com/',
            },
            {
                title: 'Notion for Startups',
                description: 'All-in-one workspace for your notes, tasks, wikis, and databases.',
                type: 'tool',
                expertise: ['Productivity', 'Documentation', 'Collaboration'],
                link: 'https://www.notion.so/startups',
            },
        ]);

        // Create Inquiries
        await Inquiry.insertMany([
            {
                sender: investor._id,
                startup: startups[0]._id, // TechNova
                message: 'Hi, I am interested in your seed round. Do you have a pitch deck?',
            },
            {
                sender: investor._id,
                startup: startups[1]._id, // GreenEarth
                message: 'We are looking for sustainable partners. Let\'s connect.',
                reply: 'Absolutely! We are actively looking for partners. Let me know when you are free.',
                repliedAt: Date.now(),
            },
        ]);

        console.log('Data Imported!');
        process.exit();
    } catch (error) {
        console.error(`${error}`);
        process.exit(1);
    }
};

importData();
