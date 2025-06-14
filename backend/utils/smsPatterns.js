import transactionTypes from "../utils/transaction_types.js";

export const transactionPatterns = {
  incomingMoney: {
    pattern: /you have received (\d+) (\w{2,3}) from ([\w\s]+\b) .+transaction id: (\d+)/i,
    extract: (matches, readable_date) => ({
      type: transactionTypes.incoming,
      amount: Number(matches[1]),
      currency: matches[2],
      sender: matches[3],
      transactionId: matches[4],
      timestamp: readable_date
    })
  },
  reclaimedMoney: {
    pattern: /your transaction to ([\w\s]+\b) \((\d+)\) with (\d+) (\w{2,3}) has been reversed/i,
    extract: (matches, readable_date) => ({
      type: transactionTypes.reclaimed,
      transactionId: null,
      sender: matches[1],
      senderNumber: matches[2],
      amount: Number(matches[3]),
      currency: matches[4],
      timestamp: readable_date
    })
  },
  withdrawnMoney: {
    pattern: /via agent: ([\w\s]+\b) \((\d+)\), withdrawn (\d+) (\w{2,3}) from your.+fee paid: (\d+) .+ financial \w+ id: (\d+)/i,
    extract: (matches, readable_date) => ({
      type: transactionTypes.withdrawn,
      agent: matches[1],
      agentNumber: matches[2],
      amount: Number(matches[3]),
      currency: matches[4],
      fee: Number(matches[5]),
      transactionId: matches[6],
      timestamp: readable_date
    })
  },
  transferMoney: {
    pattern: /\*165\*S\*([\d,]+) (\w{2,3}) transferred to ([\w\s]+\b) \((\d+)\) .+ fee was: (\d+) \w+/i,
    extract: (matches, readable_date) => ({
      type: transactionTypes.transfer,
      transactionId: null,
      amount: Number(matches[1].replace(',', '')),
      currency: matches[2],
      recipient: matches[3],
      recipientNumber: matches[4],
      fee: Number(matches[5]),
      timestamp: readable_date
    })
  },
  transferMoney_2: {
    pattern: /you have transferred ([\d,]+) (\w{2,3}) to ([\w\s]+\b) \((\d+)\).+financial \w+ id: (\d+)/i,
    extract: (matches, readable_date) => ({
      type: transactionTypes.transfer,
      amount: Number(matches[1].replace(',', '')),
      currency: matches[2],
      recipient: matches[3],
      recipientNumber: matches[4],
      transactionId: matches[5],
      timestamp: readable_date
    })
  },
  bankDeposit: {
    pattern: /\*113\*R\*A bank deposit of (\d+) (\w{2,3}) has \w+ added/i,
    extract: (matches, readable_date) => ({
      type: transactionTypes.bank_deposit,
      transactionId: null,
      amount: Number(matches[1]),
      currency: matches[2],
      timestamp: readable_date
    })
  },
  utilityBillPayment: {
    pattern: /\*162\*txid:(\d+)\*S.+payment of (\d+) (\w{2,3}) to (mtn cash power|wasac) with token ([\d-]+) has been.+fee was (\d+)/i,
    extract: (matches, readable_date) => ({
      type: transactionTypes.utility_bill,
      transactionId: matches[1],
      amount: Number(matches[2]),
      currency: matches[3],
      purchasedUtility: matches[4],
      meterToken: matches[5],
      fee: Number(matches[6]),
      timestamp: readable_date
    })
  },
  airtimePayment: {
    pattern: /\*162\*txid:(\d+)\*S.+payment of (\d+) (\w{2,3}) to (airtime|bundles and packs) with token/i,
    extract: (matches, readable_date) => ({
      type: transactionTypes.airtime_bill,
      transactionId: matches[1],
      amount: Number(matches[2]),
      currency: matches[3],
      purchasedItem: matches[4],
      timestamp: readable_date
    })
  },
  thirdPartyPayment: {
    pattern: /\*164\*.+transaction of (\d+) (\w{2,3}) by ([\w\s]+\b)\s+on your momo .+ fee was (\d+) .+ financial \w+ id: (\d+).+external \w+ id: ([\w-]+)/i,
    extract: (matches, readable_date) => ({
      type: transactionTypes.third_party,
      amount: Number(matches[1]),
      currency: matches[2],
      thirdParty: matches[3],
      fee: Number(matches[4]),
      transactionId: matches[5],
      externalTransactionId: matches[6],
      timestamp: readable_date
    })
  },
  momoPayment: {
    pattern: /txid: (\d+)\. .+ payment of ([\d,]+) (\w{2,3}) to ([\w\s]+\b) \d+ has .+\. fee was (\d+)/i,
    extract: (matches, readable_date) => ({
      type: transactionTypes.payment,
      transactionId: matches[1],
      amount: Number(matches[2].replace(',', '')),
      currency: matches[3],
      recipient: matches[4],
      recipientNumber: null,
      fee: Number(matches[5]),
      timestamp: readable_date
    })
  },
  momoPayment_2: {
    pattern: /your payment of ([\d,]+) (\w{2,3}) to ([\w\s]+\b) \((\d+)\) has .+\. fee was (\d+) .+ financial \w+ id: (\d+)/i,
    extract: (matches, readable_date) => ({
      type: transactionTypes.payment,
      amount: Number(matches[1]),
      currency: matches[2],
      recipient: matches[3],
      recipientNumber: matches[4], // Optional
      fee: Number(matches[5]),
      transactionId: matches[6],
      timestamp: readable_date
    })
  },
  momoPayment_3: {
    pattern: /\*162\*txid:(\d+)\*S.+payment of (\d+) (\w{2,3}) to ([\w\s]+) with token\s+has been.+fee was (\d+)/i,
    extract: (matches, readable_date) => ({
      type: transactionTypes.payment,
      transactionId: matches[1],
      amount: Number(matches[2]),
      currency: matches[3],
      recipient: matches[4],
      recipientNumber: null,
      fee: Number(matches[5]),
      timestamp: readable_date
    })
  },
};