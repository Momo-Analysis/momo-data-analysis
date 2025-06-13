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
  };
  const state = {
    transactions: [],
    filters: { type: "All Types", startDate: "", endDate: "", search: "" },
    pagination: { currentPage: 1, limit: 7, totalPages: 1 },
  };

  // --- UI RENDERING ---

  function renderTransactionList() {
    const list = document.getElementById("transaction-list");
    list.innerHTML = "";
    const { currentPage, limit } = state.pagination;
    const start = (currentPage - 1) * limit;
    const end = start + limit;

    const filtered = getFilteredTransactions();
    state.pagination.totalPages = Math.ceil(filtered.length / limit);

    const paginated = filtered.slice(start, end);

    if (paginated.length === 0) {
      list.innerHTML = `<tr><td colspan="4" class="text-center py-10 text-gray-500">No transactions found for the selected filters.</td></tr>`;
    } else {
      paginated.forEach((tx) => {
        const row = document.createElement("tr");
        row.className = "hover:bg-gray-50 cursor-pointer";
        row.dataset.transactionId = tx.id;
        row.innerHTML = `
                    <td class="px-6 py-4 whitespace-nowrap">
                        <div class="text-sm font-medium text-gray-900">${
                          tx.type
                        }</div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                        <div class="text-sm text-gray-900">${tx.amount.toLocaleString(
                          "en-US"
                        )} RWF</div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                        <div class="text-sm text-gray-500">${new Date(
                          tx.timestamp
                        ).toLocaleDateString()}</div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <a href="#" class="text-blue-600 hover:text-blue-900">View</a>
                    </td>
                `;
        list.appendChild(row);
      });
    }
    renderPaginationControls();
  }

  function renderPaginationControls() {
    const container = document.getElementById("pagination-controls");
    container.innerHTML = "";
    const { currentPage, totalPages } = state.pagination;

    if (totalPages <= 1) return;

    const prevDisabled = currentPage === 1 ? "disabled" : "";
    const nextDisabled = currentPage === totalPages ? "disabled" : "";

    container.innerHTML = `
            <button id="prev-page" class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed" ${prevDisabled}>Previous</button>
            <span class="text-sm text-gray-700">Page ${currentPage} of ${totalPages}</span>
            <button id="next-page" class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed" ${nextDisabled}>Next</button>
        `;
  }

  function renderFilterOptions() {
    const select = document.getElementById("filter-type");
    const types = [...new Set(mockApiData.transactions.map((tx) => tx.type))];
    types.forEach((type) => {
      const option = document.createElement("option");
      option.value = type;
      option.textContent = type;
      select.appendChild(option);
    });
  }

  function renderModal(transaction) {
    const modalContainer = document.getElementById("modal-container");
    const modalContent = document.getElementById("modal-content");

    let detailsHtml = `<ul class="space-y-2 text-sm">
            <li><strong class="font-medium text-gray-600 w-24 inline-block">ID:</strong> ${
              transaction.id
            }</li>
            <li><strong class="font-medium text-gray-600 w-24 inline-block">Type:</strong> ${
              transaction.type
            }</li>
            <li><strong class="font-medium text-gray-600 w-24 inline-block">Amount:</strong> ${transaction.amount.toLocaleString(
              "en-US"
            )} RWF</li>
            <li><strong class="font-medium text-gray-600 w-24 inline-block">Date:</strong> ${new Date(
              transaction.timestamp
            ).toLocaleString()}</li>
        </ul><hr class="my-3">
        <h4 class="font-semibold text-gray-800 mb-2">Additional Details:</h4>
        <ul class="space-y-2 text-sm">`;

    for (const [key, value] of Object.entries(transaction.details)) {
      detailsHtml += `<li><strong class="font-medium text-gray-600 w-24 inline-block capitalize">${key.replace(
        "_",
        " "
      )}:</strong> ${value}</li>`;
    }

    detailsHtml += `</ul>`;

    modalContent.innerHTML = detailsHtml;
    modalContainer.classList.remove("hidden");
  }

  // --- LOGIC & EVENT HANDLERS ---
  function getFilteredTransactions() {
    const { type, startDate, endDate, search } = state.filters;
    return state.transactions.filter((tx) => {
      const txDate = new Date(tx.timestamp);
      const isTypeMatch = type === "All Types" || tx.type === type;
      const isStartDateMatch = !startDate || txDate >= new Date(startDate);
      const isEndDateMatch = !endDate || txDate <= new Date(endDate);

      // Search functionality - search in type, amount, and details
      const isSearchMatch =
        !search ||
        tx.type.toLowerCase().includes(search.toLowerCase()) ||
        tx.id.toString().includes(search) ||
        tx.amount.toString().includes(search) ||
        Object.values(tx.details).some((detail) =>
          detail.toString().toLowerCase().includes(search.toLowerCase())
        );

      return isTypeMatch && isStartDateMatch && isEndDateMatch && isSearchMatch;
    });
  }
  function handleFilterChange() {
    state.filters.type = document.getElementById("filter-type").value;
    state.filters.startDate =
      document.getElementById("filter-start-date").value;
    state.filters.endDate = document.getElementById("filter-end-date").value;
    state.filters.search = document.getElementById("search-input").value;
    state.pagination.currentPage = 1;
    renderTransactionList();
  }

  // Event Listeners
  // Dynamic filtering - no apply button needed
  document
    .getElementById("filter-type")
    .addEventListener("change", handleFilterChange);
  document
    .getElementById("filter-start-date")
    .addEventListener("change", handleFilterChange);
  document
    .getElementById("filter-end-date")
    .addEventListener("change", handleFilterChange);
  document
    .getElementById("search-input")
    .addEventListener("input", handleFilterChange);

  document
    .getElementById("pagination-controls")
    .addEventListener("click", (e) => {
      if (e.target.id === "prev-page") {
        if (state.pagination.currentPage > 1) {
          state.pagination.currentPage--;
          renderTransactionList();
        }
      }
      if (e.target.id === "next-page") {
        if (state.pagination.currentPage < state.pagination.totalPages) {
          state.pagination.currentPage++;
          renderTransactionList();
        }
      }
    });

  document.getElementById("transaction-list").addEventListener("click", (e) => {
    const row = e.target.closest("tr");
    if (!row) return;

    const transactionId = parseInt(row.dataset.transactionId);
    const transaction = state.transactions.find(
      (tx) => tx.id === transactionId
    );
    if (transaction) {
      renderModal(transaction);
    }
  });

  document.getElementById("modal-close").addEventListener("click", () => {
    document.getElementById("modal-container").classList.add("hidden");
  });

  // --- INITIALIZATION ---
  function init() {
    state.transactions = mockApiData.transactions.sort(
      (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
    );
    renderFilterOptions();
    renderTransactionList();
  }

  init();
});
