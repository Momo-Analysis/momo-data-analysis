// utils/transactionParser.js
import { transactionPatterns } from './smsPatterns.js';

function parseSMSBody(smsBody, readable_date) {
  for (const [_type, { pattern, extract }] of Object.entries(transactionPatterns)) {
    const patternType = _type.replace(/_\d$/, '');
    const matches = smsBody.match(pattern);
    if (matches) {
      try {
        const transaction = extract(matches, readable_date);
        const { transactionId, type, amount, timestamp, ...details } = transaction;
        return {
          transactionId,
          type,
          amount,
          timestamp,
          details: {
            ...details,
            // originalSMS: smsBody,
            // parsedAt: new Date().toISOString()
          }
        };
      } catch (error) {
        console.error(`Extraction failed for ${patternType}: ${error.message}`);
      }
    }
  }

  console.warn(`Failed to parse SMS: ${smsBody}`);
  return null;
}

export async function processTransactions(xmlData) {
  const messages = xmlData.smses.sms || [];
  return messages
    .map(msg => parseSMSBody(msg.body, new Date(msg.readable_date).toISOString()))
    .filter(Boolean);
}