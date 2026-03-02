// Indian Cities with Localities
const CITIES = [
    {
        id: 'pune', name: 'Pune', lat: 18.5204, lng: 73.8567,
        localities: [
            // Central Pune
            'Shivajinagar', 'Deccan Gymkhana', 'Sadashiv Peth', 'Narayan Peth', 'Budhwar Peth',
            'Rasta Peth', 'Swargate', 'Camp (Cantonment)', 'Koregaon Park', 'Kalyani Nagar',

            // West Pune
            'Aundh', 'Baner', 'Balewadi', 'Pashan', 'Bavdhan', 'Kothrud', 'Warje',
            'Karve Nagar', 'Hinjawadi (IT hub)',

            // East Pune
            'Viman Nagar', 'Kharadi', 'Wagholi', 'Hadapsar', 'Magarpatta',
            'Mundhwa', 'Yerawada', 'Lohegaon',

            // South Pune
            'Bibwewadi', 'Dhankawadi', 'Kondhwa', 'Undri', 'Pisoli',
            'Sahakar Nagar', 'Parvati', 'Satara Road',

            // North Pune
            'Bhosari', 'Dighi', 'Vishrantwadi', 'Tingre Nagar', 'Alandi Road',

            // Pimpri-Chinchwad
            'Pimpri', 'Chinchwad', 'Wakad', 'Nigdi', 'Ravet', 'Tathawade',
            'Pimple Saudagar', 'Pimple Gurav', 'Moshi'
        ]
    },
    {
        id: 'delhi', name: 'New Delhi', lat: 28.6139, lng: 77.2090,
        localities: [
            'Connaught Place', 'Hauz Khas', 'Saket', 'Dwarka', 'Vasant Kunj', 'Karol Bagh',
            'Lajpat Nagar', 'South Extension', 'Greater Kailash', 'Rohini', 'Pitampura',
            'Mayur Vihar', 'Nehru Place', 'Chandni Chowk', 'Defense Colony', 'Janakpuri',
            'Rajouri Garden', 'Vasant Vihar', 'Chanakyapuri', 'Green Park'
        ]
    },
    {
        id: 'mumbai', name: 'Mumbai', lat: 19.0760, lng: 72.8777,
        localities: [
            'Bandra West', 'Andheri West', 'Juhu', 'Colaba', 'Powai', 'Lower Parel', 'Dadar',
            'Worli', 'Chembur', 'Malad', 'Borivali', 'Goregaon', 'Santacruz', 'Khar',
            'Churchgate', 'Marine Drive', 'Vile Parle', 'Versova', 'Ghatkopar', 'Mulund'
        ]
    },
    {
        id: 'bangalore', name: 'Bangalore', lat: 12.9716, lng: 77.5946,
        localities: [
            'Indiranagar', 'Koramangala', 'Whitefield', 'Jayanagar', 'MG Road', 'HSR Layout',
            'Marathahalli', 'Electronic City', 'JP Nagar', 'Malleshwaram', 'Banashankari',
            'Bellandur', 'Sarjapur Road', 'Yelahanka', 'Richmond Road', 'Ulsoor', 'Bannerghatta Road'
        ]
    },
    {
        id: 'hyderabad', name: 'Hyderabad', lat: 17.3850, lng: 78.4867,
        localities: [
            'Banjara Hills', 'Jubilee Hills', 'Gachibowli', 'Hitech City', 'Secunderabad',
            'Kukatpally', 'Madhapur', 'Kondapur', 'Begumpet', 'Himayat Nagar', 'Dilsukhnagar',
            'Manikonda', 'Ameerpet', 'Somajiguda'
        ]
    },
    {
        id: 'chennai', name: 'Chennai', lat: 13.0827, lng: 80.2707,
        localities: [
            'T-Nagar', 'Adyar', 'Velachery', 'Anna Nagar', 'Mylapore', 'Nungambakkam',
            'Alwarpet', 'Guindy', 'Tambaram', 'Porur', 'Kodambakkam', 'Besant Nagar',
            'Egmore', 'Royapettah', 'Thiruvanmiyur'
        ]
    },
    {
        id: 'kolkata', name: 'Kolkata', lat: 22.5726, lng: 88.3639,
        localities: [
            'Park Street', 'Salt Lake', 'New Town', 'Ballygunge', 'Alipore', 'Howrah',
            'Dum Dum', 'Gariahat', 'Jadavpur', 'Behala', 'Tollygunge', 'Lake Gardens',
            'Camac Street', 'Esplanade'
        ]
    },
    {
        id: 'gurgaon', name: 'Gurgaon', lat: 28.4595, lng: 77.0266,
        localities: [
            'Cyber City', 'Sector 29', 'Golf Course Road', 'Sohna Road', 'MG Road',
            'Udyog Vihar', 'DLF Phase 1', 'DLF Phase 2', 'DLF Phase 3', 'DLF Phase 4',
            'DLF Phase 5', 'Ambience Island', 'Sushant Lok', 'Nirvana Country'
        ]
    }
];

