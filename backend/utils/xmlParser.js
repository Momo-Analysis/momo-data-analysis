import { XMLParser } from 'fast-xml-parser';
import { readFile } from 'fs/promises';

const xmlParser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: ''
});

export async function parseXMLFile(filePath) {
  try {
    const xmlData = await readFile(filePath, 'utf8');
    return xmlParser.parse(xmlData);
  } catch (error) {
    console.error(`XML parsing error: ${error.message}`);
    throw new Error('Failed to parse XML file');
  }
}