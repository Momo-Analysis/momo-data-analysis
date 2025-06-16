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

  // --- THEME TOGGLE FUNCTIONALITY ---
  function initThemeToggle() {
    const themeToggle = document.getElementById("theme-toggle");
    const sunIcon = document.getElementById("sun-icon");
    const moonIcon = document.getElementById("moon-icon");
    const body = document.body;

    // Check for saved theme preference or default to light mode
    const savedTheme = localStorage.getItem("theme") || "light";

    if (savedTheme === "dark") {
      body.classList.add("dark");
      sunIcon.classList.remove("hidden");
      moonIcon.classList.add("hidden");
    } else {
      body.classList.remove("dark");
      sunIcon.classList.add("hidden");
      moonIcon.classList.remove("hidden");
    }

    // Theme toggle event listener
    themeToggle.addEventListener("click", () => {
      const isDark = body.classList.contains("dark");

      if (isDark) {
        // Switch to light mode
        body.classList.remove("dark");
        sunIcon.classList.add("hidden");
        moonIcon.classList.remove("hidden");
        localStorage.setItem("theme", "light");
      } else {
        // Switch to dark mode
        body.classList.add("dark");
        sunIcon.classList.remove("hidden");
        moonIcon.classList.add("hidden");
        localStorage.setItem("theme", "dark");
      }
    });
  }

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
      if (filters.type && filters.type !== "All Types")
        queryParams.append("type", filters.type);
      if (filters.startDate) queryParams.append("startDate", filters.startDate);
      if (filters.endDate) queryParams.append("endDate", filters.endDate);

      const response = await fetch(
        `${API_BASE_URL}/transactions/stats?${queryParams.toString()}`
      );
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

  // --- UI RENDERING ---
  async function renderDashboard() {
    const isApiHealthy = await checkApiHealth();
    if (!isApiHealthy) {
      alert(
        "The API is currently unavailable. Dashboard data may not load correctly."
      );
    }

    const stats = await fetchTransactionStats(state.filters);

    // Use chart data from stats endpoint instead of fetching all transactions
    if (stats.chartData) {
      state.dashboardSummary.totalVolumeByType =
        stats.chartData.totalVolumeByType;
      state.dashboardSummary.monthlySummary = stats.chartData.monthlySummary;
      state.dashboardSummary.distribution = stats.chartData.distribution;
    }

    renderTotalVolumeCards(stats);
    renderMonthlySummaryChart();
    renderDistributionChart();
  }

  async function renderTotalVolumeCards(stats) {
    const types = await fetchTransactionTypes();

    const totalTransactions = stats.totalTransactions;
    const totalVolume = stats.totalAmount;
    const averageAmount = stats.averageAmount || 0;
    const transactionTypes = types.length;

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
          borderWidth: 1,
          borderColor: "hsl(217, 19%, 50%)",
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
    initThemeToggle();
    await renderDashboard();
  }

  init();
});
