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
    const container = document.getElementById("totalVolumeContainer");
    container.innerHTML = "";
    const transactions = state.transactions.filter(
      (tx) => tx.type !== "Failed to Parse"
    );

    // Calculate metrics
    const totalTransactions = transactions.length;
    const totalVolume = transactions.reduce((sum, tx) => sum + tx.amount, 0);
    const averageAmount =
      totalTransactions > 0 ? totalVolume / totalTransactions : 0;

    const metrics = [
      {
        label: "Total Transactions",
        value: totalTransactions.toLocaleString("en-US"),
        suffix: "",
      },
      {
        label: "Total Volume",
        value: totalVolume.toLocaleString("en-US"),
        suffix: " RWF",
      },
      {
        label: "Average Amount",
        value: Math.round(averageAmount).toLocaleString("en-US"),
        suffix: " RWF",
      },
    ];

    metrics.forEach(({ label, value, suffix }) => {
      const card = `
                <div class="bg-white p-6 rounded-lg shadow-sm">
                    <h4 class="text-sm font-medium text-gray-500 truncate">${label}</h4>
                    <p class="mt-1 text-3xl font-semibold text-gray-900">${value}${suffix}</p>
                </div>`;
      container.innerHTML += card;
    });
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
          backgroundColor: "rgba(54, 162, 235, 0.6)",
          borderColor: "rgba(54, 162, 235, 1)",
          borderWidth: 1,
        },
        {
          label: "Expenditure",
          data: monthlySummary.map((d) => d.expenditure),
          backgroundColor: "rgba(255, 99, 132, 0.6)",
          borderColor: "rgba(255, 99, 132, 1)",
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
            "rgba(255, 99, 132, 0.7)",
            "rgba(54, 162, 235, 0.7)",
            "rgba(255, 206, 86, 0.7)",
            "rgba(75, 192, 192, 0.7)",
            "rgba(153, 102, 255, 0.7)",
            "rgba(255, 159, 64, 0.7)",
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