const CATEGORIES = [
    { id: 'food', name: 'Food & Drink', icon: 'ph-fork-knife' },
    { id: 'beauty', name: 'Beauty & Wellness', icon: 'ph-sparkle' },
    { id: 'health', name: 'Health & Fitness', icon: 'ph-heart-beat' },
    { id: 'digital', name: 'Digital Services', icon: 'ph-monitor' },
    { id: 'family', name: 'Family & Kids', icon: 'ph-baby' },
    { id: 'home', name: 'Home', icon: 'ph-house' },
    { id: 'grocery', name: 'Grocery', icon: 'ph-basket' }
];

// Stores Updates (Locations mapped to specific cities)
const STORES = [
    {
        id: 's1',
        name: 'Punjab Grill',
        city: 'New Delhi',
        locality: 'Connaught Place',
        rating: 4.8,
        logo: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80',
        verified: true,
        lat: 28.6304, lng: 77.2177
    },
    {
        id: 's2',
        name: 'O2 Spa',
        city: 'Bangalore',
        locality: 'Indiranagar',
        rating: 4.9,
        logo: 'https://images.unsplash.com/photo-1600334089648-b0d9d3028eb2?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80',
        verified: true,
        lat: 12.9719, lng: 77.6412
    },
    {
        id: 's3',
        name: 'Smaaash',
        city: 'Mumbai',
        locality: 'Lower Parel',
        rating: 4.5,
        logo: 'https://images.unsplash.com/photo-1572527263351-9dbe6e95ce29?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80',
        verified: true,
        lat: 19.01, lng: 72.83
    },
    {
        id: 's4',
        name: 'Burger King',
        city: 'Pune',
        locality: 'Koregaon Park',
        rating: 4.2,
        logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/cc/Burger_King_2020.svg/200px-Burger_King_2020.svg.png',
        verified: true,
        lat: 18.5362, lng: 73.8940
    },
    {
        id: 's5',
        name: 'Croma Electronics',
        city: 'Hyderabad',
        locality: 'Banjara Hills',
        rating: 4.7,
        logo: 'https://images.unsplash.com/photo-1531297461136-82lw8e2c6f13?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80',
        verified: true,
        lat: 17.41, lng: 78.44
    },
    {
        id: 's6',
        name: 'Big Basket',
        city: 'Gurgaon',
        locality: 'Cyber City',
        rating: 4.6,
        logo: 'https://images.unsplash.com/photo-1542838132-92c53300491e?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80',
        verified: true,
        lat: 28.49, lng: 77.09
    },
    {
        id: 's7',
        name: 'GoMechanic',
        city: 'New Delhi',
        locality: 'Dwarka',
        rating: 4.4,
        logo: 'https://images.unsplash.com/photo-1487754180477-db33d3808b17?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80',
        verified: true,
        lat: 28.58, lng: 77.05
    },
    {
        id: 's8',
        name: 'Toit Brewpub',
        city: 'Bangalore',
        locality: 'Indiranagar',
        rating: 4.8,
        logo: 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80',
        verified: true,
        lat: 12.97, lng: 77.64
    },
    {
        id: 's9',
        name: 'High Spirits',
        city: 'Pune',
        locality: 'Koregaon Park',
        rating: 4.7,
        logo: 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80',
        verified: true,
        lat: 18.54, lng: 73.90
    }
];

