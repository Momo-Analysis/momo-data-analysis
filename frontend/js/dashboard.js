// Dashboard functionality for MTN MoMo SMS Analytics
// Handles chart rendering, data display, and user interactions

class MoMoDashboard {
  constructor() {
    this.transactions = [];
    this.filteredTransactions = [];
    this.charts = {};
    this.currentFilters = {};

    this.init();
  }

  /**
   * Initialize the dashboard
   */
  init() {
    this.loadData();
    this.setupEventListeners();
    this.loadUserPreferences();
  }

  /**
   * Load mock data and render dashboard
   */
  loadData() {
    showLoading();

    // Simulate API call delay
    setTimeout(() => {
      this.transactions = mockTransactions;
      this.filteredTransactions = [...this.transactions];

      this.renderSummaryCards();
      this.renderCharts();
      this.updateQuickStats();

      hideLoading();
      showToast("Dashboard data loaded successfully", "success");
    }, 1000);
  }

  /**
   * Setup event listeners for filters and interactions
   */
  setupEventListeners() {
    // Filter controls
    const applyFiltersBtn = document.getElementById("apply-filters");
    const resetFiltersBtn = document.getElementById("reset-filters");

    if (applyFiltersBtn) {
      applyFiltersBtn.addEventListener("click", () => this.applyFilters());
    }

    if (resetFiltersBtn) {
      resetFiltersBtn.addEventListener("click", () => this.resetFilters());
    }

    // Real-time filter updates
    const filterInputs = [
      "transaction-type",
      "date-from",
      "date-to",
      "amount-min",
      "amount-max",
    ];

    filterInputs.forEach((id) => {
      const element = document.getElementById(id);
      if (element) {
        element.addEventListener(
          "change",
          debounce(() => this.applyFilters(), 300)
        );
      }
    });

    // Window resize handler for responsive charts
    window.addEventListener(
      "resize",
      debounce(() => this.resizeCharts(), 250)
    );
  }

  /**
   * Render summary cards with analytics data
   */
  renderSummaryCards() {
    const analytics = calculateAnalytics(this.filteredTransactions);

    // Update card values with animation
    this.updateCardValue("total-transactions", analytics.totalTransactions);
    this.updateCardValue(
      "total-volume",
      formatCurrency(analytics.totalVolume),
      true
    );
    this.updateCardValue("month-transactions", analytics.monthTransactions);
    this.updateCardValue(
      "avg-amount",
      formatCurrency(analytics.averageAmount),
      true
    );
  }

  /**
   * Update card value with animation
   */
  updateCardValue(elementId, value, isCurrency = false) {
    const element = document.getElementById(elementId);
    if (!element) return;

    if (isCurrency) {
      element.textContent = value;
    } else {
      animateCounter(element, parseInt(value) || 0);
    }
  }

  /**
   * Render all charts
   */
  renderCharts() {
    this.renderVolumeByTypeChart();
    this.renderPaymentDistributionChart();
    this.renderMonthlySummaryChart();
  }

  /**
   * Render transaction volume by type horizontal bar chart
   */
  renderVolumeByTypeChart() {
    const chartContainer = document.getElementById("volume-by-type-chart");
    if (!chartContainer) return;

    // Calculate data from filtered transactions
    const typeData = this.calculateVolumeByType();

    const options = {
      series: [
        {
          name: "Transaction Volume",
          data: Object.values(typeData),
        },
      ],
      chart: {
        type: "bar",
        height: 300,
        toolbar: {
          show: false,
        },
        background: "transparent",
      },
      plotOptions: {
        bar: {
          borderRadius: 4,
          horizontal: true,
          distributed: true,
          barHeight: "70%",
        },
      },
      dataLabels: {
        enabled: true,
        formatter: function (val) {
          return formatCurrency(val);
        },
        style: {
          fontSize: "12px",
          fontWeight: "bold",
        },
      },
      colors: ["#1E3A8A", "#10B981", "#FFCB05", "#1E3A8A"],
      xaxis: {
        categories: Object.keys(typeData).map(
          (type) => transactionTypeLabels[type] || type
        ),
        labels: {
          formatter: function (val) {
            return formatCurrency(val);
          },
        },
      },
      yaxis: {
        labels: {
          style: {
            fontSize: "12px",
          },
        },
      },
      grid: {
        show: true,
        strokeDashArray: 3,
        borderColor: "#e5e7eb",
      },
      tooltip: {
        theme: "light",
        y: {
          formatter: function (val) {
            return formatCurrency(val);
          },
        },
      },
      legend: {
        show: false,
      },
    };

    // Destroy existing chart if it exists
    if (this.charts.volumeByType) {
      this.charts.volumeByType.destroy();
    }

    this.charts.volumeByType = new ApexCharts(chartContainer, options);
    this.charts.volumeByType.render();
  }

