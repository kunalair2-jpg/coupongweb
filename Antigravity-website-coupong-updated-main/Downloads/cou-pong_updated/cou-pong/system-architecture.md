# Cou-pong System Architecture

## 1. Database Architecture

### `users`
Stores all user accounts (customers, vendors, admins).
```sql
CREATE TABLE users (
    user_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    role ENUM('customer', 'vendor', 'admin') NOT NULL DEFAULT 'customer',
    membership_tier ENUM('free', 'gold', 'platinum') DEFAULT 'free',
    phone_number VARCHAR(20),
    profile_image_url VARCHAR(500),
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    last_login TIMESTAMP,
    INDEX (email),
    INDEX (role)
);
```

### `vendors`
Stores business-specific details for vendor accounts.
```sql
CREATE TABLE vendors (
    vendor_id BIGINT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    business_name VARCHAR(255) NOT NULL,
    business_description TEXT,
    logo_url VARCHAR(500),
    banner_url VARCHAR(500),
    website_url VARCHAR(255),
    contact_email VARCHAR(255),
    contact_phone VARCHAR(20),
    address_line1 VARCHAR(255),
    address_line2 VARCHAR(255),
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100),
    zip_code VARCHAR(20), 
    country VARCHAR(100) DEFAULT 'India',
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    category VARCHAR(100),
    verification_status ENUM('pending', 'verified', 'rejected') DEFAULT 'pending',
    verification_documents JSON, -- Array of URLs
    rating DECIMAL(3, 2) DEFAULT 0.00,
    review_count INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    INDEX (city),
    INDEX (category),
    SPATIAL INDEX (latitude, longitude)
);
```

### `coupons`
The core table storing all coupon data.
```sql
CREATE TABLE coupons (
    coupon_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    vendor_id BIGINT NOT NULL,
    
    -- Basic Details
    title VARCHAR(255) NOT NULL,
    short_description VARCHAR(255),
    long_description TEXT,
    coupon_code VARCHAR(50) UNIQUE,
    images JSON, -- Array of image URLs
    
    -- Discount Rules
    discount_type ENUM('percentage', 'fixed', 'b1g1', 'b2g1', 'cashback', 'combo') NOT NULL,
    discount_value DECIMAL(10, 2), -- Stores % or Amount or 0 for BOGO
    min_purchase_amount DECIMAL(10, 2) DEFAULT 0,
    max_discount_cap DECIMAL(10, 2),
    tiered_discounts JSON, -- Structure: [{"spend": 500, "discount": 10}, {"spend": 1000, "discount": 20}]
    
    -- Availability & Limits
    total_coupons INT, -- NULL for unlimited
    coupons_redeemed INT DEFAULT 0,
    per_user_limit INT DEFAULT 1,
    per_day_limit INT,
    
    -- Scheduling
    valid_from TIMESTAMP NOT NULL,
    expires_on TIMESTAMP NOT NULL,
    active_days JSON, -- ["Mon", "Tue", "Wed", ...]
    active_time_from TIME,
    active_time_to TIME,
    
    -- Targeting
    city VARCHAR(100),
    locality VARCHAR(100),
    target_radius_km INT,
    category VARCHAR(50),
    subcategory VARCHAR(50),
    tags JSON,
    
    -- User Targeting
    first_time_users_only BOOLEAN DEFAULT FALSE,
    membership_required ENUM('free', 'gold', 'platinum') DEFAULT 'free',
    target_age_group JSON, -- ["18-25", "26-35"]
    
    -- Restrictions
    applicable_on JSON, -- ["dine_in", "takeaway", "delivery"]
    payment_methods JSON, -- ["upi", "card", "cash"]
    can_stack BOOLEAN DEFAULT FALSE,
    
    -- Status & Deployment
    status ENUM('draft', 'pending', 'active', 'paused', 'expired', 'rejected') DEFAULT 'draft',
    approval_status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
    rejection_reason TEXT,
    
    -- Features & Metrics
    is_featured BOOLEAN DEFAULT FALSE,
    is_trending BOOLEAN DEFAULT FALSE,
    total_views BIGINT DEFAULT 0,
    total_clicks BIGINT DEFAULT 0,
    total_shares BIGINT DEFAULT 0,
    
    -- SEO
    meta_title VARCHAR(255),
    meta_description VARCHAR(255),
    url_slug VARCHAR(255) UNIQUE,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (vendor_id) REFERENCES vendors(vendor_id),
    FULLTEXT(title, short_description, long_description),
    INDEX (city, locality),
    INDEX (status),
    INDEX (expires_on)
);
```

