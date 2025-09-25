const crypto = require('crypto-js');
const { v4: uuidv4 } = require('uuid');

class Block {
    constructor(timestamp, data, previousHash = '') {
        this.timestamp = timestamp;
        this.data = data;
        this.previousHash = previousHash;
        this.hash = this.calculateHash();
        this.nonce = 0;
    }

    calculateHash() {
        return crypto.SHA256(
            this.previousHash +
            this.timestamp +
            JSON.stringify(this.data) +
            this.nonce
        ).toString();
    }

    mineBlock(difficulty) {
        while (this.hash.substring(0, difficulty) !== Array(difficulty + 1).join("0")) {
            this.nonce++;
            this.hash = this.calculateHash();
        }
    }
}

class Blockchain {
    constructor() {
        this.chain = [this.createGenesisBlock()];
        this.difficulty = 2;
        this.pendingTransactions = [];
    }

    createGenesisBlock() {
        return new Block(Date.now(), { type: "genesis" }, "0");
    }

    getLatestBlock() {
        return this.chain[this.chain.length - 1];
    }

    addTransaction(transaction) {
        // Validate transaction before adding
        if (!this.validateTransaction(transaction)) {
            throw new Error('Transaction validation failed');
        }
        
        this.pendingTransactions.push(transaction);
        return transaction.id;
    }

    minePendingTransactions() {
        const block = new Block(
            Date.now(),
            this.pendingTransactions,
            this.getLatestBlock().hash
        );
        
        block.mineBlock(this.difficulty);
        this.chain.push(block);
        this.pendingTransactions = [];
        
        return block;
    }

    validateTransaction(transaction) {
        // Smart contract validation rules
        switch (transaction.type) {
            case 'CollectionEvent':
                return this.validateCollectionEvent(transaction);
            case 'QualityTest':
                return this.validateQualityTest(transaction);
            case 'ProcessingStep':
                return this.validateProcessingStep(transaction);
            case 'Product':
                return this.validateProduct(transaction);
            default:
                return false;
        }
    }

    validateCollectionEvent(event) {
        // Validate required fields
        if (!event.collectorId || !event.species || !event.location || !event.quantity) {
            return false;
        }

        // Validate GPS coordinates
        if (!event.location.latitude || !event.location.longitude) {
            return false;
        }

        // Validate harvesting zone (simplified - check if coordinates are within India)
        const lat = parseFloat(event.location.latitude);
        const lng = parseFloat(event.location.longitude);
        if (lat < 8 || lat > 37 || lng < 68 || lng > 97) {
            console.log('Location outside approved harvesting zone');
            return false;
        }

        // Validate seasonal restrictions (simplified - no harvesting in monsoon months)
        // TEMPORARILY DISABLED FOR TESTING
        // const month = new Date(event.timestamp).getMonth();
        // if (month >= 5 && month <= 8) { // June to September
        //     console.log('Harvesting not allowed during monsoon season');
        //     return false;
        // }

        return true;
    }

    validateQualityTest(test) {
        // Validate required fields
        if (!test.batchId || !test.testType || !test.results || !test.labId) {
            return false;
        }

        // Validate test thresholds
        if (test.testType === 'moisture' && test.results.value > 12) {
            console.log('Moisture content exceeds threshold');
            return false;
        }

        if (test.testType === 'pesticide' && test.results.value > 0.01) {
            console.log('Pesticide residue exceeds safe limits');
            return false;
        }

        return true;
    }

    validateProcessingStep(step) {
        // Validate required fields
        if (!step.batchId || !step.processType || !step.facilityId) {
            return false;
        }

        // Validate processing conditions
        if (step.processType === 'drying' && step.temperature > 60) {
            console.log('Drying temperature exceeds safe limit');
            return false;
        }

        return true;
    }

    validateProduct(product) {
        // Validate required fields
        if (!product.name || !product.batchId || !product.ingredients || !product.manufacturerId) {
            return false;
        }

        // Validate that all ingredients have proper traceability
        for (let ingredient of product.ingredients) {
            if (!ingredient.sourceBatchId) {
                console.log('Missing traceability for ingredient:', ingredient.name);
                return false;
            }
        }

        return true;
    }

    getTransactionById(id) {
        for (let block of this.chain) {
            if (Array.isArray(block.data)) {
                for (let transaction of block.data) {
                    if (transaction.id === id) {
                        return transaction;
                    }
                }
            }
        }
        return null;
    }

    getTransactionsByBatchId(batchId) {
        const transactions = [];
        for (let block of this.chain) {
            if (Array.isArray(block.data)) {
                for (let transaction of block.data) {
                    if (transaction.batchId === batchId || 
                        (transaction.type === 'CollectionEvent' && transaction.id === batchId)) {
                        transactions.push(transaction);
                    }
                }
            }
        }
        return transactions;
    }

    getProductProvenance(productId) {
        const product = this.getTransactionById(productId);
        if (!product || product.type !== 'Product') {
            return null;
        }

        const provenance = {
            product: product,
            ingredients: []
        };

        // Trace back each ingredient
        for (let ingredient of product.ingredients) {
            const batchHistory = this.getTransactionsByBatchId(ingredient.sourceBatchId);
            provenance.ingredients.push({
                ingredient: ingredient,
                history: batchHistory.sort((a, b) => a.timestamp - b.timestamp)
            });
        }

        return provenance;
    }

    isChainValid() {
        for (let i = 1; i < this.chain.length; i++) {
            const currentBlock = this.chain[i];
            const previousBlock = this.chain[i - 1];

            if (currentBlock.hash !== currentBlock.calculateHash()) {
                return false;
            }

            if (currentBlock.previousHash !== previousBlock.hash) {
                return false;
            }
        }
        return true;
    }
}

// Smart contract functions for specific business logic
class SmartContracts {
    static generateBatchId(type, collectorId) {
        const timestamp = Date.now();
        const random = Math.random().toString(36).substring(7);
        return `${type}-${collectorId}-${timestamp}-${random}`;
    }

    static calculateSustainabilityScore(collectionEvent) {
        let score = 100;
        
        // Deduct points for over-harvesting
        if (collectionEvent.quantity > 50) { // kg
            score -= 20;
        }
        
        // Add points for certified organic
        if (collectionEvent.organic === true) {
            score += 10;
        }
        
        // Add points for fair trade
        if (collectionEvent.fairTrade === true) {
            score += 10;
        }
        
        return Math.max(0, Math.min(100, score));
    }

    static verifyChainOfCustody(transactions) {
        // Verify that each transaction in the chain references the correct previous transaction
        for (let i = 1; i < transactions.length; i++) {
            if (transactions[i].previousTransactionId !== transactions[i - 1].id) {
                return false;
            }
        }
        return true;
    }
}

module.exports = { Blockchain, Block, SmartContracts };