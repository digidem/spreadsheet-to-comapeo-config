import { GoogleSpreadsheet } from "google-spreadsheet";
import { getAuth } from "./auth";
import fs from "fs/promises";
import path from "path";
import dotenv from "dotenv";
import { SheetData, debug } from "./sheetProcessors/common";
import { processFieldsSheet } from "./sheetProcessors/fieldsProcessor";
import { processDetailsSheet } from "./sheetProcessors/detailsProcessor";
import { processTranslationsSheet } from "./sheetProcessors/translationsProcessor";

dotenv.config();

const docId = process.env.DOC_ID;
const cacheFilePath = path.join(__dirname, ".cache", "data.json");

async function fetchData(): Promise<SheetData> {
  console.log("Starting to fetch data from Google Sheets...");
  if (!docId) {
    throw new Error("DOC_ID is not defined.");
  }
  try {
    const auth = getAuth();
    debug('Auth successfully initialized with scopes:', auth.scopes);
    const doc = new GoogleSpreadsheet(docId, auth);
    debug(`Document ID: ${docId}`);

    await doc.loadInfo();
    console.log(`Loaded document: ${doc.title}`);

    const data: SheetData = {};

    for (let i = 0; i < doc.sheetCount; i++) {
      const sheet = doc.sheetsByIndex[i];
      console.log(`Processing sheet ${i + 1}/${doc.sheetCount}: ${sheet.title}`);

      await sheet.loadHeaderRow();
      // debug(`Header values for ${sheet.title}:`, sheet.headerValues);

      const rows = await sheet.getRows();
      console.log(`Fetched ${rows.length} rows from sheet: ${sheet.title}`);

      switch (sheet.title) {
        case 'Translations':
          Object.assign(data, processTranslationsSheet(rows, sheet.headerValues));
          break;
        case 'Fields':
          data[sheet.title] = processFieldsSheet(rows, data.Categories as string[]);
          break;
        case 'Details':
          data[sheet.title] = processDetailsSheet(rows);
          break;
        default:
          console.warn(`Unhandled sheet: ${sheet.title}`);
      }
    }

    // Save data to cache
    await fs.mkdir(path.dirname(cacheFilePath), { recursive: true });
    await fs.writeFile(cacheFilePath, JSON.stringify(data, null, 2));
    console.log("Data cached successfully.");

    return data;
  } catch (error) {
    console.error("Error fetching data:", error.toString());
    // Attempt to use cached data
    try {
      console.log("Using cached data due to fetch failure.");
      const cachedData = JSON.parse(await fs.readFile(cacheFilePath, "utf-8"));
      return cachedData;
    } catch {
      throw new Error("No cached data available and failed to fetch new data.");
    }
  }
}

export { fetchData };
