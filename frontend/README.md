# MTN MoMo SMS Analytics Frontend

A clean, responsive frontend interface for analyzing MTN Mobile Money (MoMo) SMS transaction data. Built with modern HTML/CSS/JS, integrated directly with the backend server.

## ✨ Features

### Pages

* **Dashboard (********`/`****\*\*\*\*\*\*\*\*\*\*\*\*)**

  * Chart-based summaries by transaction type and month
  * Overview of trends and volume
* **Transaction List (********`/transactions.html`****\*\*\*\*\*\*\*\*\*\*\*\*)**

  * Filter by type, date range, and amount range
  * Search using full-text on original SMS
  * Sortable, paginated table
  * Transactions details is an on-page model

### Visuals

* **Chart.js**: Interactive, responsive graphs (bar, line, donut)
* **Tailwind CSS**: Mobile-first utility classes for styling

## 📊 Filtering Capabilities

* **By Type**: e.g., INCOMING, PAYMENT
* **By Date Range**
* **By Amount Range**
* **Full-text Search**: Using `q` parameter against `originalSMS`

## 🌎 Running

The frontend is served directly from the backend Express server. Start the backend and open:

```
http://localhost:3000
```

## 📁 Project Structure

```
frontend/
├── index.html            # Dashboard
├── transactions.html     # List view
├── transaction.html      # Detail view
├── css/
│   └── styles.css        # Custom styles
├── js/
│   ├── dashboard.js      # Dashboard charts
│   ├── transactions.js   # List filtering
│   └── utils.js          # Shared helpers
```

## 📈 Transaction Types (Updated)

* **INCOMING**: Money received
* **RECLAIMED**: Reclaimed transactions
* **PAYMENT**: Payments to code holders
* **BANK\_DEPOSIT**: Deposits to bank
* **TRANSFER**: Transfer to mobile
* **WITHDRAWN**: Agent withdrawals
* **AIRTIME\_BILL**: Airtime payments
* **UTILITY\_BILL**: Utility bill payments
* **THIRD\_PARTY**: Initiated by third party

## ⚡ Limitations

* No data export or download functionality
* No real-time filtering or chart updating
* No localStorage or user customization

## 🚧 Tech Stack

* HTML5 + TailwindCSS (via CDN)
* Chart.js for data visualization
* Vanilla JavaScript (ES6+)

---

**Built with simplicity and clarity for MoMo analytics.**
