// Utility functions for MTN MoMo Analytics Dashboard
// Common helper functions used across the application

/**
 * Format currency amount with RWF symbol
 * @param {number} amount - The amount to format
 * @returns {string} Formatted currency string
 */
function formatCurrency(amount) {
  if (amount === null || amount === undefined) return "RWF 0";
  return `RWF ${amount.toLocaleString("en-US")}`;
}

/**
 * Format date for display
 * @param {string|Date} dateString - Date to format
 * @param {string} format - Format type: 'short', 'long', 'time'
 * @returns {string} Formatted date string
 */
function formatDate(dateString, format = "short") {
  const date = new Date(dateString);

  if (isNaN(date.getTime())) return "Invalid Date";

  const options = {
    short: {
      year: "numeric",
      month: "short",
      day: "numeric",
    },
    long: {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    },
    time: {
      hour: "2-digit",
      minute: "2-digit",
    },
  };

  return date.toLocaleDateString("en-US", options[format]);
}

/**
 * Get status badge HTML
 * @param {string} status - Transaction status
 * @returns {string} HTML for status badge
 */
function getStatusBadge(status) {
  const badges = {
    completed:
      '<span class="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">Completed</span>',
    pending:
      '<span class="px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">Pending</span>',
    failed:
      '<span class="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">Failed</span>',
  };

  return (
    badges[status] ||
    '<span class="px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">Unknown</span>'
  );
}

/**
 * Show loading overlay
 */
function showLoading() {
  const overlay = document.getElementById("loading-overlay");
  if (overlay) {
    overlay.classList.remove("hidden");
  }
}

/**
 * Hide loading overlay
 */
function hideLoading() {
  const overlay = document.getElementById("loading-overlay");
  if (overlay) {
    overlay.classList.add("hidden");
  }
}

/**
 * Show toast notification
 * @param {string} message - Message to display
 * @param {string} type - Type: 'success', 'error', 'warning', 'info'
 */
function showToast(message, type = "info") {
  // Create toast element
  const toast = document.createElement("div");
  toast.className = `fixed top-4 right-4 z-50 max-w-sm w-full bg-white rounded-lg shadow-lg border-l-4 p-4 transform transition-all duration-300 translate-x-full`;

  // Set border color based on type
  const borderColors = {
    success: "border-green-500",
    error: "border-red-500",
    warning: "border-yellow-500",
    info: "border-blue-500",
  };

  toast.classList.add(borderColors[type] || borderColors.info);

  // Set toast content
  toast.innerHTML = `
    <div class="flex items-center">
      <div class="flex-1">
        <p class="text-sm font-medium text-gray-900">${message}</p>
      </div>
      <button onclick="this.parentElement.parentElement.remove()" class="ml-3 text-gray-400 hover:text-gray-600">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
        </svg>
      </button>
    </div>
  `;

  // Add to document
  document.body.appendChild(toast);

  // Animate in
  setTimeout(() => {
    toast.classList.remove("translate-x-full");
  }, 100);

  // Auto remove after 5 seconds
  setTimeout(() => {
    toast.classList.add("translate-x-full");
    setTimeout(() => {
      if (toast.parentElement) {
        toast.remove();
      }
    }, 300);
  }, 5000);
}

/**
 * Debounce function for search inputs
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {Function} Debounced function
 */
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Filter transactions based on criteria
 * @param {Array} transactions - Array of transactions
 * @param {Object} filters - Filter criteria
 * @returns {Array} Filtered transactions
 */
function filterTransactions(transactions, filters) {
  return transactions.filter((transaction) => {
    // Filter by type
    if (filters.type && transaction.type !== filters.type) {
      return false;
    }

    // Filter by date range
    if (filters.dateFrom) {
      const transactionDate = new Date(transaction.timestamp);
      const fromDate = new Date(filters.dateFrom);
      if (transactionDate < fromDate) return false;
    }

    if (filters.dateTo) {
      const transactionDate = new Date(transaction.timestamp);
      const toDate = new Date(filters.dateTo);
      toDate.setHours(23, 59, 59, 999); // Include entire day
      if (transactionDate > toDate) return false;
    }

    // Filter by amount range
    if (filters.amountMin && transaction.amount < filters.amountMin) {
      return false;
    }

    if (filters.amountMax && transaction.amount > filters.amountMax) {
      return false;
    }

    // Filter by search text
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      const searchFields = [
        transaction.id,
        transaction.type,
        transaction.sender,
        transaction.receiver,
        transaction.description,
      ].filter((field) => field); // Remove null/undefined values

      const matchesSearch = searchFields.some((field) =>
        field.toLowerCase().includes(searchTerm)
      );

      if (!matchesSearch) return false;
    }

    return true;
  });
}

