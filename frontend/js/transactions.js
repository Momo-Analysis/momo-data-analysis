// Transactions page functionality for MTN MoMo SMS Analytics
// Handles search, filtering, sorting, pagination, and export features

class TransactionsManager {
  constructor() {
    this.transactions = [];
    this.filteredTransactions = [];
    this.currentPage = 1;
    this.pageSize = 25;
    this.sortField = "timestamp";
    this.sortDirection = "desc";
    this.filters = {};

    this.init();
  }

  /**
   * Initialize the transactions manager
   */
  init() {
    this.loadData();
    this.setupEventListeners();
    this.loadUserPreferences();
  }

  /**
   * Load transaction data
   */
  loadData() {
    showLoading();

    // Simulate API call delay
    setTimeout(() => {
      this.transactions = mockTransactions;
      this.filteredTransactions = [...this.transactions];
      this.applySort();
      this.renderTransactions();
      this.updatePagination();
      this.updateResultsSummary();

      hideLoading();
      showToast("Transactions loaded successfully", "success");
    }, 800);
  }

  /**
   * Setup event listeners
   */
  setupEventListeners() {
    // Search input with debouncing
    const searchInput = document.getElementById("search-input");
    if (searchInput) {
      searchInput.addEventListener(
        "input",
        debounce(() => this.handleSearch(), 300)
      );
    }

    // Filter controls
    const filterElements = [
      "type-filter",
      "status-filter",
      "date-from",
      "date-to",
      "amount-min",
      "amount-max",
    ];

    filterElements.forEach((id) => {
      const element = document.getElementById(id);
      if (element) {
        element.addEventListener("change", () => this.applyFilters());
      }
    });

    // Clear filters button
    const clearFiltersBtn = document.getElementById("clear-filters");
    if (clearFiltersBtn) {
      clearFiltersBtn.addEventListener("click", () => this.clearFilters());
    }

    // Page size selector
    const pageSizeSelect = document.getElementById("page-size");
    if (pageSizeSelect) {
      pageSizeSelect.addEventListener("change", (e) => {
        this.pageSize = parseInt(e.target.value);
        this.currentPage = 1;
        this.renderTransactions();
        this.updatePagination();
        this.updateResultsSummary();
        this.saveUserPreferences();
      });
    }

    // Pagination buttons
    this.setupPaginationListeners();

    // Sort headers
    this.setupSortListeners();

    // Export button
    const exportBtn = document.getElementById("export-btn");
    if (exportBtn) {
      exportBtn.addEventListener("click", () => this.exportData());
    }

    // Refresh button
    const refreshBtn = document.getElementById("refresh-btn");
    if (refreshBtn) {
      refreshBtn.addEventListener("click", () => this.loadData());
    }

    // Mobile menu toggle
    const mobileMenuBtn = document.getElementById("mobile-menu-btn");
    const mobileMenu = document.getElementById("mobile-menu");
    if (mobileMenuBtn && mobileMenu) {
      mobileMenuBtn.addEventListener("click", () => {
        const isExpanded =
          mobileMenuBtn.getAttribute("aria-expanded") === "true";
        mobileMenuBtn.setAttribute("aria-expanded", !isExpanded);
        mobileMenu.classList.toggle("hidden");
      });
    }

    // Keyboard shortcuts
    document.addEventListener("keydown", (e) => {
      // Ctrl/Cmd + F to focus search
      if ((e.ctrlKey || e.metaKey) && e.key === "f") {
        e.preventDefault();
        searchInput?.focus();
      }

      // Ctrl/Cmd + R to refresh
      if ((e.ctrlKey || e.metaKey) && e.key === "r") {
        e.preventDefault();
        this.loadData();
      }

      // Escape to clear search
      if (e.key === "Escape") {
        if (searchInput) {
          searchInput.value = "";
          this.handleSearch();
        }
      }
    });
  }

  /**
   * Setup pagination event listeners
   */
  setupPaginationListeners() {
    const prevMobile = document.getElementById("prev-mobile");
    const nextMobile = document.getElementById("next-mobile");
    const prevDesktop = document.getElementById("prev-desktop");
    const nextDesktop = document.getElementById("next-desktop");

    [prevMobile, prevDesktop].forEach((btn) => {
      if (btn) {
        btn.addEventListener("click", () => this.goToPreviousPage());
      }
    });

    [nextMobile, nextDesktop].forEach((btn) => {
      if (btn) {
        btn.addEventListener("click", () => this.goToNextPage());
      }
    });
  }

  /**
   * Setup sort event listeners
   */
  setupSortListeners() {
    const sortHeaders = document.querySelectorAll("[data-sort]");
    sortHeaders.forEach((header) => {
      header.addEventListener("click", () => {
        const field = header.getAttribute("data-sort");
        this.handleSort(field);
      });
    });
  }

