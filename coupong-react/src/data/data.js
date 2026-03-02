// Indian Cities with Localities
export const CITIES = [
    {
        id: 'pune', name: 'Pune', lat: 18.5204, lng: 73.8567,
        localities: [
            'Shivajinagar', 'Deccan Gymkhana', 'Sadashiv Peth', 'Koregaon Park', 'Kalyani Nagar',
            'Aundh', 'Baner', 'Balewadi', 'Pashan', 'Kothrud', 'Warje',
            'Viman Nagar', 'Kharadi', 'Wagholi', 'Hadapsar', 'Magarpatta',
            'Bibwewadi', 'Kondhwa', 'Undri', 'Parvati',
            'Bhosari', 'Dighi', 'Vishrantwadi',
            'Pimpri', 'Chinchwad', 'Wakad', 'Nigdi', 'Pimple Saudagar'
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
            'Churchgate', 'Marine Drive', 'Vile Parle', 'Ghatkopar', 'Mulund'
        ]
    },
    {
        id: 'bangalore', name: 'Bangalore', lat: 12.9716, lng: 77.5946,
        localities: [
            'Indiranagar', 'Koramangala', 'Whitefield', 'Jayanagar', 'MG Road', 'HSR Layout',
            'Marathahalli', 'Electronic City', 'JP Nagar', 'Malleshwaram', 'Banashankari',
            'Bellandur', 'Sarjapur Road', 'Yelahanka', 'Richmond Road', 'Ulsoor'
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
    },
];

export const CATEGORIES = [
    { id: 'food', name: 'Food & Drink', icon: '🍴', color: 'bg-orange-100 text-orange-600' },
    { id: 'beauty', name: 'Beauty & Wellness', icon: '✨', color: 'bg-pink-100 text-pink-600' },
    { id: 'health', name: 'Health & Fitness', icon: '💪', color: 'bg-blue-100 text-blue-600' },
    { id: 'digital', name: 'Digital Services', icon: '💻', color: 'bg-purple-100 text-purple-600' },
    { id: 'family', name: 'Family & Kids', icon: '👨‍👩‍👧', color: 'bg-yellow-100 text-yellow-600' },
    { id: 'home', name: 'Home', icon: '🏠', color: 'bg-green-100 text-green-600' },
    { id: 'grocery', name: 'Grocery', icon: '🛒', color: 'bg-teal-100 text-teal-600' },
];

export const STORES = [
    { id: 's1', name: 'Punjab Grill', city: 'New Delhi', locality: 'Connaught Place', rating: 4.8, logo: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=100&q=80', verified: true, lat: 28.6304, lng: 77.2177 },
    { id: 's2', name: 'O2 Spa', city: 'Bangalore', locality: 'Indiranagar', rating: 4.9, logo: 'https://images.unsplash.com/photo-1600334089648-b0d9d3028eb2?w=100&q=80', verified: true, lat: 12.9719, lng: 77.6412 },
    { id: 's3', name: 'Smaaash', city: 'Mumbai', locality: 'Lower Parel', rating: 4.5, logo: 'https://images.unsplash.com/photo-1572527263351-9dbe6e95ce29?w=100&q=80', verified: true, lat: 19.01, lng: 72.83 },
    { id: 's4', name: 'Burger King', city: 'Pune', locality: 'Koregaon Park', rating: 4.2, logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/cc/Burger_King_2020.svg/200px-Burger_King_2020.svg.png', verified: true, lat: 18.5362, lng: 73.8940 },
    { id: 's5', name: 'Croma Electronics', city: 'Hyderabad', locality: 'Banjara Hills', rating: 4.7, logo: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=100&q=80', verified: true, lat: 17.41, lng: 78.44 },
    { id: 's6', name: 'Big Basket', city: 'Gurgaon', locality: 'Cyber City', rating: 4.6, logo: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=100&q=80', verified: true, lat: 28.49, lng: 77.09 },
    { id: 's7', name: 'GoMechanic', city: 'New Delhi', locality: 'Dwarka', rating: 4.4, logo: 'https://images.unsplash.com/photo-1487754180477-db33d3808b17?w=100&q=80', verified: true, lat: 28.58, lng: 77.05 },
    { id: 's8', name: 'Toit Brewpub', city: 'Bangalore', locality: 'Indiranagar', rating: 4.8, logo: 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=100&q=80', verified: true, lat: 12.97, lng: 77.64 },
    { id: 's9', name: 'High Spirits', city: 'Pune', locality: 'Koregaon Park', rating: 4.7, logo: 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=100&q=80', verified: true, lat: 18.54, lng: 73.90 },
];

export const DEALS = [
    // Food & Drink
    { id: 'd1', storeId: 's1', category: 'food', title: 'Unlimited Buffet Lunch', description: 'Enjoy a lavish spread of North Indian delicacies at Punjab Grill.', originalPrice: 1200, discountedPrice: 799, discountPercentage: 33, expiryDate: new Date(Date.now() + 86400000 * 3).toISOString(), soldCount: 450, image: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600&q=80' },
    { id: 'd4', storeId: 's4', category: 'food', title: 'Whopper Meal for 2', description: 'Two Whopper burgers, large fries, and soft drinks.', originalPrice: 650, discountedPrice: 399, discountPercentage: 38, expiryDate: new Date(Date.now() + 86400000 * 2).toISOString(), soldCount: 2100, image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=600&q=80', extraDiscount: true },
    { id: 'd8', storeId: 's8', category: 'food', title: 'Craft Beer Pitcher + Pizza', description: 'Premium craft beers paired with the best stone-baked pizzas in Bangalore.', originalPrice: 2000, discountedPrice: 1500, discountPercentage: 25, expiryDate: new Date(Date.now() + 86400000 * 4).toISOString(), soldCount: 300, image: 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=600&q=80' },
    { id: 'd9', storeId: 's9', category: 'food', title: 'Sunday Brunch Unlimited', description: 'Unlimited food and alcohol at the iconic High Spirits Cafe.', originalPrice: 2500, discountedPrice: 1800, discountPercentage: 28, expiryDate: new Date(Date.now() + 86400000 * 2).toISOString(), soldCount: 150, image: 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=600&q=80' },
    { id: 'd18', storeId: 's4', category: 'food', title: 'Family Feast Combo', description: '4 Burgers, 4 fries, and 4 Cokes — family time done right.', originalPrice: 1200, discountedPrice: 799, discountPercentage: 33, expiryDate: new Date(Date.now() + 86400000 * 5).toISOString(), soldCount: 350, image: 'https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5?w=600&q=80' },
    { id: 'd16', storeId: 's1', category: 'food', title: 'Luxury 5-Course Dinner', description: "Exclusive Chef's Table Experience for special occasions.", originalPrice: 6000, discountedPrice: 2499, discountPercentage: 58, expiryDate: new Date(Date.now() + 86400000 * 20).toISOString(), soldCount: 50, image: 'https://images.unsplash.com/photo-1559339352-11d035aa65de?w=600&q=80', membersOnly: true },

    // Beauty & Wellness
    { id: 'd2', storeId: 's2', category: 'beauty', title: '60 Min Arogya Massage', description: 'Rejuvenate your senses with O2 Spa\'s signature Arogya massage therapy.', originalPrice: 2500, discountedPrice: 1299, discountPercentage: 48, expiryDate: new Date(Date.now() + 86400000).toISOString(), soldCount: 120, image: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=600&q=80' },
    { id: 'd10', storeId: 's2', category: 'beauty', title: 'Hair Spa & Cut', description: "Premium L'Oreal Professionnel hair treatment followed by a precision cut.", originalPrice: 1800, discountedPrice: 999, discountPercentage: 44, expiryDate: new Date(Date.now() + 86400000 * 5).toISOString(), soldCount: 85, image: 'https://images.unsplash.com/photo-1560750588-73207b1ef5b8?w=600&q=80' },
    { id: 'd21', storeId: 's2', category: 'beauty', title: 'Manicure & Pedicure', description: 'Classic spa-grade care for hands and feet using premium products.', originalPrice: 1500, discountedPrice: 899, discountPercentage: 40, expiryDate: new Date(Date.now() + 86400000 * 10).toISOString(), soldCount: 200, image: 'https://images.unsplash.com/photo-1632345031435-8727f6897d53?w=600&q=80' },
    { id: 'd17', storeId: 's2', category: 'beauty', title: 'Full Body Spa Package', description: 'Premium 90-minute full body therapy with aromatherapy.', originalPrice: 4500, discountedPrice: 1499, discountPercentage: 66, expiryDate: new Date(Date.now() + 86400000 * 20).toISOString(), soldCount: 120, image: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=600&q=80', membersOnly: true },

    // Health & Fitness
    { id: 'd11', storeId: 's3', category: 'health', title: '1 Month Gym Access', description: 'Full access to cardio, weights, and a personal trainer.', originalPrice: 3000, discountedPrice: 1499, discountPercentage: 50, expiryDate: new Date(Date.now() + 86400000 * 10).toISOString(), soldCount: 200, image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600&q=80', extraDiscount: true },
    { id: 'd12', storeId: 's3', category: 'health', title: 'Yoga Classes (5 Sessions)', description: 'Morning purity yoga sessions with professional instructors.', originalPrice: 1500, discountedPrice: 799, discountPercentage: 46, expiryDate: new Date(Date.now() + 86400000 * 12).toISOString(), soldCount: 45, image: 'https://images.unsplash.com/photo-1599447421405-0e5a10c63741?w=600&q=80' },

    // Family & Kids
    { id: 'd3', storeId: 's3', category: 'family', title: 'Bowling + VR Games', description: 'Weekend fun combo for the whole family at Smaaash.', originalPrice: 1500, discountedPrice: 899, discountPercentage: 40, expiryDate: new Date(Date.now() + 86400000 * 7).toISOString(), soldCount: 890, image: 'https://images.unsplash.com/photo-1526676037777-05a232554f77?w=600&q=80' },
    { id: 'd13', storeId: 's3', category: 'family', title: 'Kids Play Zone (2 Hrs)', description: 'Unlimited access to all play zone activities for 2 hours.', originalPrice: 800, discountedPrice: 499, discountPercentage: 37, expiryDate: new Date(Date.now() + 86400000 * 6).toISOString(), soldCount: 320, image: 'https://images.unsplash.com/photo-1596464716127-f9a8659b4b1c?w=600&q=80' },

    // Home
    { id: 'd14', storeId: 's7', category: 'home', title: 'Deep Home Cleaning', description: 'Includes bathroom, kitchen, and full home deep-cleaning service.', originalPrice: 4500, discountedPrice: 2999, discountPercentage: 33, expiryDate: new Date(Date.now() + 86400000 * 20).toISOString(), soldCount: 90, image: 'https://images.unsplash.com/photo-1581578731117-104f8a746950?w=600&q=80', extraDiscount: true },
    { id: 'd7', storeId: 's7', category: 'home', title: 'Car Spa & Detailing', description: 'Full interior and exterior polish with premium detailing products.', originalPrice: 2500, discountedPrice: 1599, discountPercentage: 36, expiryDate: new Date(Date.now() + 86400000 * 15).toISOString(), soldCount: 150, image: 'https://images.unsplash.com/photo-1601362840469-51e4d8d58785?w=600&q=80' },

    // Digital
    { id: 'd5', storeId: 's5', category: 'digital', title: 'Antivirus 1 Year License', description: 'Total security protection for up to 5 devices.', originalPrice: 1200, discountedPrice: 499, discountPercentage: 58, expiryDate: new Date(Date.now() + 86400000 * 30).toISOString(), soldCount: 1200, image: 'https://images.unsplash.com/photo-1563206767-5b1d972e8136?w=600&q=80' },
    { id: 'd15', storeId: 's5', category: 'digital', title: 'Online Course Subscription', description: 'Learn coding, design, or business with premium courses.', originalPrice: 5000, discountedPrice: 999, discountPercentage: 80, expiryDate: new Date(Date.now() + 86400000 * 5).toISOString(), soldCount: 2500, image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600&q=80' },
    { id: 'd20', storeId: 's5', category: 'digital', title: 'Wireless Earbuds', description: 'Noise cancelling earbuds with 24h battery and premium sound.', originalPrice: 4999, discountedPrice: 1999, discountPercentage: 60, expiryDate: new Date(Date.now() + 86400000 * 30).toISOString(), soldCount: 150, image: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=600&q=80', extraDiscount: true },

    // Grocery
    { id: 'd6', storeId: 's6', category: 'grocery', title: 'Fresh Fruits Basket', description: 'Certified organic, farm-fresh seasonal fruit basket.', originalPrice: 800, discountedPrice: 550, discountPercentage: 31, expiryDate: new Date(Date.now() + 86400000).toISOString(), soldCount: 60, image: 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=600&q=80' },
    { id: 'd19', storeId: 's6', category: 'grocery', title: 'Monthly Staples Pack', description: 'Rice, Lentils, Cooking Oil, and premium spices for a whole month.', originalPrice: 3000, discountedPrice: 2499, discountPercentage: 17, expiryDate: new Date(Date.now() + 86400000 * 15).toISOString(), soldCount: 500, image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=600&q=80' },
];

export const POPULAR_KEYWORDS = ['Pizza', 'Spa', 'Salon', 'Gym', 'Chinese', 'Biryani', 'Massage', 'Buffet', 'Burger', 'Coffee', 'Bowling', 'Hotel'];
