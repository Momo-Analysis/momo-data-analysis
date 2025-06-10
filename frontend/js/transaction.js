// Transaction detail page functionality for MTN MoMo SMS Analytics
// Handles displaying detailed transaction information and related data

class TransactionDetail {
  constructor() {
    this.transactionId = null;
    this.transaction = null;
    this.relatedTransactions = [];

    this.init();
  }

  /**
   * Initialize the transaction detail page
   */
  init() {
    this.getTransactionIdFromURL();
    this.setupEventListeners();
    this.loadTransactionData();
  }

  /**
   * Extract transaction ID from URL parameters
   */
  getTransactionIdFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    this.transactionId = urlParams.get("id");

    if (!this.transactionId) {
      this.showNotFoundState();
      return;
    }
  }

  /**
   * Setup event listeners
   */
  setupEventListeners() {
    // Back button
    const backBtn = document.getElementById("back-btn");
    if (backBtn) {
      backBtn.addEventListener("click", () => {
        // Check if we came from transactions page or go to default
        const referrer = document.referrer;
        if (referrer && referrer.includes("transactions.html")) {
          window.history.back();
        } else {
          window.location.href = "transactions.html";
        }
      });
    }

    // Export button
    const exportBtn = document.getElementById("export-transaction-btn");
    if (exportBtn) {
      exportBtn.addEventListener("click", () => this.exportTransaction());
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
      // Escape to go back
      if (e.key === "Escape") {
        backBtn?.click();
      }

      // Ctrl/Cmd + P to export
      if ((e.ctrlKey || e.metaKey) && e.key === "p") {
        e.preventDefault();
        this.exportTransaction();
      }
    });
  }

  /**
   * Load transaction data
   */
  loadTransactionData() {
    showLoading();

    // Simulate API call delay
    setTimeout(() => {
      this.transaction = mockTransactions.find(
        (t) => t.id === this.transactionId
      );

      if (!this.transaction) {
        this.showNotFoundState();
        hideLoading();
        return;
      }

      this.loadRelatedTransactions();
      this.renderTransactionDetail();
      this.renderTimeline();
      this.renderRelatedTransactions();

      hideLoading();
      showToast("Transaction details loaded successfully", "success");
    }, 600);
  }

  /**
   * Load related transactions
   */
  loadRelatedTransactions() {
    if (!this.transaction) return;

    // Find transactions involving the same parties
    this.relatedTransactions = mockTransactions
      .filter((t) => {
        if (t.id === this.transaction.id) return false;

        const sameSender =
          t.sender &&
          this.transaction.sender &&
          t.sender.toLowerCase() === this.transaction.sender.toLowerCase();
        const sameReceiver =
          t.receiver &&
          this.transaction.receiver &&
          t.receiver.toLowerCase() === this.transaction.receiver.toLowerCase();
        const crossParties =
          (t.sender &&
            this.transaction.receiver &&
            t.sender.toLowerCase() ===
              this.transaction.receiver.toLowerCase()) ||
          (t.receiver &&
            this.transaction.sender &&
            t.receiver.toLowerCase() === this.transaction.sender.toLowerCase());

        return sameSender || sameReceiver || crossParties;
      })
      .slice(0, 5); // Limit to 5 related transactions
  }

  /**
   * Show not found state
   */
  showNotFoundState() {
    const notFoundState = document.getElementById("not-found-state");
    const transactionContent = document.getElementById("transaction-content");

    if (notFoundState) notFoundState.classList.remove("hidden");
    if (transactionContent) transactionContent.classList.add("hidden");
  }

  /**
   * Render transaction detail information
   */
  renderTransactionDetail() {
    if (!this.transaction) return;

    // Update page title and breadcrumb
    document.title = `Transaction ${this.transaction.id} - MTN MoMo SMS Analytics`;
    const breadcrumbId = document.getElementById("breadcrumb-transaction-id");
    if (breadcrumbId) {
      breadcrumbId.textContent = this.transaction.id;
    }

    // Overview cards
    this.updateElement(
      "transaction-amount",
      formatCurrency(this.transaction.amount)
    );
    this.updateElement(
      "transaction-fee",
      this.transaction.fee > 0
        ? `Fee: ${formatCurrency(this.transaction.fee)}`
        : "No fee"
    );
    this.updateElement(
      "transaction-status",
      this.transaction.status.toUpperCase()
    );
    this.updateElement(
      "transaction-date",
      formatDate(this.transaction.timestamp, "short")
    );
    this.updateElement(
      "transaction-type",
      transactionTypeLabels[this.transaction.type] || this.transaction.type
    );
    this.updateElement("transaction-id", this.transaction.id);

    // Transaction information
    this.updateElement("detail-transaction-id", this.transaction.id);
    this.updateElement(
      "detail-amount",
      formatCurrency(this.transaction.amount)
    );
    this.updateElement(
      "detail-fee",
      this.transaction.fee > 0
        ? formatCurrency(this.transaction.fee)
        : "No fee charged"
    );
    this.updateElement("detail-currency", this.transaction.currency);
    this.updateElement(
      "detail-timestamp",
      formatDate(this.transaction.timestamp, "long")
    );
    this.updateElement(
      "detail-description",
      this.transaction.description || "No description provided"
    );

    // Transaction type badge
    const typeElement = document.getElementById("detail-transaction-type");
    if (typeElement) {
      typeElement.innerHTML = `
        <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
          ${
            transactionTypeLabels[this.transaction.type] ||
            this.transaction.type
          }
        </span>
      `;
    }

    // Status badge
    const statusElement = document.getElementById("detail-status");
    if (statusElement) {
      statusElement.innerHTML = getStatusBadge(this.transaction.status);
    }

    // Parties information
    this.renderPartiesInfo();
  }

  /**
   * Render parties (sender/receiver) information
   */
  renderPartiesInfo() {
    const senderInfo = document.getElementById("sender-info");
    const receiverInfo = document.getElementById("receiver-info");
    const senderElement = document.getElementById("detail-sender");
    const receiverElement = document.getElementById("detail-receiver");

    // Show/hide sender info
    if (this.transaction.sender) {
      senderInfo?.classList.remove("hidden");
      this.updateElement("detail-sender", this.transaction.sender);
    } else {
      senderInfo?.classList.add("hidden");
    }

    // Show/hide receiver info
    if (this.transaction.receiver) {
      receiverInfo?.classList.remove("hidden");
      this.updateElement("detail-receiver", this.transaction.receiver);
    } else {
      receiverInfo?.classList.add("hidden");
    }
  }

  /**
   * Render transaction timeline
   */
  renderTimeline() {
    const timelineContainer = document.getElementById("transaction-timeline");
    if (!timelineContainer || !this.transaction) return;

    const transactionDate = new Date(this.transaction.timestamp);
    const timelineItems = [
      {
        title: "Transaction Initiated",
        description: "Transaction request was created",
        time: transactionDate,
        status: "completed",
        icon: "play",
      },
      {
        title: "Processing",
        description: "Transaction is being processed",
        time: new Date(transactionDate.getTime() + 30000), // 30 seconds later
        status: "completed",
        icon: "clock",
      },
    ];

    // Add final status based on transaction status
    if (this.transaction.status === "completed") {
      timelineItems.push({
        title: "Transaction Completed",
        description: "Transaction was successfully completed",
        time: new Date(transactionDate.getTime() + 60000), // 1 minute later
        status: "completed",
        icon: "check",
      });
    } else if (this.transaction.status === "failed") {
      timelineItems.push({
        title: "Transaction Failed",
        description: "Transaction could not be completed",
        time: new Date(transactionDate.getTime() + 45000), // 45 seconds later
        status: "failed",
        icon: "x",
      });
    } else if (this.transaction.status === "pending") {
      timelineItems.push({
        title: "Pending Completion",
        description: "Transaction is awaiting final confirmation",
        time: new Date(),
        status: "pending",
        icon: "clock",
      });
    }

    timelineContainer.innerHTML = timelineItems
      .map((item, index) =>
        this.renderTimelineItem(item, index === timelineItems.length - 1)
      )
      .join("");
  }

  /**
   * Render individual timeline item
   */
  renderTimelineItem(item, isLast) {
    const statusColors = {
      completed: "bg-green-500",
      pending: "bg-yellow-500",
      failed: "bg-red-500",
    };

    const icons = {
      play: "M8 5v14l11-7z",
      clock: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z",
      check: "M5 13l4 4L19 7",
      x: "M6 18L18 6M6 6l12 12",
    };

    return `
      <li>
        <div class="relative pb-8">
          ${
            !isLast
              ? '<span class="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200" aria-hidden="true"></span>'
              : ""
          }
          <div class="relative flex space-x-3">
            <div>
              <span class="h-8 w-8 rounded-full ${
                statusColors[item.status]
              } flex items-center justify-center ring-8 ring-white">
                <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="${
                    icons[item.icon]
                  }"></path>
                </svg>
              </span>
            </div>
            <div class="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
              <div>
                <p class="text-sm font-medium text-gray-900">${item.title}</p>
                <p class="text-sm text-gray-500">${item.description}</p>
              </div>
              <div class="text-right text-sm whitespace-nowrap text-gray-500">
                <time datetime="${item.time.toISOString()}">${formatDate(
      item.time,
      "time"
    )}</time>
              </div>
            </div>
          </div>
        </div>
      </li>
    `;
  }

  /**
   * Render related transactions
   */
  renderRelatedTransactions() {
    const relatedList = document.getElementById("related-transactions-list");
    const noRelated = document.getElementById("no-related-transactions");

    if (this.relatedTransactions.length === 0) {
      relatedList?.classList.add("hidden");
      noRelated?.classList.remove("hidden");
      return;
    }

    relatedList?.classList.remove("hidden");
    noRelated?.classList.add("hidden");

    if (relatedList) {
      relatedList.innerHTML = this.relatedTransactions
        .map((transaction) => this.renderRelatedTransactionItem(transaction))
        .join("");
    }
  }

  /**
   * Render individual related transaction item
   */
  renderRelatedTransactionItem(transaction) {
    const senderReceiver =
      transaction.type === "incoming_money"
        ? `From: ${transaction.sender || "Unknown"}`
        : `To: ${transaction.receiver || "Unknown"}`;

    return `
      <div class="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer" onclick="window.location.href='transaction.html?id=${
        transaction.id
      }'">
        <div class="flex items-center space-x-3">
          <div class="flex-shrink-0">
            <div class="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
              <svg class="h-4 w-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
              </svg>
            </div>
          </div>
          <div>
            <p class="text-sm font-medium text-gray-900">${transaction.id}</p>
            <p class="text-xs text-gray-500">${senderReceiver}</p>
          </div>
        </div>
        <div class="flex items-center space-x-2">
          <div class="text-right">
            <p class="text-sm font-semibold text-gray-900">${formatCurrency(
              transaction.amount
            )}</p>
            <p class="text-xs text-gray-500">${formatDate(
              transaction.timestamp,
              "short"
            )}</p>
          </div>
          ${getStatusBadge(transaction.status)}
        </div>
      </div>
    `;
  }

  /**
   * Export transaction data
   */
  exportTransaction() {
    if (!this.transaction) {
      showToast("No transaction data to export", "warning");
      return;
    }

    const dataToExport = [
      {
        "Transaction ID": this.transaction.id,
        Type:
          transactionTypeLabels[this.transaction.type] || this.transaction.type,
        "Amount (RWF)": this.transaction.amount,
        "Fee (RWF)": this.transaction.fee,
        Date: formatDate(this.transaction.timestamp, "long"),
        Sender: this.transaction.sender || "",
        Receiver: this.transaction.receiver || "",
        Status: this.transaction.status,
        Description: this.transaction.description || "",
        Currency: this.transaction.currency,
      },
    ];

    this.downloadCSV(dataToExport, `transaction-${this.transaction.id}.csv`);
    showToast("Transaction exported successfully", "success");
  }

  /**
   * Download data as CSV
   */
  downloadCSV(data, filename) {
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
   * Update element content safely
   */
  updateElement(id, content) {
    const element = document.getElementById(id);
    if (element) {
      element.textContent = content;
    }
  }
}

// Initialize when DOM is loaded
document.addEventListener("DOMContentLoaded", function () {
  window.transactionDetail = new TransactionDetail();
});