  /**
   * Handle search functionality
   */
  handleSearch() {
    const searchTerm = document.getElementById("search-input")?.value || "";
    this.filters.search = searchTerm;
    this.applyFilters();
  }

  /**
   * Apply all filters
   */
  applyFilters() {
    // Get filter values
    this.filters = {
      search: document.getElementById("search-input")?.value || "",
      type: document.getElementById("type-filter")?.value || "",
      status: document.getElementById("status-filter")?.value || "",
      dateFrom: document.getElementById("date-from")?.value || "",
      dateTo: document.getElementById("date-to")?.value || "",
      amountMin:
        parseFloat(document.getElementById("amount-min")?.value) || null,
      amountMax:
        parseFloat(document.getElementById("amount-max")?.value) || null,
    };

    // Apply filters
    this.filteredTransactions = filterTransactions(
      this.transactions,
      this.filters
    );

    // Reset to first page
    this.currentPage = 1;

    // Apply sorting
    this.applySort();

    // Update display
    this.renderTransactions();
    this.updatePagination();
    this.updateResultsSummary();

    // Save preferences
    this.saveUserPreferences();
  }

  /**
   * Clear all filters
   */
  clearFilters() {
    // Clear filter inputs
    const filterElements = [
      "search-input",
      "type-filter",
      "status-filter",
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

    // Reset filters
    this.filters = {};
    this.filteredTransactions = [...this.transactions];
    this.currentPage = 1;

    // Apply sorting and update display
    this.applySort();
    this.renderTransactions();
    this.updatePagination();
    this.updateResultsSummary();

    // Save preferences
    this.saveUserPreferences();

    showToast("Filters cleared successfully", "success");
  }

  /**
   * Handle sorting
   */
  handleSort(field) {
    if (this.sortField === field) {
      // Toggle direction if same field
      this.sortDirection = this.sortDirection === "asc" ? "desc" : "asc";
    } else {
      // New field, default to descending
      this.sortField = field;
      this.sortDirection = "desc";
    }

    this.applySort();
    this.renderTransactions();
    this.updateSortIndicators();
    this.saveUserPreferences();
  }

  /**
   * Apply current sort to filtered transactions
   */
  applySort() {
    this.filteredTransactions.sort((a, b) => {
      let aVal = a[this.sortField];
      let bVal = b[this.sortField];

      // Handle different data types
      if (this.sortField === "amount") {
        aVal = parseFloat(aVal) || 0;
        bVal = parseFloat(bVal) || 0;
      } else if (this.sortField === "timestamp") {
        aVal = new Date(aVal);
        bVal = new Date(bVal);
      } else if (typeof aVal === "string") {
        aVal = aVal.toLowerCase();
        bVal = bVal.toLowerCase();
      }

      if (aVal < bVal) return this.sortDirection === "asc" ? -1 : 1;
      if (aVal > bVal) return this.sortDirection === "asc" ? 1 : -1;
      return 0;
    });
  }

  /**
   * Update sort indicators in table headers
   */
  updateSortIndicators() {
    // Reset all sort indicators
    document.querySelectorAll("[data-sort] svg").forEach((svg) => {
      svg.classList.remove("text-blue-500");
      svg.classList.add("text-gray-400");
    });

    // Highlight current sort field
    const currentHeader = document.querySelector(
      `[data-sort="${this.sortField}"] svg`
    );
    if (currentHeader) {
      currentHeader.classList.remove("text-gray-400");
      currentHeader.classList.add("text-blue-500");
    }
  }

  /**
   * Render transactions table
   */
  renderTransactions() {
    const tbody = document.getElementById("transactions-tbody");
    const emptyState = document.getElementById("empty-state");

    if (!tbody) return;

    // Calculate pagination
    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    const pageTransactions = this.filteredTransactions.slice(
      startIndex,
      endIndex
    );

    // Show/hide empty state
    if (this.filteredTransactions.length === 0) {
      tbody.innerHTML = "";
      emptyState?.classList.remove("hidden");
      return;
    } else {
      emptyState?.classList.add("hidden");
    }

    // Render transaction rows
    tbody.innerHTML = pageTransactions
      .map((transaction) => this.renderTransactionRow(transaction))
      .join("");

    // Add click listeners for transaction rows
    tbody.querySelectorAll("tr[data-transaction-id]").forEach((row) => {
      row.addEventListener("click", (e) => {
        // Don't navigate if clicking on action buttons
        if (e.target.closest("button")) return;

        const transactionId = row.getAttribute("data-transaction-id");
        this.viewTransactionDetail(transactionId);
      });
    });
  }

  /**
   * Render individual transaction row
   */
  renderTransactionRow(transaction) {
    const senderReceiver =
      transaction.type === "incoming_money"
        ? `From: ${transaction.sender || "Unknown"}`
        : `To: ${transaction.receiver || "Unknown"}`;

    return `
      <tr data-transaction-id="${
        transaction.id
      }" class="hover:bg-gray-50 cursor-pointer">
        <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">
          ${transaction.id}
        </td>
        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
          <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            ${transactionTypeLabels[transaction.type] || transaction.type}
          </span>
        </td>
        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-semibold">
          ${formatCurrency(transaction.amount)}
          ${
            transaction.fee > 0
              ? `<div class="text-xs text-gray-500">Fee: ${formatCurrency(
                  transaction.fee
                )}</div>`
              : ""
          }
        </td>
        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
          <div>${formatDate(transaction.timestamp, "short")}</div>
          <div class="text-xs text-gray-500">${formatDate(
            transaction.timestamp,
            "time"
          )}</div>
        </td>
        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
          <div class="max-w-xs truncate">${senderReceiver}</div>
          ${
            transaction.description
              ? `<div class="text-xs text-gray-500 max-w-xs truncate">${transaction.description}</div>`
              : ""
          }
        </td>
        <td class="px-6 py-4 whitespace-nowrap">
          ${getStatusBadge(transaction.status)}
        </td>
        <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
          <button onclick="event.stopPropagation(); window.transactionsManager.viewTransactionDetail('${
            transaction.id
          }')" class="text-blue-600 hover:text-blue-900 mr-2">
            View
          </button>
          <button onclick="event.stopPropagation(); window.transactionsManager.exportSingle('${
            transaction.id
          }')" class="text-gray-600 hover:text-gray-900">
            Export
          </button>
        </td>
      </tr>
    `;
  }

  /**
   * Update pagination controls
   */
  updatePagination() {
    const totalPages = Math.ceil(
      this.filteredTransactions.length / this.pageSize
    );

    // Update page info
    const currentPageEl = document.getElementById("current-page");
    const totalPagesEl = document.getElementById("total-pages");

    if (currentPageEl) currentPageEl.textContent = this.currentPage;
    if (totalPagesEl) totalPagesEl.textContent = totalPages;

    // Update button states
    const prevButtons = [
      document.getElementById("prev-mobile"),
      document.getElementById("prev-desktop"),
    ];
    const nextButtons = [
      document.getElementById("next-mobile"),
      document.getElementById("next-desktop"),
    ];

    prevButtons.forEach((btn) => {
      if (btn) {
        btn.disabled = this.currentPage <= 1;
      }
    });

    nextButtons.forEach((btn) => {
      if (btn) {
        btn.disabled = this.currentPage >= totalPages;
      }
    });

    // Update page numbers
    this.updatePageNumbers(totalPages);
  }

  /**
   * Update page number buttons
   */
  updatePageNumbers(totalPages) {
    const pageNumbersContainer = document.getElementById("page-numbers");
    if (!pageNumbersContainer) return;

    pageNumbersContainer.innerHTML = "";

    // Show page numbers with ellipsis for large page counts
    const maxVisible = 5;
    let startPage = Math.max(1, this.currentPage - Math.floor(maxVisible / 2));
    let endPage = Math.min(totalPages, startPage + maxVisible - 1);

    if (endPage - startPage + 1 < maxVisible) {
      startPage = Math.max(1, endPage - maxVisible + 1);
    }

    // Add first page and ellipsis if needed
    if (startPage > 1) {
      pageNumbersContainer.appendChild(this.createPageButton(1));
      if (startPage > 2) {
        pageNumbersContainer.appendChild(this.createEllipsis());
      }
    }

    // Add visible page numbers
    for (let i = startPage; i <= endPage; i++) {
      pageNumbersContainer.appendChild(
        this.createPageButton(i, i === this.currentPage)
      );
    }

    // Add last page and ellipsis if needed
    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        pageNumbersContainer.appendChild(this.createEllipsis());
      }
      pageNumbersContainer.appendChild(this.createPageButton(totalPages));
    }
  }

  /**
   * Create page button element
   */
  createPageButton(pageNumber, isActive = false) {
    const button = document.createElement("button");
    button.textContent = pageNumber;
    button.className = isActive
      ? "relative inline-flex items-center px-4 py-2 border border-blue-500 bg-blue-50 text-sm font-medium text-blue-600"
      : "relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50";

    if (!isActive) {
      button.addEventListener("click", () => this.goToPage(pageNumber));
    }

    return button;
  }

  /**
   * Create ellipsis element
   */
  createEllipsis() {
    const span = document.createElement("span");
    span.textContent = "...";
    span.className =
      "relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700";
    return span;
  }

  /**
   * Navigate to specific page
   */
  goToPage(pageNumber) {
    this.currentPage = pageNumber;
    this.renderTransactions();
    this.updatePagination();
    this.updateResultsSummary();

    // Scroll to top of table
    document.querySelector("table")?.scrollIntoView({ behavior: "smooth" });
  }

  /**
   * Go to previous page
   */
  goToPreviousPage() {
    if (this.currentPage > 1) {
      this.goToPage(this.currentPage - 1);
    }
  }

  /**
   * Go to next page
   */
  goToNextPage() {
    const totalPages = Math.ceil(
      this.filteredTransactions.length / this.pageSize
    );
    if (this.currentPage < totalPages) {
      this.goToPage(this.currentPage + 1);
    }
  }

  /**
   * Update results summary
   */
  updateResultsSummary() {
    const total = this.filteredTransactions.length;
    const startIndex = (this.currentPage - 1) * this.pageSize + 1;
    const endIndex = Math.min(this.currentPage * this.pageSize, total);

    const startEl = document.getElementById("results-start");
    const endEl = document.getElementById("results-end");
    const totalEl = document.getElementById("results-total");

    if (startEl) startEl.textContent = total > 0 ? startIndex : 0;
    if (endEl) endEl.textContent = total > 0 ? endIndex : 0;
    if (totalEl) totalEl.textContent = total;
  }

  /**
   * View transaction detail
   */
  viewTransactionDetail(transactionId) {
    // Navigate to transaction detail page
    window.location.href = `transaction.html?id=${transactionId}`;
  }

  /**
   * Export data functionality
   */
  exportData() {
    const dataToExport = this.filteredTransactions.map((transaction) => ({
      "Transaction ID": transaction.id,
      Type: transactionTypeLabels[transaction.type] || transaction.type,
      "Amount (RWF)": transaction.amount,
      "Fee (RWF)": transaction.fee,
      Date: formatDate(transaction.timestamp, "long"),
      Sender: transaction.sender || "",
      Receiver: transaction.receiver || "",
      Status: transaction.status,
      Description: transaction.description || "",
    }));

    this.downloadCSV(dataToExport, "mtn-momo-transactions.csv");
    showToast(`Exported ${dataToExport.length} transactions`, "success");
  }

  /**
   * Export single transaction
   */
  exportSingle(transactionId) {
    const transaction = this.transactions.find((t) => t.id === transactionId);
    if (!transaction) return;

    const dataToExport = [
      {
        "Transaction ID": transaction.id,
        Type: transactionTypeLabels[transaction.type] || transaction.type,
        "Amount (RWF)": transaction.amount,
        "Fee (RWF)": transaction.fee,
        Date: formatDate(transaction.timestamp, "long"),
        Sender: transaction.sender || "",
        Receiver: transaction.receiver || "",
        Status: transaction.status,
        Description: transaction.description || "",
      },
    ];

    this.downloadCSV(dataToExport, `transaction-${transactionId}.csv`);
    showToast("Transaction exported successfully", "success");
  }

  /**
   * Download data as CSV
   */
  downloadCSV(data, filename) {
    if (data.length === 0) {
      showToast("No data to export", "warning");
      return;
    }

    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(","),
      ...data.map((row) =>
        headers.map((header) => `"${row[header]}"`).join(",")
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }

  /**
   * Save user preferences
   */
  saveUserPreferences() {
    const preferences = {
      pageSize: this.pageSize,
      sortField: this.sortField,
      sortDirection: this.sortDirection,
      filters: this.filters,
    };

    savePreference("transactions-preferences", preferences);
  }

  /**
   * Load user preferences
   */
  loadUserPreferences() {
    const preferences = loadPreference("transactions-preferences", {});

    if (preferences.pageSize) {
      this.pageSize = preferences.pageSize;
      const pageSizeSelect = document.getElementById("page-size");
      if (pageSizeSelect) {
        pageSizeSelect.value = this.pageSize;
      }
    }

    if (preferences.sortField) {
      this.sortField = preferences.sortField;
      this.sortDirection = preferences.sortDirection || "desc";
    }

    if (preferences.filters) {
      this.filters = preferences.filters;
      // Apply saved filters to form elements
      Object.entries(this.filters).forEach(([key, value]) => {
        let elementId;
        switch (key) {
          case "search":
            elementId = "search-input";
            break;
          case "type":
            elementId = "type-filter";
            break;
          case "status":
            elementId = "status-filter";
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
    }
  }
}

// Initialize when DOM is loaded
document.addEventListener("DOMContentLoaded", function () {
  window.transactionsManager = new TransactionsManager();
});
