# MoMo Data Analysis API Documentation

## Overview
This API provides endpoints to fetch, filter, and analyze MoMo transaction data with pagination support.

## Base URL
```
http://localhost:3000
```

## Endpoints

### 1. Get All Transactions
**GET** `/api/transactions`

Fetch transactions with pagination and filtering capabilities.

#### Query Parameters

| Parameter | Type | Description | Example |
|-----------|------|-------------|---------|
| `page` | integer | Page number (default: 1) | `?page=2` |
| `limit` | integer | Records per page (1-100, default: 10) | `?limit=20` |
| `type` | string | Transaction type filter | `?type=INCOMING` |
| `date` | string | Exact date filter (YYYY-MM-DD) | `?date=2024-01-15` |
| `startDate` | string | Start date for range (YYYY-MM-DD) | `?startDate=2024-01-01` |
| `endDate` | string | End date for range (YYYY-MM-DD) | `?endDate=2024-01-31` |
| `minAmount` | number | Minimum amount filter | `?minAmount=1000` |
| `maxAmount` | number | Maximum amount filter | `?maxAmount=5000` |

#### Example Requests

```bash
# Get first page with 10 transactions
GET /api/transactions

# Get page 2 with 20 transactions
GET /api/transactions?page=2&limit=20

# Filter by transaction type
GET /api/transactions?type=INCOMING

# Filter by date range
GET /api/transactions?startDate=2024-01-01&endDate=2024-01-31

# Filter by amount range
GET /api/transactions?minAmount=1000&maxAmount=5000

# Combined filters
GET /api/transactions?type=PAYMENT&startDate=2024-01-01&minAmount=500&page=1&limit=15
```

#### Response Format

```json
{
  "success": true,
  "message": "Transactions fetched successfully",
  "data": [
    {
      "id": 1,
      "transactionId": "TXN123456",
      "type": "INCOMING",
      "amount": 5000,
      "timestamp": "2024-01-15 10:30:00",
      "currency": "RWF",
      "sender": "John Doe",
      "originalSMS": "You have received 5000 RWF...",
      "transaction_type": "INCOMING"
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 5,
    "totalRecords": 47,
    "hasNextPage": true,
    "hasPrevPage": false,
    "limit": 10
  },
  "filters": {
    "type": "INCOMING"
  }
}
```

### 2. Get Transaction Statistics
**GET** `/api/transactions/stats`

Get aggregated statistics for transactions with optional filtering.

#### Query Parameters
Same filtering parameters as the main transactions endpoint.

#### Example Request
```bash
GET /api/transactions/stats?startDate=2024-01-01&endDate=2024-01-31
```

#### Response Format
```json
{
  "success": true,
  "message": "Transaction statistics fetched successfully",
  "data": {
    "totalTransactions": 150,
    "totalAmount": 2500000,
    "averageAmount": 16666.67,
    "transactionsByType": {
      "INCOMING": {
        "count": 45,
        "totalAmount": 750000,
        "averageAmount": 16666.67
      },
      "PAYMENT": {
        "count": 60,
        "totalAmount": 900000,
        "averageAmount": 15000
      }
    }
  },
  "filters": {
    "startDate": "2024-01-01",
    "endDate": "2024-01-31"
  }
}
```

### 3. Get Available Transaction Types
**GET** `/api/transactions/types`

Get all available transaction types in the system.

#### Response Format
```json
{
  "success": true,
  "message": "Transaction types fetched successfully",
  "data": [
    "INCOMING",
    "RECLAIMED", 
    "PAYMENT",
    "BANK_DEPOSIT",
    "TRANSFER",
    "WITHDRAWN",
    "AIRTIME_BILL",
    "UTILITY_BILL",
    "THIRD_PARTY"
  ]
}
```

### 4. Get Specific Transaction
**GET** `/api/transactions/:id`

Get a specific transaction by ID or transaction ID.

#### Parameters
- `id`: Transaction ID or internal ID

#### Example Request
```bash
GET /api/transactions/TXN123456
```

#### Response Format
```json
{
  "success": true,
  "message": "Transaction found",
  "data": {
    "id": 1,
    "transactionId": "TXN123456",
    "type": "INCOMING",
    "amount": 5000,
    "timestamp": "2024-01-15 10:30:00",
    "currency": "RWF",
    "sender": "John Doe",
    "originalSMS": "You have received 5000 RWF...",
    "table_name": "incoming"
  }
}
```

### 5. Health Check
**GET** `/health`

Check if the API server is running.

#### Response Format
```json
{
  "success": true,
  "message": "MoMo Data Analysis API is running",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### 6. API Information
**GET** `/`

Get API information and available endpoints.

#### Response Format
```json
{
  "success": true,
  "message": "Welcome to MoMo Data Analysis API",
  "version": "1.0.0",
  "endpoints": {
    "transactions": "/api/transactions",
    "transactionStats": "/api/transactions/stats", 
    "transactionTypes": "/api/transactions/types",
    "health": "/health"
  }
}
```

## Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "message": "Invalid date format. Use YYYY-MM-DD"
}
```

### 404 Not Found
```json
{
  "success": false,
  "message": "Transaction not found"
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "message": "Internal server error",
  "error": "Database connection failed" // Only in development mode
}
```

## Transaction Types

The API supports the following transaction types:

- **INCOMING**: Money received
- **RECLAIMED**: Reclaimed transactions
- **PAYMENT**: Payments to code holders
- **BANK_DEPOSIT**: Bank deposits
- **TRANSFER**: Transfers to mobile numbers
- **WITHDRAWN**: Withdrawals from agents
- **AIRTIME_BILL**: Airtime bill payments
- **UTILITY_BILL**: Utility bill payments (Cash Power, etc.)
- **THIRD_PARTY**: Transactions initiated by third parties

## Usage Examples

### Frontend JavaScript Integration

```javascript
// Fetch transactions with filters
async function fetchTransactions(filters = {}) {
  const params = new URLSearchParams(filters);
  const response = await fetch(`/api/transactions?${params}`);
  const data = await response.json();
  
  if (data.success) {
    return data;
  } else {
    throw new Error(data.message);
  }
}

// Usage
const transactions = await fetchTransactions({
  type: 'INCOMING',
  startDate: '2024-01-01',
  endDate: '2024-01-31',
  page: 1,
  limit: 20
});
```

### Curl Examples

```bash
# Get transactions with pagination
curl "http://localhost:3000/api/transactions?page=1&limit=10"

# Filter by type and date range
curl "http://localhost:3000/api/transactions?type=PAYMENT&startDate=2024-01-01&endDate=2024-01-31"

# Get statistics
curl "http://localhost:3000/api/transactions/stats"

# Get specific transaction
curl "http://localhost:3000/api/transactions/TXN123456"
```

## Rate Limiting

Currently, no rate limiting is implemented. In production, please consider implementing rate limiting to prevent abuse.

## CORS

CORS is enabled for all origins in development. In production, configure CORS to allow only specific origins.

## Security Considerations

- Input validation is implemented for query parameters
- SQL injection protection through parameterized queries
- Error messages are sanitized in production mode
- We will consider implementing authentication and authorization for production use
