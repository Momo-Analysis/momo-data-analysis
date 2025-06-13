import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:3000';

/**
 * Simple API testing script
 */
class APITester {
  
  static async testEndpoint(endpoint, description) {
    try {
      console.log(`\n🧪 Testing: ${description}`);
      console.log(`📡 Endpoint: ${endpoint}`);
      
      const response = await fetch(endpoint);
      const data = await response.json();
      
      if (response.ok && data.success) {
        console.log(`✅ Success: ${data.message}`);
        if (data.data) {
          if (Array.isArray(data.data)) {
            console.log(`📊 Data count: ${data.data.length}`);
          } else {
            console.log(`📊 Data type: ${typeof data.data}`);
          }
        }
        if (data.pagination) {
          console.log(`📄 Pagination: Page ${data.pagination.currentPage} of ${data.pagination.totalPages} (${data.pagination.totalRecords} total)`);
        }
      } else {
        console.log(`❌ Failed: ${data.message || 'Unknown error'}`);
      }
      
      return { success: response.ok && data.success, data };
    } catch (error) {
      console.log(`❌ Error: ${error.message}`);
      return { success: false, error: error.message };
    }
  }

  static async runTests() {
    console.log('🚀 Starting API Tests for MoMo Data Analysis');
    console.log('=' .repeat(50));

    const tests = [
      {
        endpoint: `${BASE_URL}/health`,
        description: 'Health Check'
      },
      {
        endpoint: `${BASE_URL}/`,
        description: 'API Information'
      },
      {
        endpoint: `${BASE_URL}/api/transactions/types`,
        description: 'Get Transaction Types'
      },
      {
        endpoint: `${BASE_URL}/api/transactions?limit=5`,
        description: 'Get Transactions (First 5)'
      },
      {
        endpoint: `${BASE_URL}/api/transactions?page=1&limit=3`,
        description: 'Get Transactions with Pagination'
      },
      {
        endpoint: `${BASE_URL}/api/transactions/stats`,
        description: 'Get Transaction Statistics'
      },
      {
        endpoint: `${BASE_URL}/api/transactions?type=INCOMING&limit=3`,
        description: 'Filter by Transaction Type (INCOMING)'
      },
      {
        endpoint: `${BASE_URL}/api/transactions?minAmount=1000&maxAmount=5000&limit=3`,
        description: 'Filter by Amount Range (1000-5000)'
      },
      {
        endpoint: `${BASE_URL}/api/transactions?date=2024-01-01&limit=3`,
        description: 'Filter by Exact Date'
      },
      {
        endpoint: `${BASE_URL}/api/transactions?startDate=2024-01-01&endDate=2024-01-31&limit=3`,
        description: 'Filter by Date Range'
      }
    ];

    let passed = 0;
    let failed = 0;

    for (const test of tests) {
      const result = await APITester.testEndpoint(test.endpoint, test.description);
      if (result.success) {
        passed++;
      } else {
        failed++;
      }
      
      // Add a small delay between tests
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    console.log('\n' + '=' .repeat(50));
    console.log(`🏁 Test Summary:`);
    console.log(`✅ Passed: ${passed}`);
    console.log(`❌ Failed: ${failed}`);
    console.log(`📈 Success Rate: ${((passed / (passed + failed)) * 100).toFixed(1)}%`);

    if (failed > 0) {
      console.log('\n⚠️  Some tests failed. Make sure:');
      console.log('  - The API server is running on port 3000');
      console.log('  - The database is set up and contains data');
      console.log('  - All dependencies are installed');
    }
  }
}

// Run tests if this script is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  APITester.runTests().catch(error => {
    console.error('Test runner failed:', error);
    process.exit(1);
  });
}

export default APITester;
