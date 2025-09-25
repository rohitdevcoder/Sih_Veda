const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const QRCode = require('qrcode');
const { Blockchain, SmartContracts } = require('./blockchain/blockchain');
const db = require('./database/init');

const app = express();
const PORT = process.env.PORT || 3000;

// Initialize blockchain
const blockchain = new Blockchain();

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));

// Helper function to save blockchain to database
function saveBlockchainToDB() {
    const latestBlock = blockchain.getLatestBlock();
    db.run(
        `INSERT INTO blockchain (block_hash, previous_hash, timestamp, nonce, data) VALUES (?, ?, ?, ?, ?)`,
        [latestBlock.hash, latestBlock.previousHash, latestBlock.timestamp, latestBlock.nonce, JSON.stringify(latestBlock.data)],
        (err) => {
            if (err) console.error('Error saving block to DB:', err);
        }
    );
}

// API Routes

// Get all users
app.get('/api/users', (req, res) => {
    db.all('SELECT * FROM users', (err, users) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(users);
    });
});

// Record collection event (harvest)
app.post('/api/collection', (req, res) => {
    try {
        const collectionEvent = {
            id: SmartContracts.generateBatchId('BATCH', req.body.collectorId),
            type: 'CollectionEvent',
            timestamp: Date.now(),
            collectorId: req.body.collectorId,
            species: req.body.species,
            quantity: req.body.quantity,
            location: {
                latitude: req.body.latitude,
                longitude: req.body.longitude,
                address: req.body.address
            },
            harvestMethod: req.body.harvestMethod,
            organic: req.body.organic || false,
            fairTrade: req.body.fairTrade || false,
            sustainabilityScore: 0
        };

        // Calculate sustainability score
        collectionEvent.sustainabilityScore = SmartContracts.calculateSustainabilityScore(collectionEvent);

        // Add to blockchain
        blockchain.addTransaction(collectionEvent);
        
        // Save to database
        db.run(
            `INSERT INTO transactions (id, type, batch_id, timestamp, data, status) VALUES (?, ?, ?, ?, ?, ?)`,
            [collectionEvent.id, collectionEvent.type, collectionEvent.id, collectionEvent.timestamp, JSON.stringify(collectionEvent), 'pending'],
            (err) => {
                if (err) {
                    return res.status(500).json({ error: err.message });
                }
                
                // Mine the block
                blockchain.minePendingTransactions();
                saveBlockchainToDB();
                
                res.json({
                    success: true,
                    batchId: collectionEvent.id,
                    sustainabilityScore: collectionEvent.sustainabilityScore,
                    message: 'Collection event recorded successfully'
                });
            }
        );
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Record quality test
app.post('/api/quality-test', (req, res) => {
    try {
        const qualityTest = {
            id: uuidv4(),
            type: 'QualityTest',
            timestamp: Date.now(),
            batchId: req.body.batchId,
            labId: req.body.labId,
            testType: req.body.testType,
            results: req.body.results,
            certificate: req.body.certificate,
            passed: req.body.passed
        };

        // Add to blockchain
        blockchain.addTransaction(qualityTest);
        
        // Save to database
        db.run(
            `INSERT INTO transactions (id, type, batch_id, timestamp, data, status) VALUES (?, ?, ?, ?, ?, ?)`,
            [qualityTest.id, qualityTest.type, qualityTest.batchId, qualityTest.timestamp, JSON.stringify(qualityTest), 'pending'],
            (err) => {
                if (err) {
                    return res.status(500).json({ error: err.message });
                }
                
                // Mine the block
                blockchain.minePendingTransactions();
                saveBlockchainToDB();
                
                res.json({
                    success: true,
                    testId: qualityTest.id,
                    message: 'Quality test recorded successfully'
                });
            }
        );
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Record processing step
app.post('/api/processing', (req, res) => {
    try {
        const processingStep = {
            id: uuidv4(),
            type: 'ProcessingStep',
            timestamp: Date.now(),
            batchId: req.body.batchId,
            facilityId: req.body.facilityId,
            processType: req.body.processType,
            temperature: req.body.temperature,
            duration: req.body.duration,
            outputQuantity: req.body.outputQuantity,
            notes: req.body.notes
        };

        // Add to blockchain
        blockchain.addTransaction(processingStep);
        
        // Save to database
        db.run(
            `INSERT INTO transactions (id, type, batch_id, timestamp, data, status) VALUES (?, ?, ?, ?, ?, ?)`,
            [processingStep.id, processingStep.type, processingStep.batchId, processingStep.timestamp, JSON.stringify(processingStep), 'pending'],
            (err) => {
                if (err) {
                    return res.status(500).json({ error: err.message });
                }
                
                // Mine the block
                blockchain.minePendingTransactions();
                saveBlockchainToDB();
                
                res.json({
                    success: true,
                    processingId: processingStep.id,
                    message: 'Processing step recorded successfully'
                });
            }
        );
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Create final product with QR code
app.post('/api/product', async (req, res) => {
    try {
        const productId = `PROD-${uuidv4().substring(0, 8).toUpperCase()}`;
        const qrCodeId = `QR-${uuidv4().substring(0, 12).toUpperCase()}`;
        
        const product = {
            id: productId,
            type: 'Product',
            timestamp: Date.now(),
            name: req.body.name,
            batchId: productId,
            manufacturerId: req.body.manufacturerId,
            ingredients: req.body.ingredients, // Array of { name, sourceBatchId, percentage }
            manufacturingDate: req.body.manufacturingDate,
            expiryDate: req.body.expiryDate,
            qrCode: qrCodeId
        };

        // Add to blockchain
        blockchain.addTransaction(product);
        
        // Generate QR code
        const qrData = {
            productId: productId,
            qrCode: qrCodeId,
            verificationUrl: `http://localhost:${PORT}/verify.html?qr=${qrCodeId}`
        };
        
        const qrCodeImage = await QRCode.toDataURL(JSON.stringify(qrData));
        
        // Save product to database
        db.run(
            `INSERT INTO products (id, name, batch_id, qr_code, manufacturer_id, created_at) VALUES (?, ?, ?, ?, ?, ?)`,
            [productId, product.name, productId, qrCodeId, product.manufacturerId, product.timestamp],
            (err) => {
                if (err) {
                    return res.status(500).json({ error: err.message });
                }
                
                // Save QR code mapping
                db.run(
                    `INSERT INTO qr_codes (code, product_id, created_at) VALUES (?, ?, ?)`,
                    [qrCodeId, productId, product.timestamp],
                    (err) => {
                        if (err) {
                            return res.status(500).json({ error: err.message });
                        }
                        
                        // Save transaction
                        db.run(
                            `INSERT INTO transactions (id, type, batch_id, timestamp, data, status) VALUES (?, ?, ?, ?, ?, ?)`,
                            [product.id, product.type, product.batchId, product.timestamp, JSON.stringify(product), 'pending'],
                            (err) => {
                                if (err) {
                                    return res.status(500).json({ error: err.message });
                                }
                                
                                // Mine the block
                                blockchain.minePendingTransactions();
                                saveBlockchainToDB();
                                
                                res.json({
                                    success: true,
                                    productId: productId,
                                    qrCode: qrCodeId,
                                    qrCodeImage: qrCodeImage,
                                    message: 'Product created successfully'
                                });
                            }
                        );
                    }
                );
            }
        );
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Get product provenance by QR code
app.get('/api/provenance/:qrCode', (req, res) => {
    const qrCode = req.params.qrCode;
    
    // Update scan count
    db.run(`UPDATE qr_codes SET scan_count = scan_count + 1 WHERE code = ?`, [qrCode]);
    
    // Get product ID from QR code
    db.get(`SELECT product_id FROM qr_codes WHERE code = ?`, [qrCode], (err, row) => {
        if (err || !row) {
            return res.status(404).json({ error: 'Invalid QR code' });
        }
        
        const productId = row.product_id;
        
        // Get product details
        db.get(`SELECT * FROM products WHERE id = ?`, [productId], (err, product) => {
            if (err || !product) {
                return res.status(404).json({ error: 'Product not found' });
            }
            
            // Get all transactions for this product
            db.get(`SELECT data FROM transactions WHERE id = ?`, [productId], (err, productTx) => {
                if (err || !productTx) {
                    return res.status(404).json({ error: 'Product transaction not found' });
                }
                
                const productData = JSON.parse(productTx.data);
                
                // Get provenance for each ingredient
                const ingredientPromises = productData.ingredients.map(ingredient => {
                    return new Promise((resolve) => {
                        db.all(
                            `SELECT * FROM transactions WHERE batch_id = ? ORDER BY timestamp`,
                            [ingredient.sourceBatchId],
                            (err, transactions) => {
                                if (err) {
                                    resolve({ ingredient, history: [] });
                                } else {
                                    resolve({
                                        ingredient,
                                        history: transactions.map(t => JSON.parse(t.data))
                                    });
                                }
                            }
                        );
                    });
                });
                
                Promise.all(ingredientPromises).then(ingredients => {
                    // Get manufacturer details
                    db.get(`SELECT * FROM users WHERE id = ?`, [product.manufacturer_id], (err, manufacturer) => {
                        const provenance = {
                            product: {
                                id: product.id,
                                name: product.name,
                                manufacturer: manufacturer ? {
                                    name: manufacturer.name,
                                    location: JSON.parse(manufacturer.location || '{}')
                                } : null,
                                createdAt: new Date(product.created_at).toISOString()
                            },
                            ingredients: ingredients,
                            verificationStatus: 'verified',
                            blockchainValid: blockchain.isChainValid()
                        };
                        
                        res.json(provenance);
                    });
                });
            });
        });
    });
});

// Get batch history
app.get('/api/batch/:batchId', (req, res) => {
    const batchId = req.params.batchId;
    
    db.all(
        `SELECT * FROM transactions WHERE batch_id = ? ORDER BY timestamp`,
        [batchId],
        (err, transactions) => {
            if (err) {
                return res.status(500).json({ error: err.message });
            }
            
            const history = transactions.map(t => JSON.parse(t.data));
            res.json({
                batchId: batchId,
                history: history,
                chainOfCustody: SmartContracts.verifyChainOfCustody(history)
            });
        }
    );
});

// Blockchain health check
app.get('/api/blockchain/health', (req, res) => {
    res.json({
        isValid: blockchain.isChainValid(),
        chainLength: blockchain.chain.length,
        pendingTransactions: blockchain.pendingTransactions.length,
        latestBlock: {
            hash: blockchain.getLatestBlock().hash,
            timestamp: blockchain.getLatestBlock().timestamp
        }
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`Blockchain initialized with genesis block`);
});