document.addEventListener("DOMContentLoaded", () => {
  // Mock Data based on API Contract
  const mockApiData = {
    transactions: [
      {
        id: 1,
        type: "Incoming Money",
        amount: 5000,
        timestamp: "2025-05-15T10:00:00Z",
        details: {
          from: "John Doe",
          transaction_id: "123456",
          currency: "RWF",
        },
      },
      {
        id: 2,
        type: "Payments to Code Holders",
        amount: 1500,
        timestamp: "2025-05-14T14:30:00Z",
        details: {
          to: "Jane Smith",
          transaction_id: "789012",
          currency: "RWF",
        },
      },
      {
        id: 3,
        type: "Airtime Bill Payments",
        amount: 3000,
        timestamp: "2025-05-12T16:00:00Z",
        details: { transaction_id: "345678", fee: 50, currency: "RWF" },
      },
      {
        id: 4,
        type: "Withdrawals from Agents",
        amount: 20000,
        timestamp: "2025-04-28T12:00:00Z",
        details: {
          agent_name: "Agent 007",
          agent_number: "250123456789",
          currency: "RWF",
        },
      },
      {
        id: 5,
        type: "Internet and Voice Bundle Purchases",
        amount: 2000,
        timestamp: "2025-04-25T09:00:00Z",
        details: { bundle: "1GB", currency: "RWF" },
      },
      {
        id: 6,
        type: "Incoming Money",
        amount: 15000,
        timestamp: "2025-04-20T11:00:00Z",
        details: { from: "Alice", transaction_id: "987654", currency: "RWF" },
      },
      {
        id: 7,
        type: "Bank Transfers",
        amount: 50000,
        timestamp: "2025-04-15T18:00:00Z",
        details: {
          to_bank: "Bank of Kigali",
          to_account: "1000123",
          currency: "RWF",
        },
      },
      {
        id: 8,
        type: "Cash Power Bill Payments",
        amount: 12500,
        timestamp: "2025-04-10T13:45:00Z",
        details: {
          meter_number: "04123456789",
          token: "1234-5678-9012-3456",
          currency: "RWF",
        },
      },
      {
        id: 9,
        type: "Incoming Money",
        amount: 7500,
        timestamp: "2025-03-22T19:20:00Z",
        details: { from: "Bob", transaction_id: "555444", currency: "RWF" },
      },
      {
        id: 10,
        type: "Payments to Code Holders",
        amount: 4200,
        timestamp: "2025-03-18T08:00:00Z",
        details: {
          to: "Groceries Store",
          transaction_id: "333222",
          currency: "RWF",
        },
      },
      {
        id: 11,
        type: "Bank Deposits",
        amount: 100000,
        timestamp: "2025-03-10T15:00:00Z",
        details: { to_bank: "Equity Bank", currency: "RWF" },
      },
      {
        id: 12,
        type: "Incoming Money",
        amount: 2500,
        timestamp: "2025-02-15T12:00:00Z",
        details: { from: "Charlie", transaction_id: "111000", currency: "RWF" },
      },
      {
        id: 13,
        type: "Airtime Bill Payments",
        amount: 5000,
        timestamp: "2025-02-05T17:30:00Z",
        details: { transaction_id: "999888", fee: 50, currency: "RWF" },
      },
      {
        id: 14,
        type: "Failed to Parse",
        amount: 0,
        timestamp: "2025-01-30T10:00:00Z",
        details: {
          raw_sms_body: "Yello! Your transfer of an unknown amount failed.",
          error_message: "Amount not found",
        },
      },
      {
        id: 15,
        type: "Incoming Money",
        amount: 3000,
        timestamp: "2025-01-20T14:00:00Z",
        details: { from: "David", transaction_id: "777666", currency: "RWF" },
      },
    ],
    dashboardSummary: {
      totalVolumeByType: [],
      monthlySummary: [],
      distribution: { payments: {}, deposits: {} },
    },
  };

  const state = {
    transactions: [],
  };

  const chartInstances = {};

  // --- DATA PROCESSING ---
  function processDataForDashboard(transactions) {
    const summary = {
      totalVolumeByType: {},
      monthlySummary: Array(12)
        .fill(0)
        .map((_, i) => ({
          month: new Date(0, i).toLocaleString("default", { month: "short" }),
          income: 0,
          expenditure: 0,
        })),
      distribution: { payments: {}, deposits: {} },
    };

    const incomeTypes = ["Incoming Money", "Bank Deposits"];
    const paymentTypes = [
      "Payments to Code Holders",
      "Airtime Bill Payments",
      "Cash Power Bill Payments",
      "Withdrawals from Agents",
      "Bank Transfers",
      "Internet and Voice Bundle Purchases",
    ];

    transactions.forEach((tx) => {
      // Total Volume
      if (tx.type !== "Failed to Parse") {
        summary.totalVolumeByType[tx.type] =
          (summary.totalVolumeByType[tx.type] || 0) + tx.amount;
      }

      const monthIndex = new Date(tx.timestamp).getMonth();

      // Monthly Summary & Distribution
      if (incomeTypes.includes(tx.type)) {
        summary.monthlySummary[monthIndex].income += tx.amount;
        summary.distribution.deposits[tx.type] =
          (summary.distribution.deposits[tx.type] || 0) + tx.amount;
      } else if (paymentTypes.includes(tx.type)) {
        summary.monthlySummary[monthIndex].expenditure += tx.amount;
        summary.distribution.payments[tx.type] =
          (summary.distribution.payments[tx.type] || 0) + tx.amount;
      }
    });

    mockApiData.dashboardSummary.totalVolumeByType = Object.entries(
      summary.totalVolumeByType
    ).map(([type, totalAmount]) => ({ type, totalAmount }));
    mockApiData.dashboardSummary.monthlySummary = summary.monthlySummary;
    mockApiData.dashboardSummary.distribution = summary.distribution;
  }

  // --- UI RENDERING ---

  function renderDashboard() {
    renderTotalVolumeCards();
    renderMonthlySummaryChart();
    renderDistributionChart();
  }
  function renderTotalVolumeCards() {
    const transactions = state.transactions.filter(
      (tx) => tx.type !== "Failed to Parse"
    );

    // Calculate metrics
    const totalTransactions = transactions.length;
    const totalVolume = transactions.reduce((sum, tx) => sum + tx.amount, 0);
    const averageAmount =
      totalTransactions > 0 ? totalVolume / totalTransactions : 0;
    const transactionTypes = [...new Set(transactions.map((tx) => tx.type))]
      .length;

    // Update card elements
    const totalTransactionsEl = document.getElementById("total-transactions");
    const totalVolumeEl = document.getElementById("total-volume");
    const transactionTypesEl = document.getElementById("transaction-types");
    const avgAmountEl = document.getElementById("avg-amount");

    if (totalTransactionsEl) {
      totalTransactionsEl.textContent =
        totalTransactions.toLocaleString("en-US");
    }
    if (totalVolumeEl) {
      totalVolumeEl.textContent = totalVolume.toLocaleString("en-US");
    }
    if (transactionTypesEl) {
      transactionTypesEl.textContent = transactionTypes.toString();
    }
    if (avgAmountEl) {
      avgAmountEl.textContent =
        Math.round(averageAmount).toLocaleString("en-US");
    }
  }

  function renderChart(canvasId, type, data, options) {
    if (chartInstances[canvasId]) {
      chartInstances[canvasId].destroy();
    }
    const ctx = document.getElementById(canvasId).getContext("2d");
    chartInstances[canvasId] = new Chart(ctx, { type, data, options });
  }

  function renderMonthlySummaryChart() {
    const { monthlySummary } = mockApiData.dashboardSummary;
    const data = {
      labels: monthlySummary.map((d) => d.month),
      datasets: [
        {
          label: "Income",
          data: monthlySummary.map((d) => d.income),
          backgroundColor: "rgba(0, 79, 113, 0.7)",
          borderColor: "#004f71",
          borderWidth: 1,
        },
        {
          label: "Expenditure",
          data: monthlySummary.map((d) => d.expenditure),
          backgroundColor: "rgba(178, 34, 34, 0.7)",
          borderColor: "rgba(178, 34, 34, 0.7)",
          borderWidth: 1,
        },
      ],
    };
    const options = {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          beginAtZero: true,
          ticks: { callback: (value) => `${value / 1000}k` },
        },
      },
      plugins: { legend: { position: "top" } },
    };
    renderChart("monthlySummaryChart", "bar", data, options);
  }

  function renderDistributionChart() {
    const { distribution } = mockApiData.dashboardSummary;
    const paymentData = { ...distribution.payments, ...distribution.deposits };

    const data = {
      labels: Object.keys(paymentData),
      datasets: [
        {
          label: "Distribution",
          data: Object.values(paymentData),
          backgroundColor: [
            "rgba(65, 141, 65, 0.7)",   // Forest green - for Incoming Money
            "rgba(44, 98, 143, 0.7)",  // Steel blue - for Bank Deposits  
            "rgba(172, 101, 238, 0.7)",  // Blue violet - for Airtime Bill Payments
            "rgba(206, 103, 103, 0.7)",   // Indian red - for Payments to Code Holders
            "rgba(196, 156, 56, 0.7)",  // Dark goldenrod - for Bank Transfers
            "rgba(144, 61, 113, 0.7)",   // Dark slate blue - for Withdrawals from Agents
            "rgba(116, 107, 175, 0.7)",  // Slate blue - for Cash Power Bill Payments
            "rgba(178, 34, 34, 0.7)",   // Fire brick - for Internet and Voice Bundle
          ],
          hoverOffset: 4,
        },
      ],
    };
    const options = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { position: "bottom", labels: { boxWidth: 12 } } },
    };
    renderChart("distributionChart", "doughnut", data, options);
  }

  // --- INITIALIZATION ---
  function init() {
    state.transactions = mockApiData.transactions.sort(
      (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
    );
    processDataForDashboard(state.transactions);
    renderDashboard();
  }

  init();
});