  /**
   * Render payment distribution donut chart
   */
  renderPaymentDistributionChart() {
    const chartContainer = document.getElementById(
      "payment-distribution-chart"
    );
    if (!chartContainer) return;

    const distributionData = this.calculatePaymentDistribution();

    const options = {
      series: [distributionData.outgoing, distributionData.incoming],
      chart: {
        type: "donut",
        height: 300,
        toolbar: {
          show: false,
        },
      },
      labels: ["Outgoing Payments", "Incoming Money"],
      colors: ["#FFCB05", "#10B981"],
      plotOptions: {
        pie: {
          donut: {
            size: "60%",
            labels: {
              show: true,
              total: {
                show: true,
                label: "Total",
                formatter: function (w) {
                  return w.globals.seriesTotals.reduce((a, b) => a + b, 0);
                },
              },
            },
          },
        },
      },
      dataLabels: {
        enabled: true,
        formatter: function (val, opts) {
          return Math.round(val) + "%";
        },
      },
      legend: {
        position: "bottom",
        fontSize: "14px",
      },
      tooltip: {
        theme: "light",
        y: {
          formatter: function (val) {
            return Math.round(val) + "%";
          },
        },
      },
      responsive: [
        {
          breakpoint: 480,
          options: {
            chart: {
              height: 250,
            },
            legend: {
              position: "bottom",
            },
          },
        },
      ],
    };

    if (this.charts.paymentDistribution) {
      this.charts.paymentDistribution.destroy();
    }

    this.charts.paymentDistribution = new ApexCharts(chartContainer, options);
    this.charts.paymentDistribution.render();
  }

  /**
   * Render monthly transaction summary line chart
   */
  renderMonthlySummaryChart() {
    const chartContainer = document.getElementById("monthly-summary-chart");
    if (!chartContainer) return;

    const monthlyData = mockAnalytics.monthlyData;

    const options = {
      series: [
        {
          name: "Transactions",
          type: "column",
          data: monthlyData.map((d) => d.transactions),
        },
        {
          name: "Volume (RWF)",
          type: "line",
          data: monthlyData.map((d) => d.volume),
        },
      ],
      chart: {
        height: 350,
        type: "line",
        toolbar: {
          show: true,
          tools: {
            download: true,
            selection: false,
            zoom: false,
            zoomin: false,
            zoomout: false,
            pan: false,
            reset: false,
          },
        },
      },
      stroke: {
        width: [0, 4],
        curve: "smooth",
      },
      colors: ["#1E3A8A", "#10B981"],
      plotOptions: {
        bar: {
          borderRadius: 4,
          columnWidth: "60%",
        },
      },
      fill: {
        type: ["solid", "gradient"],
        gradient: {
          shade: "light",
          type: "vertical",
          shadeIntensity: 0.25,
          gradientToColors: undefined,
          inverseColors: false,
          opacityFrom: 0.85,
          opacityTo: 0.25,
          stops: [50, 0, 100],
        },
      },
      dataLabels: {
        enabled: false,
      },
      xaxis: {
        categories: monthlyData.map((d) => d.month),
        labels: {
          style: {
            fontSize: "12px",
          },
        },
      },
      yaxis: [
        {
          title: {
            text: "Number of Transactions",
            style: {
              fontSize: "12px",
            },
          },
          labels: {
            formatter: function (val) {
              return Math.round(val);
            },
          },
        },
        {
          opposite: true,
          title: {
            text: "Volume (RWF)",
            style: {
              fontSize: "12px",
            },
          },
          labels: {
            formatter: function (val) {
              return formatCurrency(val);
            },
          },
        },
      ],
      grid: {
        strokeDashArray: 3,
        borderColor: "#e5e7eb",
      },
      legend: {
        position: "top",
        horizontalAlign: "right",
      },
      tooltip: {
        theme: "light",
        shared: true,
        intersect: false,
        y: [
          {
            formatter: function (val) {
              return val + " transactions";
            },
          },
          {
            formatter: function (val) {
              return formatCurrency(val);
            },
          },
        ],
      },
    };

    if (this.charts.monthlySummary) {
      this.charts.monthlySummary.destroy();
    }

    this.charts.monthlySummary = new ApexCharts(chartContainer, options);
    this.charts.monthlySummary.render();
  }

  /**
   * Calculate volume by transaction type
   */
  calculateVolumeByType() {
    const typeVolumes = {};

    this.filteredTransactions.forEach((transaction) => {
      if (!typeVolumes[transaction.type]) {
        typeVolumes[transaction.type] = 0;
      }
      typeVolumes[transaction.type] += transaction.amount;
    });

    return typeVolumes;
  }

