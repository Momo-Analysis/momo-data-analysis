document.addEventListener("DOMContentLoaded", () => {
  const state = {
    transactions: [],
    filters: { type: "All Types", startDate: "", endDate: "", search: "" },
    pagination: { currentPage: 1, limit: 7, totalPages: 1 },
    sorting: { field: null, direction: "asc" },
  };

  const API_BASE_URL = "http://localhost:3000/api/transactions";

  // --- API CALLS ---
  async function fetchTransactionTypes() {
    try {
      const response = await fetch(`${API_BASE_URL}/types`);
      const result = await response.json();
      if (!result.success) {
        throw new Error(result.message || "Failed to fetch transaction types");
      }
      return result.data;
    } catch (error) {
      console.error("Error fetching transaction types:", error);
      alert("Failed to load transaction types. Please try again later.");
      return [];
    }
  }

  async function fetchTransactions() {
    const { currentPage, limit } = state.pagination;
    const { type, startDate, endDate } = state.filters;

    // Skip fetching all transactions if search is active (we'll handle search separately)
    if (state.filters.search) {
      return {
        data: [],
        pagination: {
          currentPage: 1,
          totalPages: 1,
          totalRecords: 0,
          hasNextPage: false,
          hasPrevPage: false,
          limit,
        },
      };
    }

    const queryParams = new URLSearchParams({
      page: currentPage,
      limit,
    });

    if (type !== "All Types") queryParams.append("type", type);
    if (startDate) queryParams.append("startDate", startDate);
    if (endDate) queryParams.append("endDate", endDate);

    try {
      const response = await fetch(`${API_BASE_URL}?${queryParams.toString()}`);
      const result = await response.json();
      if (!result.success) {
        throw new Error(result.message || "Failed to fetch transactions");
      }
      return result;
    } catch (error) {
      console.error("Error fetching transactions:", error);
      alert("Failed to load transactions. Please try again later.");
      return {
        data: [],
        pagination: {
          currentPage: 1,
          totalPages: 1,
          totalRecords: 0,
          hasNextPage: false,
          hasPrevPage: false,
          limit,
        },
      };
    }
  }

  async function fetchTransactionById(id, type = null) {
    try {
      let url = `${API_BASE_URL}/${id}`;
      if (type && type !== "All Types") {
        url = `${API_BASE_URL}/${type.toLowerCase()}/${id}`;
      }
      const response = await fetch(url);
      const result = await response.json();
      if (!result.success) {
        throw new Error(result.message || "Failed to fetch transaction");
      }
      return result.data;
    } catch (error) {
      console.error(`Error fetching transaction ${id}:`, error);
      alert("Failed to load transaction details. Please try again later.");
      return null;
    }
  }

  // --- UI RENDERING ---
  async function renderTransactionList() {
    const list = document.getElementById("transaction-list");
    list.innerHTML = "<tr><td colspan='5' class='text-center py-10 text-gray-500'>Loading...</td></tr>";

    // If search is active, fetch transaction by ID instead of listing all
    if (state.filters.search) {
      const transaction = await fetchTransactionById(state.filters.search, state.filters.type);
      state.transactions = transaction ? [transaction] : [];
      state.pagination = {
        currentPage: 1,
        totalPages: 1,
        totalRecords: transaction ? 1 : 0,
        hasNextPage: false,
        hasPrevPage: false,
        limit: state.pagination.limit,
      };
    } else {
      const result = await fetchTransactions();
      state.transactions = result.data;
      state.pagination = result.pagination;
    }

    list.innerHTML = "";
    const sorted = sortTransactions(
      state.transactions,
      state.sorting.field,
      state.sorting.direction
    );

    if (sorted.length === 0) {
      list.innerHTML = `<tr><td colspan="5" class="text-center py-10 text-gray-500">${
        state.filters.search ? "No transaction found with that ID." : "No transactions found for the selected filters."
      }</td></tr>`;
    } else {
      sorted.forEach((tx) => {
        const row = document.createElement("tr");
        row.className = "hover:bg-gray-50 cursor-pointer";
        row.dataset.transactionId = tx.transactionId || tx.id;
        row.dataset.transactionType = tx.type;
        row.innerHTML = `
          <td class="px-6 py-4 whitespace-nowrap">
              <div class="text-sm font-medium text-gray-900">${tx.transactionId || tx.id}</div>
          </td>
          <td class="px-6 py-4 whitespace-nowrap">
              <div class="text-sm font-medium text-gray-900">${tx.type}</div>
          </td>
          <td class="px-6 py-4 whitespace-nowrap">
              <div class="text-sm text-gray-900">${tx.amount.toLocaleString("en-US")} ${tx.currency || "RWF"}</div>
          </td>
          <td class="px-6 py-4 whitespace-nowrap">
              <div class="text-sm text-gray-500">${new Date(tx.timestamp).toLocaleDateString()}</div>
          </td>
          <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
              <a href="#" class="text-blue-600 hover:text-blue-900">View</a>
          </td>
        `;
        list.appendChild(row);
      });
    }
    renderPaginationControls();
    updateSortIcons();
  }

  function renderPaginationControls() {
    const container = document.getElementById("pagination-controls");
    container.innerHTML = "";
    const { currentPage, totalPages, hasNextPage, hasPrevPage } = state.pagination;

    if (totalPages <= 1 || state.filters.search) return;

    const prevDisabled = !hasPrevPage ? "disabled" : "";
    const nextDisabled = !hasNextPage ? "disabled" : "";

    container.innerHTML = `
      <button id="prev-page" class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed" ${prevDisabled}>Previous</button>
      <span class="text-sm text-gray-700">Page ${currentPage} of ${totalPages}</span>
      <button id="next-page" class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed" ${nextDisabled}>Next</button>
    `;
  }

  async function renderFilterOptions() {
    const select = document.getElementById("filter-type");
    select.innerHTML = '<option>All Types</option>';
    const types = await fetchTransactionTypes();
    types.forEach((type) => {
      const option = document.createElement("option");
      option.value = type;
      option.textContent = type;
      select.appendChild(option);
    });
  }

  async function renderModal(transactionId, transactionType = null) {
    const transaction = await fetchTransactionById(transactionId, transactionType);
    if (!transaction) return;

    const modalContainer = document.getElementById("modal-container");
    const modalContent = document.getElementById("modal-content");

    let detailsHtml = `<ul class="space-y-2 text-sm">
      <li><strong class="font-medium text-gray-600 w-24 inline-block">ID:</strong> ${transaction.transactionId || transaction.id}</li>
      <li><strong class="font-medium text-gray-600 w-24 inline-block">Type:</strong> ${transaction.type}</li>
      <li><strong class="font-medium text-gray-600 w-24 inline-block">Amount:</strong> ${transaction.amount.toLocaleString("en-US")} ${transaction.currency || "RWF"}</li>
      <li><strong class="font-medium text-gray-600 w-24 inline-block">Date:</strong> ${new Date(transaction.timestamp).toLocaleString()}</li>
    </ul><hr class="my-3">
    <h4 class="font-semibold text-gray-800 mb-2">Additional Details:</h4>
    <ul class="space-y-2 text-sm">`;

    // Include all additional fields dynamically
    for (const [key, value] of Object.entries(transaction)) {
      if (["id", "transactionId", "type", "amount", "timestamp", "currency", "table_name"].includes(key)) continue;
      if (value !== null && value !== undefined) {
        detailsHtml += `<li><strong class="font-medium text-gray-600 w-24 inline-block capitalize">${key.replace("_", " ")}:</strong> ${value}</li>`;
      }
    }

    detailsHtml += `</ul>`;

    modalContent.innerHTML = detailsHtml;
    modalContainer.classList.remove("hidden");
  }

  // --- LOGIC & EVENT HANDLERS ---
  function getFilteredTransactions() {
    // Filtering is handled server-side, except for search which we handle separately
    return state.transactions;
  }

  function handleFilterChange() {
    state.filters.type = document.getElementById("filter-type").value;
    state.filters.startDate = document.getElementById("filter-start-date").value;
    state.filters.endDate = document.getElementById("filter-end-date").value;
    state.filters.search = document.getElementById("search-input").value.trim();
    state.pagination.currentPage = 1;
    renderTransactionList();
  }

  function sortTransactions(transactions, field, direction) {
    if (!field) {
      return transactions;
    }

    return [...transactions].sort((a, b) => {
      let aValue, bValue;

      switch (field) {
        case "id":
          aValue = a.transactionId || a.id;
          bValue = b.transactionId || b.id;
          break;
        case "type":
          aValue = a.type;
          bValue = b.type;
          break;
        case "amount":
          aValue = a.amount;
          bValue = b.amount;
          break;
        case "timestamp":
          aValue = new Date(a.timestamp);
          bValue = new Date(b.timestamp);
          break;
        default:
          return 0;
      }

      if (direction === "asc") {
        if (aValue < bValue) return -1;
        if (aValue > bValue) return 1;
        return 0;
      } else {
        if (aValue > bValue) return -1;
        if (aValue < bValue) return 1;
        return 0;
      }
    });
  }

  function handleSort(field) {
    if (state.sorting.field === field) {
      state.sorting.direction = state.sorting.direction === "asc" ? "desc" : "asc";
    } else {
      state.sorting.field = field;
      state.sorting.direction = "asc";
    }
    state.pagination.currentPage = 1;
    renderTransactionList();
  }

  function updateSortIcons() {
    const sortHeaders = document.querySelectorAll("[data-sort]");
    sortHeaders.forEach((header) => {
      const icon = header.querySelector("svg");
      icon.classList.remove("text-blue-600");
      icon.classList.add("text-gray-400");
    });

    if (state.sorting.field) {
      const activeHeader = document.querySelector(`[data-sort="${state.sorting.field}"]`);
      if (activeHeader) {
        const icon = activeHeader.querySelector("svg");
        icon.classList.remove("text-gray-400");
        icon.classList.add("text-blue-600");

        const path = icon.querySelector("path");
        path.setAttribute(
          "d",
          state.sorting.direction === "desc"
            ? "M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"
            : "M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"
        );
      }
    }
  }

  // --- EVENT LISTENERS ---
  document.getElementById("filter-type").addEventListener("change", handleFilterChange);
  document.getElementById("filter-start-date").addEventListener("change", handleFilterChange);
  document.getElementById("filter-end-date").addEventListener("change", handleFilterChange);
  document.getElementById("search-input").addEventListener("input", handleFilterChange);

  document.getElementById("pagination-controls").addEventListener("click", (e) => {
    if (e.target.id === "prev-page" && state.pagination.hasPrevPage) {
      state.pagination.currentPage--;
      renderTransactionList();
    }
    if (e.target.id === "next-page" && state.pagination.hasNextPage) {
      state.pagination.currentPage++;
      renderTransactionList();
    }
  });

  document.getElementById("transaction-list").addEventListener("click", async (e) => {
    const row = e.target.closest("tr");
    if (!row) return;

    const transactionId = row.dataset.transactionId;
    const transactionType = row.dataset.transactionType;
    await renderModal(transactionId, transactionType);
  });

  document.getElementById("modal-close").addEventListener("click", () => {
    document.getElementById("modal-container").classList.add("hidden");
  });

  document.addEventListener("click", (e) => {
    const sortHeader = e.target.closest("[data-sort]");
    if (sortHeader) {
      const field = sortHeader.getAttribute("data-sort");
      handleSort(field);
    }
  });

  // --- INITIALIZATION ---
  async function init() {
    await renderFilterOptions();
    await renderTransactionList();
  }

  init();
});