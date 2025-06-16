# MoMo Data Analysis API Documentation

A lightweight, Node.js-based backend for parsing, storing, and serving Mobile Money (MoMo) transaction data extracted from SMS messages. It provides API endpoints for accessing filtered, paginated, and categorized transaction information, as well as statistical summaries.

---

## ⚙️ Features

* **Full REST API** for querying transaction data
* **MySQL Database** for persistent transaction storage
* **Fast-XML Parsing** to transform SMS into structured records
* **Search Support** with full-text search on `originalSMS`
* **Statistics Endpoint** for dashboard insights
* **Auto-routing by Type and Table ID**
* **Frontend Hosting**: Serves the static frontend from `/`

---

## 📍 API Overview

### Base URL

```
http://localhost:3000
```

### Available Endpoints

| Endpoint                           | Method | Description                                                              |
| ---------------------------------- | ------ | ------------------------------------------------------------------------ |
| `/api/transactions`                | GET    | List transactions with pagination, filters, and full-text search (`?q=`) |
| `/api/transactions/stats`          | GET    | Summary statistics grouped by transaction type and month                 |
| `/api/transactions/types`          | GET    | List all unique transaction types                                        |
| `/api/transactions/:transactionId` | GET    | Find transaction using DB `transactionId` field (may be null)            |
| `/api/transactions/:type/:id`      | GET    | Find by internal table ID + table type                                   |
| `/api/health`                      | GET    | API health check                                                         |

---

## 🧠 Transaction Structure

Example object returned from API:

```json
{
  "id": 42,
  "transactionId": "ABC12345",
  "type": "INCOMING",
  "amount": 5000,
  "fee": 0,
  "currency": "RWF",
  "sender": "John Doe",
  "receiver": null,
  "timestamp": "2024-06-01T10:00:00Z",
  "originalSMS": "You have received 5,000 RWF from John Doe..."
}
```

### Supported Types

* `INCOMING`
* `RECLAIMED`
* `PAYMENT`
* `BANK_DEPOSIT`
* `TRANSFER`
* `WITHDRAWN`
* `AIRTIME_BILL`
* `UTILITY_BILL`
* `THIRD_PARTY`

---

## 🏗 Project Structure

```
backend/
├── app.js                # Express setup and static frontend mount
├── routes/               # API route definitions
├── services/             # Business logic
├── utils/                # SMS parsing, helpers
├── database.js           # DB config and connection pool
├── .env                  # Environment variables (port, db creds)
```

---

## ▶️ Running Locally

```bash
cd backend
npm install
npm run dev
```

Then visit:

```
http://localhost:3000
```

Frontend will load from `/`.

---

## 🧪 Development Notes

* **No authentication** or user sessions (yet)
* **No caching** implemented
* Error handling returns basic JSON error responses
* All time data is returned in ISO 8601 UTC format

---

## 📞 Support

Contact the development team for bug reports or feature suggestions.

---

**Built for MTN MoMo transaction intelligence | 2025**