### `coupon_redemptions`
Tracks individual redemptions.
```sql
CREATE TABLE coupon_redemptions (
    redemption_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    coupon_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    redemption_code VARCHAR(100) UNIQUE NOT NULL,
    qr_code_url VARCHAR(500),
    transaction_amount DECIMAL(10, 2),
    discount_amount DECIMAL(10, 2),
    redeemed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status ENUM('generated', 'scanned', 'completed', 'cancelled') DEFAULT 'generated',
    FOREIGN KEY (coupon_id) REFERENCES coupons(coupon_id),
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);
```

---

## 2. API Specification

### Vendor APIs

**1. Create Coupon**
- **Endpoint:** `POST /api/vendor/coupons`
- **Request:**
```json
{
  "title": "50% Off Pizza",
  "discount_type": "percentage",
  "discount_value": 50,
  "valid_from": "2024-06-01T10:00:00Z",
  "expires_on": "2024-06-30T23:59:59Z",
  "city": "Pune",
  "locality": "Koregaon Park",
  "images": ["url1.jpg", "url2.jpg"]
}
```
- **Response:** `201 Created` - Returns created coupon object with ID.

**2. Update Coupon**
- **Endpoint:** `PUT /api/vendor/coupons/{id}`
- **Request:** (Partial object of fields to update)
- **Response:** `200 OK` - Returns updated coupon.

**3. List Vendor Coupons**
- **Endpoint:** `GET /api/vendor/coupons`
- **Query Params:** `?status=active&page=1&limit=10`
- **Response:**
```json
{
  "data": [ ...coupon_objects ],
  "meta": { "total": 50, "page": 1, "last_page": 5 }
}
```

**4. Coupon Analytics**
- **Endpoint:** `GET /api/vendor/coupons/{id}/analytics`
- **Response:**
```json
{
  "views": 1500,
  "clicks": 300,
  "redemptions": 45,
  "conversion_rate": "3%",
  "daily_trend": [ ... ]
}
```

### Customer APIs

**1. Search Coupons**
- **Endpoint:** `GET /api/coupons/search`
- **Query Params:**
  - `city`: "Pune"
  - `locality`: "Koregaon Park"
  - `q`: "pizza" (Query)
  - `category`: "food"
  - `lat`: 18.5204
  - `lng`: 73.8567
  - `radius`: 5 (km)
  - `sort`: "trending" | "newest" | "discount"
- **Response:** List of matching coupons.

**2. Get Coupon Details**
- **Endpoint:** `GET /api/coupons/{id}`
- **Response:** Full coupon details including vendor info.

**3. Redeem Coupon**
- **Endpoint:** `POST /api/coupons/{id}/redeem`
- **Request:** `{ "user_id": 123 }`
- **Response:**
```json
{
  "success": true,
  "redemption_code": "CP-XYZ-123",
  "qr_url": "https://qr.code/..."
}
```

---

## 3. Backend Logic Flows

### Create Coupon Logic
```javascript
async function createCoupon(vendorId, couponData) {
    // 1. Validation
    if (!couponData.title || !couponData.discount_value) throw new Error("Missing fields");
    if (new Date(couponData.expires_on) <= new Date()) throw new Error("Invalid expiry");

    // 2. Generate Unique Code (if valid)
    let code = couponData.coupon_code;
    if (!code) {
        code = generateRandomCode(8); // e.g., 'CP-8X92B'
        // Ensure uniqueness DB check here
    }

    // 3. Generate Slug
    const slug = slugify(`${couponData.title}-${generateRandomString(4)}`);

    // 4. Image Processing (Pseudocode)
    const processedImages = await processImages(couponData.images); // Resize/Optimize

    // 5. Calculate Reach (Based on city/locality users)
    const estimatedReach = await db.users.count({ city: couponData.city, locality: couponData.locality });

    // 6. Auto-Approval Rules
    let status = 'pending';
    const vendor = await db.vendors.findById(vendorId);
    if (vendor.is_verified && vendor.rating > 4.5) {
        status = 'active'; // trusted vendors auto-approve
    }

    // 7. DB Insert
    const newCoupon = await db.coupons.create({
        ...couponData,
        vendor_id: vendorId,
        coupon_code: code,
        url_slug: slug,
        images: processedImages,
        status: status,
        estimated_reach: estimatedReach
    });

    // 8. Notifications
    if (status === 'active') {
        notifyFollowers(vendorId, newCoupon);
    }

    // 9. Search Indexing
    await searchEngine.index(newCoupon);

    return newCoupon;
}
```