/**
 * Calculate analytics from transactions
 * @param {Array} transactions - Array of transactions
 * @returns {Object} Analytics data
 */
function calculateAnalytics(transactions) {
  const now = new Date();
  const thisMonth = now.getMonth();
  const thisYear = now.getFullYear();
  const today = now.toDateString();

  const analytics = {
    totalTransactions: transactions.length,
    totalVolume: transactions.reduce((sum, t) => sum + t.amount, 0),
    monthTransactions: transactions.filter((t) => {
      const date = new Date(t.timestamp);
      return date.getMonth() === thisMonth && date.getFullYear() === thisYear;
    }).length,
    todayTransactions: transactions.filter(
      (t) => new Date(t.timestamp).toDateString() === today
    ).length,
    pendingTransactions: transactions.filter((t) => t.status === "pending")
      .length,
    failedTransactions: transactions.filter((t) => t.status === "failed")
      .length,
  };

  analytics.averageAmount =
    analytics.totalTransactions > 0
      ? Math.round(analytics.totalVolume / analytics.totalTransactions)
      : 0;

  return analytics;
}

/**
 * Animate number counter
 * @param {HTMLElement} element - Element to animate
 * @param {number} endValue - End value
 * @param {number} duration - Animation duration in ms
 */
function animateCounter(element, endValue, duration = 1000) {
  const startValue = 0;
  const startTime = Date.now();

  function updateCounter() {
    const elapsed = Date.now() - startTime;
    const progress = Math.min(elapsed / duration, 1);

    // Easing function (ease-out)
    const easeOut = 1 - Math.pow(1 - progress, 3);
    const currentValue = Math.round(
      startValue + (endValue - startValue) * easeOut
    );

    element.textContent = currentValue.toLocaleString();

    if (progress < 1) {
      requestAnimationFrame(updateCounter);
    }
  }

  updateCounter();
}

/**
 * Save user preferences to localStorage
 * @param {string} key - Preference key
 * @param {any} value - Preference value
 */
function savePreference(key, value) {
  try {
    localStorage.setItem(`mtn-momo-${key}`, JSON.stringify(value));
  } catch (error) {
    console.warn("Failed to save preference:", error);
  }
}

/**
 * Load user preferences from localStorage
 * @param {string} key - Preference key
 * @param {any} defaultValue - Default value if not found
 * @returns {any} Preference value
 */
function loadPreference(key, defaultValue = null) {
  try {
    const value = localStorage.getItem(`mtn-momo-${key}`);
    return value ? JSON.parse(value) : defaultValue;
  } catch (error) {
    console.warn("Failed to load preference:", error);
    return defaultValue;
  }
}

/**
 * Initialize mobile navigation functionality
 */
function initMobileNavigation() {
  const mobileMenuBtn = document.getElementById('mobile-menu-btn');
  const mobileMenu = document.getElementById('mobile-menu');
  
  if (mobileMenuBtn && mobileMenu) {
    mobileMenuBtn.addEventListener('click', () => {
      const isOpen = mobileMenu.classList.contains('show');
      
      if (isOpen) {
        // Close menu
        mobileMenu.classList.remove('show');
        mobileMenuBtn.setAttribute('aria-expanded', 'false');
      } else {
        // Open menu
        mobileMenu.classList.remove('hidden');
        setTimeout(() => {
          mobileMenu.classList.add('show');
        }, 10);
        mobileMenuBtn.setAttribute('aria-expanded', 'true');
      }
    });

    // Close menu when clicking outside
    document.addEventListener('click', (event) => {
      if (!mobileMenuBtn.contains(event.target) && !mobileMenu.contains(event.target)) {
        mobileMenu.classList.remove('show');
        mobileMenuBtn.setAttribute('aria-expanded', 'false');
      }
    });

    // Close menu on window resize (when switching to desktop)
    window.addEventListener('resize', () => {
      if (window.innerWidth >= 768) { // md breakpoint
        mobileMenu.classList.remove('show');
        mobileMenuBtn.setAttribute('aria-expanded', 'false');
      }
    });
  }
}

// Initialize mobile navigation when DOM is loaded
document.addEventListener('DOMContentLoaded', initMobileNavigation);
