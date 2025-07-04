const createTransactionsTableQuery = `CREATE TABLE IF NOT EXISTS transactions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    type VARCHAR(20) NOT NULL,
    amount FLOAT NOT NULL,
    timestamp DATETIME NOT NULL,
    originalSMS TEXT
);`;

const createIncomingTableQuery = `CREATE TABLE IF NOT EXISTS incoming (
    id INT PRIMARY KEY AUTO_INCREMENT,
    parent INT NOT NULL,
    transactionId VARCHAR(50),
    currency VARCHAR(10) NOT NULL,
    sender VARCHAR(255) NOT NULL,
    FOREIGN KEY (parent) REFERENCES transactions(id) ON DELETE CASCADE
);`;

const createReclaimedTableQuery = `CREATE TABLE IF NOT EXISTS reclaimed (
    id INT PRIMARY KEY AUTO_INCREMENT,
    parent INT NOT NULL,
    transactionId VARCHAR(50),
    currency VARCHAR(10) NOT NULL,
    sender VARCHAR(255) NOT NULL,
    senderNumber VARCHAR(20),
    FOREIGN KEY (parent) REFERENCES transactions(id) ON DELETE CASCADE
);`;

const createPaymentTableQuery = `CREATE TABLE IF NOT EXISTS payment (
    id INT PRIMARY KEY AUTO_INCREMENT,
    parent INT NOT NULL,
    transactionId VARCHAR(50),
    currency VARCHAR(10),
    recipient VARCHAR(255) NOT NULL,
    recipientNumber VARCHAR(20),
    fee FLOAT DEFAULT 0,
    FOREIGN KEY (parent) REFERENCES transactions(id) ON DELETE CASCADE
);`;

const createBankDepositTableQuery = `CREATE TABLE IF NOT EXISTS bank_deposit (
    id INT PRIMARY KEY AUTO_INCREMENT,
    parent INT NOT NULL,
    transactionId VARCHAR(50),
    currency VARCHAR(10) NOT NULL,
    FOREIGN KEY (parent) REFERENCES transactions(id) ON DELETE CASCADE
);`;

const createTransferTableQuery = `CREATE TABLE IF NOT EXISTS transfer (
    id INT PRIMARY KEY AUTO_INCREMENT,
    parent INT NOT NULL,
    transactionId VARCHAR(50),
    currency VARCHAR(10),
    recipient VARCHAR(255) NOT NULL,
    recipientNumber VARCHAR(20),
    fee FLOAT DEFAULT 0,
    FOREIGN KEY (parent) REFERENCES transactions(id) ON DELETE CASCADE
);`;

const createWithdrawnTableQuery = `CREATE TABLE IF NOT EXISTS withdrawn (
    id INT PRIMARY KEY AUTO_INCREMENT,
    parent INT NOT NULL,
    transactionId VARCHAR(50),
    currency VARCHAR(10) NOT NULL,
    agent VARCHAR(255) NOT NULL,
    agentNumber VARCHAR(20),
    fee FLOAT DEFAULT 0,
    FOREIGN KEY (parent) REFERENCES transactions(id) ON DELETE CASCADE
);`;

const createAirtimeBillTableQuery = `CREATE TABLE IF NOT EXISTS airtime_bill (
    id INT PRIMARY KEY AUTO_INCREMENT,
    parent INT NOT NULL,
    transactionId VARCHAR(50),
    currency VARCHAR(10) NOT NULL,
    purchasedItem VARCHAR(255) NOT NULL,
    FOREIGN KEY (parent) REFERENCES transactions(id) ON DELETE CASCADE
);`;

const createUtilityBillTableQuery = `CREATE TABLE IF NOT EXISTS utility_bill (
    id INT PRIMARY KEY AUTO_INCREMENT,
    parent INT NOT NULL,
    transactionId VARCHAR(50),
    currency VARCHAR(10) NOT NULL,
    purchasedUtility VARCHAR(255) NOT NULL,
    meterToken VARCHAR(50),
    fee FLOAT,
    FOREIGN KEY (parent) REFERENCES transactions(id) ON DELETE CASCADE
);`;

const createThirdPartyTableQuery = `CREATE TABLE IF NOT EXISTS third_party (
    id INT PRIMARY KEY AUTO_INCREMENT,
    parent INT NOT NULL,
    transactionId VARCHAR(50),
    currency VARCHAR(10) NOT NULL,
    thirdParty VARCHAR(255) NOT NULL,
    fee FLOAT DEFAULT 0,
    externalTransactionId VARCHAR(50),
    FOREIGN KEY (parent) REFERENCES transactions(id) ON DELETE CASCADE
);`;

export default [
  createTransactionsTableQuery,
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
