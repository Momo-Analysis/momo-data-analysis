const createIncomingTableQuery = `CREATE TABLE IF NOT EXISTS incoming (
    id SERIAL PRIMARY KEY,
    transactionId VARCHAR(50),
    type VARCHAR(20) NOT NULL,
    amount FLOAT NOT NULL,
    timestamp TIMESTAMP NOT NULL,
    currency VARCHAR(10) NOT NULL,
    sender VARCHAR(255) NOT NULL,
    originalSMS TEXT
);`;

const createReclaimedTableQuery = `CREATE TABLE IF NOT EXISTS reclaimed (
    id SERIAL PRIMARY KEY,
    transactionId VARCHAR(50),
    type VARCHAR(20) NOT NULL,
    amount FLOAT NOT NULL,
    timestamp TIMESTAMP NOT NULL,
    currency VARCHAR(10) NOT NULL,
    sender VARCHAR(255) NOT NULL,
    senderNumber VARCHAR(20),
    originalSMS TEXT
);`;

const createPaymentTableQuery = `CREATE TABLE IF NOT EXISTS payment (
    id SERIAL PRIMARY KEY,
    transactionId VARCHAR(50),
    type VARCHAR(20) NOT NULL,
    amount FLOAT NOT NULL,
    timestamp TIMESTAMP NOT NULL,
    currency VARCHAR(10),
    recipient VARCHAR(255) NOT NULL,
    recipientNumber VARCHAR(20),
    fee FLOAT DEFAULT 0,
    originalSMS TEXT
);`;

const createBankDepositTableQuery = `CREATE TABLE IF NOT EXISTS bank_deposit (
    id SERIAL PRIMARY KEY,
    transactionId VARCHAR(50),
    type VARCHAR(20) NOT NULL,
    amount FLOAT NOT NULL,
    timestamp TIMESTAMP NOT NULL,
    currency VARCHAR(10) NOT NULL,
    originalSMS TEXT
);`;

const createTransferTableQuery = `CREATE TABLE IF NOT EXISTS transfer (
    id SERIAL PRIMARY KEY,
    transactionId VARCHAR(50),
    type VARCHAR(20) NOT NULL,
    amount FLOAT NOT NULL,
    timestamp TIMESTAMP NOT NULL,
    currency VARCHAR(10),
    recipient VARCHAR(255) NOT NULL,
    recipientNumber VARCHAR(20),
    fee FLOAT DEFAULT 0,
    originalSMS TEXT
);`;

const createWithdrawnTableQuery = `CREATE TABLE IF NOT EXISTS withdrawn (
    id SERIAL PRIMARY KEY,
    transactionId VARCHAR(50),
    type VARCHAR(20) NOT NULL,
    amount FLOAT NOT NULL,
    timestamp TIMESTAMP NOT NULL,
    currency VARCHAR(10) NOT NULL,
    agent VARCHAR(255) NOT NULL,
    agentNumber VARCHAR(20),
    fee FLOAT DEFAULT 0,
    originalSMS TEXT
);`;

const createAirtimeBillTableQuery = `CREATE TABLE IF NOT EXISTS airtime_bill (
    id SERIAL PRIMARY KEY,
    transactionId VARCHAR(50),
    type VARCHAR(20) NOT NULL,
    amount FLOAT NOT NULL,
    timestamp TIMESTAMP NOT NULL,
    currency VARCHAR(10) NOT NULL,
    purchasedItem VARCHAR(255) NOT NULL,
    originalSMS TEXT
);`;

const createUtilityBillTableQuery = `CREATE TABLE IF NOT EXISTS utility_bill (
    id SERIAL PRIMARY KEY,
    transactionId VARCHAR(50),
    type VARCHAR(20) NOT NULL,
    amount FLOAT NOT NULL,
    timestamp TIMESTAMP NOT NULL,
    currency VARCHAR(10) NOT NULL,
    purchasedUtility VARCHAR(255) NOT NULL,
    meterToken VARCHAR(50),
    fee FLOAT,
    originalSMS TEXT
);`;

const createThirdPartyTableQuery = `CREATE TABLE IF NOT EXISTS third_party (
    id SERIAL PRIMARY KEY,
    transactionId VARCHAR(50),
    type VARCHAR(20) NOT NULL,
    amount FLOAT NOT NULL,
    timestamp TIMESTAMP NOT NULL,
    currency VARCHAR(10) NOT NULL,
    thirdParty VARCHAR(255) NOT NULL,
    fee FLOAT DEFAULT 0,
    externalTransactionId VARCHAR(50),
    originalSMS TEXT
);`;

export default [
  createIncomingTableQuery,
  createReclaimedTableQuery,
  createPaymentTableQuery,
  createBankDepositTableQuery,
  createTransferTableQuery,
  createWithdrawnTableQuery,
  createAirtimeBillTableQuery,
  createUtilityBillTableQuery,
  createThirdPartyTableQuery,
];
