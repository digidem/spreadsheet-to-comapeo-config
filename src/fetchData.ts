import { GoogleSpreadsheet } from "google-spreadsheet";
import { getAuth } from "./auth";
import fs from "fs/promises";
import path from "path";
import dotenv from "dotenv";
import { debug } from "./utils";
import type { SheetData, CategoryData } from "./types";
import { processCategoriesFromFields } from "./sheetProcessors/categoriesProcessor";
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

    // First, process the Fields sheet to extract categories
    const fieldsSheet = doc.sheetsByTitle['Fields'];
    if (!fieldsSheet) {
      throw new Error("Fields sheet not found");
    }
    await fieldsSheet.loadHeaderRow();
    data.Categories = await processCategoriesFromFields(fieldsSheet) as CategoryData[];
    console.log(`Extracted ${data.Categories.length} categories from Fields sheet`);

    // Then process all sheets
    for (let i = 0; i < doc.sheetCount; i++) {
      const sheet = doc.sheetsByIndex[i];
      console.log(`Processing sheet ${i + 1}/${doc.sheetCount}: ${sheet.title}`);

      await sheet.loadHeaderRow();
      await sheet.loadCells();
      const rows = await sheet.getRows();
      console.log(`Fetched ${rows.length} rows from sheet: ${sheet.title}`);

      switch (sheet.title) {
        case 'Translations':
          Object.assign(data, processTranslationsSheet(rows, sheet.headerValues, data.Categories as CategoryData[]));
          break;
        case 'Fields':
          data[sheet.title] = await processFieldsSheet(sheet, data.Categories as CategoryData[]);
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
  } catch (error: unknown) {
    console.error("Error fetching data:", error instanceof Error ? error.message : String(error));
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
