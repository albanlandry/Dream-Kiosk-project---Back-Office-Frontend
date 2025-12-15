# Proposals Tests

This directory contains tests for proposal-related functionality.

## Test Files

### 1. `proposals-api.test.ts`
Tests for Proposals API operations:
- **GET Operations**: Fetching all proposals, fetching by ID
- **CREATE Operations**: Creating new proposals with required and optional fields (including images)
- **UPDATE Operations**: Updating proposal information
- **DELETE Operations**: Deleting proposals
- **QR Code Generation**: Fetching QR codes for proposal downloads
- **Statistics**: Calculating proposal statistics

**Test Count**: 10 tests

### 2. `CreateProposalModal.test.tsx`
Tests for CreateProposalModal component:
- Modal rendering (open/close states)
- Form validation
- Project loading
- Image upload handling
- Form submission
- Error handling

**Note**: Component tests require additional setup for complex form interactions and may need refinement.

### 3. `ProposalQRCodeModal.test.tsx`
Tests for ProposalQRCodeModal component:
- Modal rendering
- QR code loading
- Loading states
- QR code display
- URL copying
- QR code download
- Error handling

**Note**: Component tests require additional setup for complex interactions and may need refinement.

## Running Tests

```bash
# Run all proposal tests
npm test -- __tests__/proposals/

# Run specific test file
npm test -- __tests__/proposals/proposals-api.test.ts

# Run in watch mode
npm run test:watch -- __tests__/proposals/

# Run with coverage
npm run test:coverage -- __tests__/proposals/
```

## Test Coverage

The tests cover:
- ✅ Proposal CRUD operations (Create, Read, Update, Delete)
- ✅ QR code generation API
- ✅ Statistics calculation
- ✅ Error handling
- ✅ API response parsing (with and without data wrapper)

## API Endpoints Tested

- `GET /proposals` - List all proposals
- `GET /proposals/:id` - Get proposal by ID
- `POST /proposals` - Create new proposal
- `PATCH /proposals/:id` - Update proposal
- `DELETE /proposals/:id` - Delete proposal
- `GET /proposals/:id/download-qr` - Get QR code for proposal download