const PROMOTION_DEALS = [
    // Food & Drink
    {
        id: 'd1', storeId: 's1', category: 'food', title: 'Unlimited Buffet Lunch', description: 'North Indian delicacies.', originalPrice: 1200, discountedPrice: 799, discountPercentage: 33, expiryDate: new Date(Date.now() + 86400000 * 3).toISOString(), soldCount: 450, image: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
        options: [
            { id: 'opt1_1', title: 'Buffet for One', originalPrice: 1200, discountedPrice: 799, discount: 33, bought: 200 },
            { id: 'opt1_2', title: 'Buffet for Two', originalPrice: 2400, discountedPrice: 1499, discount: 38, bought: 150 },
            { id: 'opt1_4', title: 'Family Pack (4 Pax)', originalPrice: 4800, discountedPrice: 2899, discount: 40, bought: 100 }
        ],
        locations: [
            { name: 'Downtown Branch', address: '123 Main St, Downtown', phone: '(555) 123-4567' },
            { name: 'Westside Mall', address: '456 West Ave, Mall Level 2', phone: '(555) 987-6543' }
        ]
    },
    {
        id: 'd4', storeId: 's4', category: 'food', title: 'Whopper Meal for 2', description: 'Burger, Fries, Coke.', originalPrice: 650, discountedPrice: 399, discountPercentage: 38, expiryDate: new Date(Date.now() + 86400000 * 2).toISOString(), soldCount: 2100, image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80', extraDiscount: true
    },
    {
        id: 'd8', storeId: 's8', category: 'food', title: 'Craft Beer Pitcher + Pizza', description: 'Best brew in town.', originalPrice: 2000, discountedPrice: 1500, discountPercentage: 25, expiryDate: new Date(Date.now() + 86400000 * 4).toISOString(), soldCount: 300, image: 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80'
    },
    {
        id: 'd9', storeId: 's9', category: 'food', title: 'Sunday Brunch Unlimited', description: 'Alcohol included.', originalPrice: 2500, discountedPrice: 1800, discountPercentage: 28, expiryDate: new Date(Date.now() + 86400000 * 2).toISOString(), soldCount: 150, image: 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80'
    },

    // Beauty & Wellness
    {
        id: 'd2', storeId: 's2', category: 'beauty', title: '60 Min Arogya Massage', description: 'Rejuvenate your senses.', originalPrice: 2500, discountedPrice: 1299, discountPercentage: 48, expiryDate: new Date(Date.now() + 86400000).toISOString(), soldCount: 120, image: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80'
    },
    {
        id: 'd10', storeId: 's2', category: 'beauty', title: 'Hair Spa & Cut', description: 'L\'Oreal Professionnel products.', originalPrice: 1800, discountedPrice: 999, discountPercentage: 44, expiryDate: new Date(Date.now() + 86400000 * 5).toISOString(), soldCount: 85, image: 'https://images.unsplash.com/photo-1560750588-73207b1ef5b8?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80'
    },

    // Health & Fitness (New)
    {
        id: 'd11', storeId: 's3', category: 'health', title: '1 Month Gym Access', description: 'Cardio, Weights & Trainer.', originalPrice: 3000, discountedPrice: 1499, discountPercentage: 50, expiryDate: new Date(Date.now() + 86400000 * 10).toISOString(), soldCount: 200, image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80', extraDiscount: true
    },
    {
        id: 'd12', storeId: 's3', category: 'health', title: 'Yoga Classes (5 Sessions)', description: 'Morning purity sessions.', originalPrice: 1500, discountedPrice: 799, discountPercentage: 46, expiryDate: new Date(Date.now() + 86400000 * 12).toISOString(), soldCount: 45, image: 'https://images.unsplash.com/photo-1599447421405-0e5a10c63741?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80'
    },

    // Family & Kids (New)
    {
        id: 'd3', storeId: 's3', category: 'family', title: 'Bowling + VR Games', description: 'Weekend fun combo.', originalPrice: 1500, discountedPrice: 899, discountPercentage: 40, expiryDate: new Date(Date.now() + 86400000 * 7).toISOString(), soldCount: 890, image: 'https://images.unsplash.com/photo-1526676037777-05a232554f77?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80'
    },
    {
        id: 'd13', storeId: 's3', category: 'family', title: 'Kids Play Zone (2 Hrs)', description: 'Unlimited access.', originalPrice: 800, discountedPrice: 499, discountPercentage: 37, expiryDate: new Date(Date.now() + 86400000 * 6).toISOString(), soldCount: 320, image: 'https://images.unsplash.com/photo-1596464716127-f9a8659b4b1c?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80'
    },

    // Home (New)
    {
        id: 'd14', storeId: 's7', category: 'home', title: 'Deep Home Cleaning', description: 'Includes bathroom & kitchen.', originalPrice: 4500, discountedPrice: 2999, discountPercentage: 33, expiryDate: new Date(Date.now() + 86400000 * 20).toISOString(), soldCount: 90, image: 'https://images.unsplash.com/photo-1581578731117-104f8a746950?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80', extraDiscount: true
    },
    {
        id: 'd7', storeId: 's7', category: 'home', title: 'Car Spa & Detailing', description: 'Interior & Exterior polish.', originalPrice: 2500, discountedPrice: 1599, discountPercentage: 36, expiryDate: new Date(Date.now() + 86400000 * 15).toISOString(), soldCount: 150, image: 'https://images.unsplash.com/photo-1601362840469-51e4d8d58785?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80'
    },

    // Digital Services (New)
    {
        id: 'd5', storeId: 's5', category: 'digital', title: 'Antivirus 1 Year License', description: 'Total security protection.', originalPrice: 1200, discountedPrice: 499, discountPercentage: 58, expiryDate: new Date(Date.now() + 86400000 * 30).toISOString(), soldCount: 1200, image: 'https://images.unsplash.com/photo-1563206767-5b1d972e8136?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80'
    },
    {
        id: 'd15', storeId: 's5', category: 'digital', title: 'Online Course Subscription', description: 'Learn coding or design.', originalPrice: 5000, discountedPrice: 999, discountPercentage: 80, expiryDate: new Date(Date.now() + 86400000 * 5).toISOString(), soldCount: 2500, image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80'
    },

    // Grocery
    {
        id: 'd6', storeId: 's6', category: 'grocery', title: 'Fresh Fruits Basket', description: 'Organic farm fresh.', originalPrice: 800, discountedPrice: 550, discountPercentage: 31, expiryDate: new Date(Date.now() + 86400000).toISOString(), soldCount: 60, image: 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80'
    },
    // Exclusive Deals
    {
        id: 'd16', storeId: 's1', category: 'food', title: 'Luxury 5-Course Dinner', description: 'Exclusive Chef\'s Table Experience.', originalPrice: 6000, discountedPrice: 2499, discountPercentage: 58, expiryDate: new Date(Date.now() + 86400000 * 20).toISOString(), soldCount: 50, image: 'https://images.unsplash.com/photo-1559339352-11d035aa65de', membersOnly: true,
        options: [
            { id: 'opt16_1', title: 'Dinner for Couple', originalPrice: 6000, discountedPrice: 2499, discount: 58, bought: 30 },
            { id: 'opt16_2', title: 'Dinner + Wine Pairing', originalPrice: 8000, discountedPrice: 3499, discount: 56, bought: 20 }
        ]
    },
    {
        id: 'd17', storeId: 's2', category: 'beauty', title: 'Full Body Spa Package', description: 'Premium 90-min Therapy.', originalPrice: 4500, discountedPrice: 1499, discountPercentage: 66, expiryDate: new Date(Date.now() + 86400000 * 20).toISOString(), soldCount: 120, image: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874', membersOnly: true
    },
    // New Deals Added
    {
        id: 'd18', storeId: 's4', category: 'food', title: 'Family Feast Combo', description: '4 Burgers, 4 Fries & 4 Cokes.', originalPrice: 1200, discountedPrice: 799, discountPercentage: 33, expiryDate: new Date(Date.now() + 86400000 * 5).toISOString(), soldCount: 350, image: 'https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80'
    },
    {
        id: 'd19', storeId: 's6', category: 'grocery', title: 'Monthly Staples Pack', description: 'Rice, Dal, Oil & Spices.', originalPrice: 3000, discountedPrice: 2499, discountPercentage: 17, expiryDate: new Date(Date.now() + 86400000 * 15).toISOString(), soldCount: 500, image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80'
    },
    {
        id: 'd20', storeId: 's5', category: 'digital', title: 'Wireless Earbuds', description: 'Noise cancelling with 24h battery.', originalPrice: 4999, discountedPrice: 1999, discountPercentage: 60, expiryDate: new Date(Date.now() + 86400000 * 30).toISOString(), soldCount: 150, image: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80', extraDiscount: true
    },
    {
        id: 'd21', storeId: 's2', category: 'beauty', title: 'Manicure & Pedicure', description: 'Classic care for hands & feet.', originalPrice: 1500, discountedPrice: 899, discountPercentage: 40, expiryDate: new Date(Date.now() + 86400000 * 10).toISOString(), soldCount: 200, image: 'https://images.unsplash.com/photo-1632345031435-8727f6897d53?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80'
    }
];

// Combine into standard DEALS export
const DEALS = PROMOTION_DEALS;  // Re-export as DEALS to match existing app interface
const CATEGORIES_EXPORT = CATEGORIES;
const STORES_EXPORT = STORES;
const CITIES_EXPORT = CITIES;
