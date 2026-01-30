const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());

// MySQL connection
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '5Haron.com05',
    database: 'quickfind_db'
});

// Connect to database
db.connect((err) => {
    if (err) {
        console.error('❌ Database connection failed:', err.message);
        return;
    }
    console.log('✅ Connected to MySQL database');
});

// Test route
app.get('/', (req, res) => {
    res.json({ message: 'QuickFind backend is connected to MySQL' });
});

// GET all approved vendors
app.get('/vendors', (req, res) => {
    const sql = "SELECT * FROM vendors WHERE status = 'approved'";

    db.query(sql, (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Database error' });
        }

        res.json(results);
    });
});

// GET one vendor by ID
app.get('/vendors/id/:id', (req, res) => {
    const vendorId = req.params.id;

    const sql = "SELECT * FROM vendors WHERE vendor_id = ?";

    db.query(sql, [vendorId], (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Database error' });
        }

        if (results.length === 0) {
            return res.status(404).json({ message: 'Vendor not found' });
        }

        res.json(results[0]);
    });
});

// GET vendors by category
app.get('/vendors/:category', (req, res) => {
    const category = req.params.category;

    const sql = `
        SELECT * FROM vendors
        WHERE category = ? AND status = 'approved'
    `;

    db.query(sql, [category], (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Database error' });
        }

        res.json(results);
    });
});

// POST add a new vendor (status = pending)
app.post('/vendors', (req, res) => {
    const { business_name, category, location, phone, image } = req.body;

    const sql = `
        INSERT INTO vendors (business_name, category, location, phone, image, status)
        VALUES (?, ?, ?, ?, ?, 'pending')
    `;

    db.query(
        sql,
        [business_name, category, location, phone, image],
        (err, result) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ error: 'Failed to add vendor' });
            }

            res.json({ message: 'Vendor submitted for approval' });
        }
    );
});

// PUT update vendor status
app.put('/vendors/:id', (req, res) => {
    const vendorId = req.params.id;
    const { status } = req.body;

    const sql = "UPDATE vendors SET status = ? WHERE vendor_id = ?";

    db.query(sql, [status, vendorId], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Failed to update vendor' });
        }

        res.json({ message: 'Vendor status updated successfully' });
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});
