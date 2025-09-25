const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'traceability.db');

const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error opening database:', err);
    } else {
        console.log('Connected to SQLite database');
        initializeDatabase();
    }
});

function initializeDatabase() {
    // Create tables
    db.serialize(() => {
        // Blockchain storage
        db.run(`CREATE TABLE IF NOT EXISTS blockchain (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            block_hash TEXT NOT NULL,
            previous_hash TEXT NOT NULL,
            timestamp INTEGER NOT NULL,
            nonce INTEGER NOT NULL,
            data TEXT NOT NULL
        )`);

        // Transactions storage
        db.run(`CREATE TABLE IF NOT EXISTS transactions (
            id TEXT PRIMARY KEY,
            type TEXT NOT NULL,
            batch_id TEXT,
            timestamp INTEGER NOT NULL,
            data TEXT NOT NULL,
            block_hash TEXT,
            status TEXT DEFAULT 'pending'
        )`);

        // Users/Stakeholders
        db.run(`CREATE TABLE IF NOT EXISTS users (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            type TEXT NOT NULL,
            email TEXT,
            phone TEXT,
            location TEXT,
            created_at INTEGER NOT NULL
        )`);

        // Products with QR codes
        db.run(`CREATE TABLE IF NOT EXISTS products (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            batch_id TEXT NOT NULL,
            qr_code TEXT NOT NULL,
            manufacturer_id TEXT NOT NULL,
            created_at INTEGER NOT NULL,
            FOREIGN KEY (manufacturer_id) REFERENCES users(id)
        )`);

        // QR Code mapping
        db.run(`CREATE TABLE IF NOT EXISTS qr_codes (
            code TEXT PRIMARY KEY,
            product_id TEXT NOT NULL,
            created_at INTEGER NOT NULL,
            scan_count INTEGER DEFAULT 0,
            FOREIGN KEY (product_id) REFERENCES products(id)
        )`);

        // Insert sample users
        const users = [
            {
                id: 'FARMER001',
                name: 'Ramesh Kumar',
                type: 'farmer',
                email: 'ramesh@example.com',
                phone: '+91-9876543210',
                location: JSON.stringify({ state: 'Uttarakhand', district: 'Dehradun' })
            },
            {
                id: 'LAB001',
                name: 'AyurTest Labs',
                type: 'laboratory',
                email: 'lab@ayurtest.com',
                phone: '+91-1234567890',
                location: JSON.stringify({ state: 'Delhi', district: 'New Delhi' })
            },
            {
                id: 'PROC001',
                name: 'Herbal Processing Unit',
                type: 'processor',
                email: 'processing@herbalunit.com',
                phone: '+91-9988776655',
                location: JSON.stringify({ state: 'Uttar Pradesh', district: 'Noida' })
            },
            {
                id: 'MFG001',
                name: 'Ayur Formulations Pvt Ltd',
                type: 'manufacturer',
                email: 'info@ayurformulations.com',
                phone: '+91-8877665544',
                location: JSON.stringify({ state: 'Gujarat', district: 'Ahmedabad' })
            }
        ];

        const insertUser = db.prepare(`INSERT OR IGNORE INTO users (id, name, type, email, phone, location, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)`);
        users.forEach(user => {
            insertUser.run(user.id, user.name, user.type, user.email, user.phone, user.location, Date.now());
        });
        insertUser.finalize();

        console.log('Database initialized successfully');
    });
}

module.exports = db;