### Search Coupons Logic
```javascript
async function searchCoupons(filters) {
    let query = "SELECT * FROM coupons WHERE status = 'active'";
    const params = [];

    // Location
    if (filters.city) {
        query += " AND city = ?";
        params.push(filters.city);
    }
    if (filters.locality) {
        query += " AND locality = ?";
        params.push(filters.locality);
    }

    // Text Search
    if (filters.q) {
        query += " AND MATCH(title, short_description) AGAINST(? IN NATURAL LANGUAGE MODE)";
        params.push(filters.q);
    }

    // Availability Check
    query += " AND (total_coupons IS NULL OR coupons_redeemed < total_coupons)";
    query += " AND expires_on > NOW()";

    // Day/Time Check
    const todayDay = getDayName(); // 'Mon', 'Tue'...
    const currentTime = getCurrentTime();
    query += ` AND JSON_CONTAINS(active_days, '"${todayDay}"')`;
    query += ` AND (active_time_from IS NULL OR (active_time_from <= ? AND active_time_to >= ?))`;
    params.push(currentTime, currentTime);

    // Sorting
    if (filters.sort === 'trending') {
        query += " ORDER BY is_trending DESC, total_views DESC";
    } else if (filters.sort === 'discount') {
        query += " ORDER BY discount_value DESC";
    } else {
        query += " ORDER BY created_at DESC";
    }

    // Pagination
    query += " LIMIT ? OFFSET ?";
    params.push(filters.limit, filters.offset);

    const results = await db.query(query, params);
    
    // Analytics: Track search term asynchronously
    trackSearchEvent(filters);

    return results;
}
```

### Redeem Coupon Logic
```javascript
async function redeemCoupon(couponId, userId, amount) {
    // Start Transaction
    const transaction = await db.startTransaction();
    
    try {
        // 1. Fetch & Lock Coupon Row
        const coupon = await db.query("SELECT * FROM coupons WHERE coupon_id = ? FOR UPDATE", [couponId]);

        // 2. Validations
        if (coupon.status !== 'active') throw new Error("Coupon inactive");
        if (new Date() > new Date(coupon.expires_on)) throw new Error("Coupon expired");
        if (coupon.total_coupons && coupon.coupons_redeemed >= coupon.total_coupons) throw new Error("Sold out");
        if (coupon.min_purchase_amount && amount < coupon.min_purchase_amount) throw new Error("Min purchase not met");

        // 3. User Limit Check
        const userRedemptions = await db.count('coupon_redemptions', { coupon_id: couponId, user_id: userId });
        if (userRedemptions >= coupon.per_user_limit) throw new Error("User limit reached");

        // 4. Calculate Discount
        let discount = 0;
        if (coupon.discount_type === 'percentage') {
            discount = (amount * coupon.discount_value) / 100;
            if (coupon.max_discount_cap) discount = Math.min(discount, coupon.max_discount_cap);
        } else if (coupon.discount_type === 'fixed') {
            discount = coupon.discount_value;
        }

        // 5. Create Redemption Record
        const redemptionCode = generateUniqueCode();
        await db.redemptions.create({
            coupon_id: couponId,
            user_id: userId,
            redemption_code: redemptionCode,
            transaction_amount: amount,
            discount_amount: discount,
            status: 'generated'
        }, { transaction });

        // 6. Update Coupon Stats
        await db.query("UPDATE coupons SET coupons_redeemed = coupons_redeemed + 1 WHERE coupon_id = ?", [couponId], { transaction });

        await transaction.commit();

        return { code: redemptionCode, discount: discount };

    } catch (error) {
        await transaction.rollback();
        throw error;
    }
}
```

---

## 4. Cron Jobs

### `expireCoupons()`
**Schedule:** Hourly (`0 * * * *`)
**Task:** 
1. Queries coupons where `expires_on < NOW()` AND `status = 'active'`.
2. Updates their status to `'expired'`.
3. Sends email to vendors notifying them of expiry.

### `updateTrendingCoupons()`
**Schedule:** Every 6 hours (`0 */6 * * *`)
**Task:**
1. Calculates a "Trend Score" for each active coupon:
   `Score = (Views * 1) + (Clicks * 3) + (Redemptions * 10) + (Shares * 5)` (Metrics from last 24h)
2. Sets `is_trending = TRUE` for top 50 scoring coupons.
3. Sets `is_trending = FALSE` for others.

### `sendExpiryReminders()`
**Schedule:** Daily at 9 AM (`0 9 * * *`)
**Task:**
1. Finds users who have "favorited" coupons that are expiring in exactly 24 hours.
2. Sends push notification/email: "Time is running out! Your saved deal for [Coupon] expires tomorrow."
