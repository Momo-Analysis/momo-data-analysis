import dbInstance from '../database/connection.js';
import { formatPostgresDateTime } from '../utils/dateFormatter.js';

const generateTransactions = async () => {
  const pool = await dbInstance.getConnection();
  const client = await pool.connect();

  try {
    // Get the current maximum ID from each table
    const tables = ['incoming', 'payment', 'bank_deposit', 'transfer', 'withdrawn', 'airtime_bill', 'utility_bill', 'third_party', 'reclaimed'];
    const maxIds = {};
    
    for (const table of tables) {
      const result = await client.query(`SELECT MAX(id) as max_id FROM ${table}`);
      maxIds[table] = result.rows[0].max_id || 0;
    }

    // Sample data for different transaction types
    const transactions = [
      // Incoming transactions
      {
        table: 'incoming',
        data: Array.from({ length: 10 }, (_, i) => ({
          id: maxIds['incoming'] + i + 1,
          transactionId: `TXN${String(maxIds['incoming'] + i + 1).padStart(6, '0')}`,
          type: 'INCOMING',
          amount: 50000 + (i * 5000),
          timestamp: new Date(),
          currency: 'RWF',
          sender: `Sender ${i + 1}`,
          originalSMS: `You have received ${50000 + (i * 5000)} RWF from Sender ${i + 1} (+250788${String(i).padStart(6, '0')}) on your mobile money account.`
        }))
      },
      // Reclaimed transactions
      {
        table: 'reclaimed',
        data: Array.from({ length: 5 }, (_, i) => ({
          id: maxIds['reclaimed'] + i + 1,
          transactionId: `TXN${String(maxIds['reclaimed'] + i + 1).padStart(6, '0')}`,
          type: 'RECLAIMED',
          amount: 1000 + (i * 100),
          timestamp: new Date(),
          currency: 'RWF',
          sender: 'System',
          originalSMS: `An amount of ${1000 + (i * 100)} RWF has been reclaimed.`
        }))
      },
      // Payment transactions
      {
        table: 'payment',
        data: Array.from({ length: 10 }, (_, i) => ({
          id: maxIds['payment'] + i + 1,
          transactionId: `TXN${String(maxIds['payment'] + i + 1).padStart(6, '0')}`,
          type: 'PAYMENT',
          amount: 25000 + (i * 2500),
          timestamp: new Date(),
          currency: 'RWF',
          recipient: `Recipient ${i + 1}`,
          recipientNumber: `+250788${String(i).padStart(6, '0')}`,
          fee: 100,
          originalSMS: `You have paid ${25000 + (i * 2500)} RWF to Recipient ${i + 1} (+250788${String(i).padStart(6, '0')}).`
        }))
      },
      // Bank deposit transactions
      {
        table: 'bank_deposit',
        data: Array.from({ length: 10 }, (_, i) => ({
          id: maxIds['bank_deposit'] + i + 1,
          transactionId: `TXN${String(maxIds['bank_deposit'] + i + 1).padStart(6, '0')}`,
          type: 'BANK_DEPOSIT',
          amount: 100000 + (i * 10000),
          timestamp: new Date(),
          currency: 'RWF',
          originalSMS: `You have deposited ${100000 + (i * 10000)} RWF into your bank account.`
        }))
      },
      // Transfer transactions
      {
        table: 'transfer',
        data: Array.from({ length: 10 }, (_, i) => ({
          id: maxIds['transfer'] + i + 1,
          transactionId: `TXN${String(maxIds['transfer'] + i + 1).padStart(6, '0')}`,
          type: 'TRANSFER',
          amount: 30000 + (i * 3000),
          timestamp: new Date(),
          currency: 'RWF',
          recipient: `Recipient ${i + 1}`,
          recipientNumber: `+250788${String(i).padStart(6, '0')}`,
          fee: 100,
          originalSMS: `You have transferred ${30000 + (i * 3000)} RWF to Recipient ${i + 1} (+250788${String(i).padStart(6, '0')}).`
        }))
      },
      // Withdrawn transactions
      {
        table: 'withdrawn',
        data: Array.from({ length: 10 }, (_, i) => ({
          id: maxIds['withdrawn'] + i + 1,
          transactionId: `TXN${String(maxIds['withdrawn'] + i + 1).padStart(6, '0')}`,
          type: 'WITHDRAWN',
          amount: 20000 + (i * 2000),
          timestamp: new Date(),
          currency: 'RWF',
          agent: `Agent ${i + 1}`,
          agentNumber: `+250788${String(i).padStart(6, '0')}`,
          fee: 100,
          originalSMS: `You have withdrawn ${20000 + (i * 2000)} RWF from Agent ${i + 1} (+250788${String(i).padStart(6, '0')}).`
        }))
      },
      // Airtime bill transactions
      {
        table: 'airtime_bill',
        data: Array.from({ length: 10 }, (_, i) => ({
          id: maxIds['airtime_bill'] + i + 1,
          transactionId: `TXN${String(maxIds['airtime_bill'] + i + 1).padStart(6, '0')}`,
          type: 'AIRTIME_BILL',
          amount: 5000 + (i * 500),
          timestamp: new Date(),
          currency: 'RWF',
          purchasedItem: `Airtime ${i + 1}`,
          originalSMS: `You have purchased ${5000 + (i * 500)} RWF Airtime ${i + 1}.`
        }))
      },
      // Utility bill transactions
      {
        table: 'utility_bill',
        data: Array.from({ length: 10 }, (_, i) => ({
          id: maxIds['utility_bill'] + i + 1,
          transactionId: `TXN${String(maxIds['utility_bill'] + i + 1).padStart(6, '0')}`,
          type: 'UTILITY_BILL',
          amount: 25000 + (i * 2500),
          timestamp: new Date(),
          currency: 'RWF',
          purchasedUtility: `Utility ${i + 1}`,
          meterToken: `UTK${String(i).padStart(6, '0')}`,
          fee: 100,
          originalSMS: `You have paid ${25000 + (i * 2500)} RWF for Utility ${i + 1}. Meter Token: UTK${String(i).padStart(6, '0')}`
        }))
      },
      // Third party transactions
      {
        table: 'third_party',
        data: Array.from({ length: 10 }, (_, i) => ({
          id: maxIds['third_party'] + i + 1,
          transactionId: `TXN${String(maxIds['third_party'] + i + 1).padStart(6, '0')}`,
          type: 'THIRD_PARTY',
          amount: 8000 + (i * 800),
          timestamp: new Date(),
          currency: 'RWF',
          thirdParty: `Service ${i + 1}`,
          fee: 100,
          externalTransactionId: `EXT${String(i).padStart(6, '0')}`,
          originalSMS: `You have paid ${8000 + (i * 800)} RWF to Service ${i + 1} for subscription.`
        }))
      }
    ];

    // Insert transactions
    for (const { table, data } of transactions) {
      for (const transaction of data) {
        const columns = Object.keys(transaction).join(', ');
        const values = Object.values(transaction).map((_, index) => `$${index + 1}`).join(', ');
        const query = `
          INSERT INTO ${table} (${columns})
          VALUES (${values})
          RETURNING id
        `;
        
        await client.query(query, Object.values(transaction));
        console.log(`Inserted transaction into ${table} with ID: ${transaction.id}`);
      }
    }

    console.log('Successfully inserted all transactions');
  } catch (error) {
    console.error('Error inserting transactions:', error);
    throw error;
  } finally {
    client.release();
  }
};

// Run the script
generateTransactions()
  .then(() => {
    console.log('Transaction generation completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Transaction generation failed:', error);
    process.exit(1);
  }); 