  /**
   * Calculate payment distribution
   */
  calculatePaymentDistribution() {
    const total = this.filteredTransactions.length;
    if (total === 0) return { incoming: 0, outgoing: 0 };

    const incoming = this.filteredTransactions.filter(
      (t) => t.type === "incoming_money"
    ).length;
    const outgoing = total - incoming;

    return {
      incoming: Math.round((incoming / total) * 100),
      outgoing: Math.round((outgoing / total) * 100),
    };
  }

  /**
   * Update quick stats sidebar
   */
  updateQuickStats() {
    const analytics = calculateAnalytics(this.filteredTransactions);

    const elements = {
      "today-transactions": analytics.todayTransactions,
      "pending-transactions": analytics.pendingTransactions,
      "failed-transactions": analytics.failedTransactions,
    };

    Object.entries(elements).forEach(([id, value]) => {
      const element = document.getElementById(id);
      if (element) {
        element.textContent = value;
      }
    });
  }

  /**
   * Apply filters to transactions
   */
  applyFilters() {
    const filters = this.getFilterValues();
    this.currentFilters = filters;

    this.filteredTransactions = filterTransactions(this.transactions, filters);

    // Update all dashboard components
    this.renderSummaryCards();
    this.renderCharts();
    this.updateQuickStats();

    // Save filter preferences
    this.saveUserPreferences();

    showToast(
      `Showing ${this.filteredTransactions.length} transactions`,
      "info"
    );
  }

  /**
   * Reset all filters
   */
  resetFilters() {
    // Clear filter inputs
    const filterElements = [
      "transaction-type",
      "date-from",
      "date-to",
      "amount-min",
      "amount-max",
    ];

    filterElements.forEach((id) => {
      const element = document.getElementById(id);
      if (element) {
        element.value = "";
      }
    });

    this.currentFilters = {};
    this.filteredTransactions = [...this.transactions];

    // Update dashboard
    this.renderSummaryCards();
    this.renderCharts();
    this.updateQuickStats();

    // Clear saved preferences
    this.saveUserPreferences();

    showToast("Filters reset successfully", "success");
  }

  /**
   * Get current filter values from form
   */
  getFilterValues() {
    return {
      type: document.getElementById("transaction-type")?.value || "",
      dateFrom: document.getElementById("date-from")?.value || "",
      dateTo: document.getElementById("date-to")?.value || "",
      amountMin:
        parseFloat(document.getElementById("amount-min")?.value) || null,
      amountMax:
        parseFloat(document.getElementById("amount-max")?.value) || null,
    };
  }

  /**
   * Resize charts for responsive design
   */
  resizeCharts() {
    Object.values(this.charts).forEach((chart) => {
      if (chart && chart.windowResizeHandler) {
        chart.windowResizeHandler();
      }
    });
  }

  /**
   * Save user preferences to localStorage
   */
  saveUserPreferences() {
    savePreference("dashboard-filters", this.currentFilters);
  }

  /**
   * Load user preferences from localStorage
   */
  loadUserPreferences() {
    const savedFilters = loadPreference("dashboard-filters", {});

    if (Object.keys(savedFilters).length > 0) {
      // Apply saved filters to form
      Object.entries(savedFilters).forEach(([key, value]) => {
        let elementId;
        switch (key) {
          case "type":
            elementId = "transaction-type";
            break;
          case "dateFrom":
            elementId = "date-from";
            break;
          case "dateTo":
            elementId = "date-to";
            break;
          case "amountMin":
            elementId = "amount-min";
            break;
          case "amountMax":
            elementId = "amount-max";
            break;
        }

        if (elementId && value) {
          const element = document.getElementById(elementId);
          if (element) {
            element.value = value;
          }
        }
      });

      this.currentFilters = savedFilters;
    }
  }
}

// Initialize dashboard when DOM is loaded
document.addEventListener("DOMContentLoaded", function () {
  // Initialize the dashboard
  window.dashboard = new MoMoDashboard();
  // Setup mobile menu toggle
  const mobileMenuButton = document.getElementById("mobile-menu-btn");
  const mobileMenu = document.getElementById("mobile-menu");
  if (mobileMenuButton && mobileMenu) {
    mobileMenuButton.addEventListener("click", function () {
      const isExpanded = this.getAttribute("aria-expanded") === "true";
      this.setAttribute("aria-expanded", !isExpanded);
      mobileMenu.classList.toggle("hidden");
    });
  }

  // Add keyboard shortcuts
  document.addEventListener("keydown", function (e) {
    // Ctrl/Cmd + R to refresh data
    if ((e.ctrlKey || e.metaKey) && e.key === "r") {
      e.preventDefault();
      window.dashboard.loadData();
    }

    // Escape to reset filters
    if (e.key === "Escape") {
      window.dashboard.resetFilters();
    }
  });
});

// Export for potential module use
if (typeof module !== "undefined" && module.exports) {
  module.exports = MoMoDashboard;
}
