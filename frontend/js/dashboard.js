document.addEventListener("DOMContentLoaded", () => {
  const state = {
    transactions: [],
    dashboardSummary: {
      totalVolumeByType: [],
      monthlySummary: [],
      distribution: { payments: {}, deposits: {} },
    },
    filters: { type: "All Types", startDate: "", endDate: "" },
  };

  const chartInstances = {};
  const API_BASE_URL = "http://localhost:3000/api";

  // --- API CALLS ---
  async function checkApiHealth() {
    try {
      const response = await fetch(`${API_BASE_URL}/health`);
      const result = await response.json();
      return result.success;
    } catch (error) {
      console.error("API health check failed:", error);
      return false;
    }
  }

  async function fetchTransactionStats(filters = {}) {
    try {
      const queryParams = new URLSearchParams();
      if (filters.type && filters.type !== "All Types") queryParams.append("type", filters.type);
      if (filters.startDate) queryParams.append("startDate", filters.startDate);
      if (filters.endDate) queryParams.append("endDate", filters.endDate);

      const response = await fetch(`${API_BASE_URL}/transactions/stats?${queryParams.toString()}`);
      const result = await response.json();
      if (!result.success) {
        throw new Error(result.message || "Failed to fetch transaction stats");
      }
      return result.data;
    } catch (error) {
      console.error("Error fetching transaction stats:", error);
      alert("Failed to load transaction statistics. Please try again later.");
      return { totalTransactions: 0, totalAmount: 0 };
    }
  }

  async function fetchTransactions(filters = {}) {
    try {
      const queryParams = new URLSearchParams({
        page: 1,
        limit: 1000, // Fetch a large number of transactions for charts
      });
      if (filters.type && filters.type !== "All Types") queryParams.append("type", filters.type);
      if (filters.startDate) queryParams.append("startDate", filters.startDate);
      if (filters.endDate) queryParams.append("endDate", filters.endDate);

      const response = await fetch(`${API_BASE_URL}/transactions?${queryParams.toString()}`);
      const result = await response.json();
      if (!result.success) {
        throw new Error(result.message || "Failed to fetch transactions");
      }
      return result.data;
    } catch (error) {
      console.error("Error fetching transactions:", error);
      alert("Failed to load transactions. Please try again later.");
      return [];
    }
  }

  async function fetchTransactionTypes() {
    try {
      const response = await fetch(`${API_BASE_URL}/transactions/types`);
      const result = await response.json();
      if (!result.success) {
        throw new Error(result.message || "Failed to fetch transaction types");
      }
      return result.data;
    } catch (error) {
      console.error("Error fetching transaction types:", error);
      return [];
    }
  }

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

    const incomeTypes = ["INCOMING", "BANK_DEPOSIT"];
    const paymentTypes = [
      "PAYMENT",
      "AIRTIME_BILL",
      "UTILITY_BILL",
      "WITHDRAWN",
      "TRANSFER",
      "THIRD_PARTY",
    ];

    transactions.forEach((tx) => {
      if (tx.type !== "FAILED") {
        summary.totalVolumeByType[tx.type] =
          (summary.totalVolumeByType[tx.type] || 0) + tx.amount;
      }

      const monthIndex = new Date(tx.timestamp).getMonth();

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

    state.dashboardSummary.totalVolumeByType = Object.entries(summary.totalVolumeByType).map(
      ([type, totalAmount]) => ({ type, totalAmount })
    );
    state.dashboardSummary.monthlySummary = summary.monthlySummary;
    state.dashboardSummary.distribution = summary.distribution;
  }

  // --- UI RENDERING ---
  async function renderDashboard() {
    const isApiHealthy = await checkApiHealth();
    if (!isApiHealthy) {
      alert("The API is currently unavailable. Dashboard data may not load correctly.");
    }

    const stats = await fetchTransactionStats(state.filters);
    const transactions = await fetchTransactions(state.filters);
    state.transactions = transactions;

    processDataForDashboard(transactions);
    renderTotalVolumeCards(stats);
    renderMonthlySummaryChart();
    renderDistributionChart();
  }

  async function renderTotalVolumeCards(stats) {
    const types = await fetchTransactionTypes();
    const transactions = state.transactions.filter((tx) => tx.type !== "FAILED");

    const totalTransactions = stats.totalTransactions;
    const totalVolume = stats.totalAmount;
    const averageAmount = totalTransactions > 0 ? totalVolume / totalTransactions : 0;
    const transactionTypes = types.length;

    const totalTransactionsEl = document.getElementById("total-transactions");
    const totalVolumeEl = document.getElementById("total-volume");
    const transactionTypesEl = document.getElementById("transaction-types");
    const avgAmountEl = document.getElementById("avg-amount");

    if (totalTransactionsEl) {
      totalTransactionsEl.textContent = totalTransactions.toLocaleString("en-US");
    }
    if (totalVolumeEl) {
      totalVolumeEl.textContent = totalVolume.toLocaleString("en-US");
    }
    if (transactionTypesEl) {
      transactionTypesEl.textContent = transactionTypes.toString();
    }
    if (avgAmountEl) {
      avgAmountEl.textContent = Math.round(averageAmount).toLocaleString("en-US");
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
    const { monthlySummary } = state.dashboardSummary;
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
    const { distribution } = state.dashboardSummary;
    const paymentData = { ...distribution.payments, ...distribution.deposits };

    const data = {
      labels: Object.keys(paymentData),
      datasets: [
        {
          label: "Distribution",
          data: Object.values(paymentData),
          backgroundColor: [
            "rgba(65, 141, 65, 0.7)", // Forest green - INCOMING
            "rgba(44, 98, 143, 0.7)", // Steel blue - BANK_DEPOSIT
            "rgba(172, 101, 238, 0.7)", // Blue violet - PAYMENT
            "rgba(206, 103, 103, 0.7)", // Indian red - AIRTIME_BILL
            "rgba(196, 156, 56, 0.7)", // Dark goldenrod - TRANSFER
            "rgba(144, 61, 113, 0.7)", // Dark slate blue - WITHDRAWN
            "rgba(116, 107, 175, 0.7)", // Slate blue - UTILITY_BILL
            "rgba(178, 34, 34, 0.7)", // Fire brick - THIRD_PARTY
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
  async function init() {
    await renderDashboard();
  }

  init();
});