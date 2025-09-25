# 🌿 Ayurvedic Herb Traceability System - MVP

A blockchain-based traceability system for Ayurvedic herbs that tracks the complete journey from geo-tagged harvest locations to final products with QR code verification.

## 🚀 Features

### Core Functionality
- **Blockchain-Based Tracking**: Immutable ledger recording every supply chain event
- **GPS Geo-tagging**: Capture precise harvest locations with coordinates
- **Smart Contract Validation**: Automated enforcement of quality and sustainability rules
- **QR Code Generation**: Unique codes for each product enabling consumer verification
- **Complete Provenance**: Track herbs from collection through processing to final product
- **Consumer Portal**: Public verification of product authenticity and journey

### Supply Chain Events Tracked
1. **Collection Events**: Harvest location, collector, quantity, sustainability score
2. **Quality Testing**: Lab results for moisture, pesticides, heavy metals, DNA barcoding
3. **Processing Steps**: Drying, grinding, extraction with temperature and duration tracking
4. **Product Creation**: Final formulation with ingredient traceability

## 📋 Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)
- Modern web browser (Chrome, Firefox, Edge, Safari)

## 🛠️ Installation

1. Navigate to the project directory:
```bash
cd ayurvedic-traceability-mvp
```

2. Install dependencies (already done):
```bash
npm install
```

3. Start the server:
```bash
npm start
```

4. Open your browser and navigate to:
```
http://localhost:3000
```

## 📱 How to Use

### For Supply Chain Stakeholders

#### 1. Recording a Harvest (Farmers/Collectors)
- Click "Record Collection" on the dashboard
- Click "Get GPS Location" to capture coordinates (or use demo coordinates)
- Fill in:
  - Species name (e.g., "Withania somnifera (Ashwagandha)")
  - Quantity harvested
  - Location details
  - Harvest method
  - Organic/Fair Trade certifications
- Submit to receive a Batch ID and Sustainability Score

#### 2. Recording Quality Tests (Laboratories)
- Click "Quality Testing" on the dashboard
- Enter the Batch ID from collection
- Select test type (moisture, pesticide, etc.)
- Enter test results and certificate number
- Mark as Passed/Failed

#### 3. Recording Processing (Processing Units)
- Click "Processing Step" on the dashboard
- Enter Batch ID
- Select process type (drying, grinding, etc.)
- Enter temperature, duration, output quantity
- Add any notes

#### 4. Creating Final Product (Manufacturers)
- Click "Create Product" on the dashboard
- Enter product name (e.g., "Ashwagandha Churna 100g")
- Link to processed batch ID
- Set manufacturing and expiry dates
- Generate QR code for the product

### For Consumers

#### Verifying Product Authenticity
1. Click "Verify Product" on the dashboard or go to `/verify-new.html`
2. Enter the QR code from product packaging (e.g., "QR-ABC123XYZ")
3. View complete product journey including:
   - Harvest location with GPS coordinates
   - All quality tests performed
   - Processing steps
   - Manufacturer details
   - Blockchain verification status

## 🧪 Testing the System

### Sample Workflow for Ashwagandha Product

1. **Record Collection**:
   - Collector: FARMER001 (Ramesh Kumar)
   - Species: Withania somnifera (Ashwagandha)
   - Quantity: 25 kg
   - Location: Dehradun, Uttarakhand (30.3165, 78.0322)
   - Method: Sustainable Collection
   - Check: Organic ✓, Fair Trade ✓

2. **Quality Test** (use the Batch ID from step 1):
   - Test Type: Moisture Content
   - Value: 8.5%
   - Result: Passed

3. **Processing** (use the same Batch ID):
   - Process: Drying
   - Temperature: 45°C
   - Duration: 6 hours
   - Output: 20 kg

4. **Create Product** (use the same Batch ID):
   - Name: Ashwagandha Churna 100g
   - Manufacturing Date: Today
   - Expiry Date: 2 years from today

5. **Verify Product**:
   - Use the QR code generated in step 4
   - View complete traceability timeline

## 🏗️ System Architecture

### Technology Stack
- **Backend**: Node.js + Express.js
- **Blockchain**: Custom implementation with SHA-256 hashing
- **Database**: SQLite (simulating distributed ledger)
- **Frontend**: HTML5 + Vanilla JavaScript
- **QR Codes**: qrcode library for generation

### Smart Contract Rules
- **Geo-fencing**: Validates harvest within approved Indian coordinates
- **Seasonal Restrictions**: Prevents harvesting during monsoon (June-Sept)
- **Quality Thresholds**: 
  - Moisture < 12%
  - Pesticide residue < 0.01 ppm
- **Temperature Limits**: Drying temperature < 60°C
- **Sustainability Scoring**: Based on quantity, organic, and fair trade

### API Endpoints

- `GET /api/users` - List all stakeholders
- `POST /api/collection` - Record harvest event
- `POST /api/quality-test` - Record lab test
- `POST /api/processing` - Record processing step
- `POST /api/product` - Create final product with QR
- `GET /api/provenance/:qrCode` - Get complete product journey
- `GET /api/batch/:batchId` - Get batch history
- `GET /api/blockchain/health` - Check blockchain status

## 📊 Database Schema

- **blockchain**: Stores mined blocks
- **transactions**: All supply chain events
- **users**: Stakeholders (farmers, labs, processors, manufacturers)
- **products**: Final products with QR mappings
- **qr_codes**: QR code to product mapping with scan tracking

## 🔒 Security Features

- Immutable blockchain ledger
- Cryptographic hashing (SHA-256)
- Transaction validation before mining
- Chain integrity verification
- GPS coordinate validation

## 🚧 Limitations (MVP)

This is a simplified MVP demonstration. Production deployment would require:
- Full Hyperledger Fabric or similar enterprise blockchain
- Distributed node architecture
- Enhanced authentication & authorization
- IoT sensor integration for automated data capture
- Mobile apps for field data collection
- Integration with existing ERP systems
- Compliance with AYUSH Ministry regulations

## 📈 Future Enhancements

- Real-time IoT sensor data integration
- Machine learning for quality prediction
- Farmer payment tracking with smart contracts
- Carbon footprint calculation
- Multi-language support for rural users
- Offline-first mobile apps with sync
- Integration with e-commerce platforms
- Advanced analytics dashboard

## 📞 Support

This is an MVP demonstration. For production deployment considerations, please consult with blockchain and supply chain experts.

## 📜 License

MIT License - This is an educational prototype.

---

**Note**: This MVP demonstrates the core concepts of blockchain-based traceability for Ayurvedic herbs. It uses a simplified blockchain implementation for demonstration purposes. For production use, implement with enterprise blockchain platforms like Hyperledger Fabric or Corda.