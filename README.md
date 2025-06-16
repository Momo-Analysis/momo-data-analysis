# MoMo SMS Transaction Analytics

A full-stack application for parsing, storing, filtering, and analyzing Mobile Money (MoMo) SMS transactions. Built with a modern JavaScript stack (Express.js + MySQL backend, HTML/CSS/JavaScript frontend) to help users visualize transaction trends and statistics.

---

## 🚀 Features

### Backend (Express.js + MySQL)

* **Transaction CRUD API** with filters and pagination
* **Advanced Search** via full-text `originalSMS` field
* **Transaction Statistics** with breakdown by type and totals
* **Health Check Endpoint** at `/api/health`
* **Type and Table-aware Routes**

  * `/api/transactions/:transactionId` resolves using `transactionId` (can be `null`)
  * `/api/transactions/:type/:id` resolves using `type` table and numeric ID

### Frontend (HTML5 + TailwindCSS + Chart.js)

* **Dashboard**: Overview of volume and trends by type and time
* **Transaction List Page**: Paginated and filterable
* **Transaction Detail Page**: Deep-dive into a single transaction
* **Filtering**:

  * By type
  * Date range
  * Amount range
  * Full-text search (`q` param)
* **Responsive Design**: Mobile-friendly layout

---

## 🎓 Tech Stack

* **Backend**:

  * Node.js + Express
  * MySQL (via `mysql2`)
  * Fast-XML-Parser for parsing raw messages
* **Frontend**:

  * Vanilla JavaScript
  * Tailwind CSS (via CDN)
  * Chart.js (for all graphs)
* **Dev Tools**:

  * Nodemon, dotenv, ESLint, Prettier

---

## 🔎 API Overview

### Base URL

```
http://localhost:3000
```

### Endpoints Summary

| Endpoint                           | Method | Description                                                      |
| ---------------------------------- | ------ | ---------------------------------------------------------------- |
| `/api/transactions`                | GET    | List transactions with filters, pagination, and full-text search |
| `/api/transactions/stats`          | GET    | Return statistics like total amount, averages, etc.              |
| `/api/transactions/types`          | GET    | Return all available transaction types                           |
| `/api/transactions/:transactionId` | GET    | Get a transaction by its unique transactionId                    |
| `/api/transactions/:type/:id`      | GET    | Get a transaction by table and internal ID                       |
| `/api/health`                      | GET    | Health check                                                     |

---

## 📂 Directory Structure

```
project-root/
├── backend/
│   ├── controllers/
│   ├── routes/
│   ├── services/
│   ├── utils/
│   ├── database.js
│   └── app.js
├── frontend/
│   ├── index.html            # Dashboard
│   ├── transactions.html     # List view
│   ├── transaction.html      # Detail view
│   ├── css/
│   │   └── styles.css
│   ├── js/
│   │   ├── dashboard.js
│   │   ├── transactions.js
│   │   ├── transaction.js
│   │   └── utils.js
├── .env
├── package.json
└── README.md (this file)
```

---

## 📊 Transaction Types

These are the supported categories for transaction analysis:

* **INCOMING**: Money received
* **RECLAIMED**: Reclaimed transactions
* **PAYMENT**: Payments to code holders
* **BANK\_DEPOSIT**: Bank deposits
* **TRANSFER**: Transfers to mobile numbers
* **WITHDRAWN**: Withdrawals from agents
* **AIRTIME\_BILL**: Airtime bill payments
* **UTILITY\_BILL**: Utility bill payments (Cash Power, etc.)
* **THIRD\_PARTY**: Transactions initiated by third parties

---

## 🌐 Running the App Locally

### Backend

```bash
cd backend
npm install
npm run dev
```

Open http\://localhost:3000 in your browser.

---

## ❄ Notes & Limitations

* No export or download features are implemented
* No caching or local storage usage in frontend
* No user auth or sessions yet
* All filters apply only to the transaction list
* Charts are powered by Chart.js

---

## 🛍 Support

For support or technical help, contact the dev team.

---

**Built for MTN MoMo Analytics | 2025**
