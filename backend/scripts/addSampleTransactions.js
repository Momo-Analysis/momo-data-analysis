import dbInstance from '../database/connection.js';
import transactionTypes from '../utils/transaction_types.js';
import { formatPostgresDateTime } from '../utils/dateFormatter.js';

// Sample data generators
const generateRandomAmount = () => Math.floor(Math.random() * 10000) + 100;
const generateRandomPhoneNumber = () => `+250${Math.floor(Math.random() * 1000000000).toString().padStart(9, '0')}`;
const generateRandomName = () => {
  const names = ['John Doe', 'Jane Smith', 'Alice Johnson', 'Bob Brown', 'Charlie Davis'];
  return names[Math.floor(Math.random() * names.length)];
};

// Sample transaction data
const sampleTransactions = [
  {
    type: transactionTypes.incoming,
    amount: generateRandomAmount(),
    timestamp: new Date(),
    details: {
      currency: 'RWF',
      sender: generateRandomName(),
      originalSMS: `You have received ${generateRandomAmount()} RWF from ${generateRandomName()} (${generateRandomPhoneNumber()}) on your mobile money account.`
    }
  },
  {
    type: transactionTypes.payment,
    amount: generateRandomAmount(),
    timestamp: new Date(),
    details: {
      currency: 'RWF',
      recipient: generateRandomName(),
      recipientNumber: generateRandomPhoneNumber(),
      fee: 100,
      originalSMS: `You have paid ${generateRandomAmount()} RWF to ${generateRandomName()} (${generateRandomPhoneNumber()}).`
    }
  },
  {
    type: transactionTypes.transfer,
    amount: generateRandomAmount(),
    timestamp: new Date(),
    details: {
      currency: 'RWF',
      recipient: generateRandomName(),
      recipientNumber: generateRandomPhoneNumber(),
      fee: 100,
      originalSMS: `You have transferred ${generateRandomAmount()} RWF to ${generateRandomName()} (${generateRandomPhoneNumber()}).`
    }
  },
  {
    type: transactionTypes.bank_deposit,
    amount: generateRandomAmount(),
    timestamp: new Date(),
    details: {
      currency: 'RWF',
      originalSMS: `You have deposited ${generateRandomAmount()} RWF into your bank account.`
    }
  },
  {
    type: transactionTypes.airtime_bill,
    amount: generateRandomAmount(),
    timestamp: new Date(),
    details: {
      currency: 'RWF',
      purchasedItem: 'Airtime',
      originalSMS: `You have purchased airtime worth ${generateRandomAmount()} RWF.`
    }
  },
  {
    type: transactionTypes.utility_bill,
    amount: generateRandomAmount(),
    timestamp: new Date(),
    details: {
      currency: 'RWF',
      purchasedUtility: 'Electricity',
      meterToken: `TOKEN${Math.floor(Math.random() * 1000000)}`,
      fee: 100,
      originalSMS: `You have paid ${generateRandomAmount()} RWF for electricity.`
    }
  },
  {
    type: transactionTypes.third_party,
    amount: generateRandomAmount(),
    timestamp: new Date(),
    details: {
      currency: 'RWF',
      thirdParty: generateRandomName(),
      fee: 100,
      externalTransactionId: `EXT${Math.floor(Math.random() * 1000000)}`,
      originalSMS: `You have paid ${generateRandomAmount()} RWF to ${generateRandomName()}.`
    }
  }
];

// Function to insert a transaction
async function insertTransaction(connection, transaction) {
  const { type, amount, timestamp, details } = transaction;
  const transactionId = `TXN${Math.floor(Math.random() * 1000000)}`;
  let columns = ['transactionId', 'type', 'amount', 'timestamp', 'currency'];
  let values = [transactionId, type, amount, formatPostgresDateTime(timestamp), details.currency];
  let placeholders = ['$1', '$2', '$3', '$4', '$5'];
  let paramIndex = 6;

  if (details.sender) {
    columns.push('sender');
    values.push(details.sender);
    placeholders.push(`$${paramIndex++}`);
  }
  if (details.recipient) {
    columns.push('recipient');
    values.push(details.recipient);
    placeholders.push(`$${paramIndex++}`);
  }
  if (details.recipientNumber) {
    columns.push('recipientNumber');
    values.push(details.recipientNumber);
    placeholders.push(`$${paramIndex++}`);
  }
  if (details.fee) {
    columns.push('fee');
    values.push(details.fee);
    placeholders.push(`$${paramIndex++}`);
  }
  if (details.originalSMS) {
    columns.push('originalSMS');
    values.push(details.originalSMS);
    placeholders.push(`$${paramIndex++}`);
  }
  if (details.purchasedItem) {
    columns.push('purchasedItem');
    values.push(details.purchasedItem);
    placeholders.push(`$${paramIndex++}`);
  }
  if (details.purchasedUtility) {
    columns.push('purchasedUtility');
    values.push(details.purchasedUtility);
    placeholders.push(`$${paramIndex++}`);
  }
  if (details.meterToken) {
    columns.push('meterToken');
    values.push(details.meterToken);
    placeholders.push(`$${paramIndex++}`);
  }
  if (details.thirdParty) {
    columns.push('thirdParty');
    values.push(details.thirdParty);
    placeholders.push(`$${paramIndex++}`);
  }
  if (details.externalTransactionId) {
    columns.push('externalTransactionId');
    values.push(details.externalTransactionId);
    placeholders.push(`$${paramIndex++}`);
  }

  const query = `
    INSERT INTO ${type} (${columns.join(', ')})
    VALUES (${placeholders.join(', ')})
    RETURNING id
  `;
  const { rows } = await connection.query(query, values);
  console.log(`Inserted transaction ${type} with ID: ${rows[0].id}`);
}

// Main function to add sample transactions
async function addSampleTransactions() {
  let connection;
  try {
    connection = await dbInstance.getConnection();
    await connection.query('BEGIN');
    for (let i = 0; i < 30; i++) {
      const randomTransaction = sampleTransactions[Math.floor(Math.random() * sampleTransactions.length)];
      await insertTransaction(connection, randomTransaction);
    }
    await connection.query('COMMIT');
    console.log('30 sample transactions added successfully.');
  } catch (error) {
    if (connection) await connection.query('ROLLBACK');
    console.error('Error adding sample transactions:', error);
  } finally {
    if (connection) {
      try {
        await connection.release();
      } catch (error) {
        console.error('Error releasing database connection:', error);
      }
    }
  }
}

// Run the script
addSampleTransactions(); 