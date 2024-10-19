import { cleanCell } from "./common";
import { debug } from "../utils";
import type { CategoryData, RowData } from "../types";
import type { GoogleSpreadsheetWorksheet, GoogleSpreadsheetRow } from "google-spreadsheet";
import slugify from "slugify";

export function processFieldsSheet(sheet: GoogleSpreadsheetWorksheet, categories: CategoryData[]): RowData[] {
  debug("Processing Fields sheet");
  let currentCategory = "";
  let currentColor = "";

  return sheet.getRows().then((rows: GoogleSpreadsheetRow[]) => rows.map((row: GoogleSpreadsheetRow) => {
    const cleanedData = row._rawData.map(cleanCell).filter((cell: string) => cell !== "");
    if (cleanedData.length === 1) {
      const categoryData = categories.find(cat => slugify(cat.name, { lower: true }) === slugify(cleanedData[0], { lower: true }));
      if (categoryData) {
        currentCategory = categoryData.name;
        currentColor = categoryData.color;
        debug(`Set current category to: ${currentCategory} with color: ${currentColor}`);
        return null; // Skip category rows
      }
    }

    const rowData: RowData = {
      name: cleanedData[0],
      color: currentColor,
      category: currentCategory,
      fields: cleanedData.slice(1),
      stringified: JSON.stringify(cleanedData.slice(1)),
    };
    debug(`Processed field: ${rowData.name} in category: ${rowData.category}`);
    return rowData;
  }).filter(Boolean)); // Remove null entries (category rows)
}
