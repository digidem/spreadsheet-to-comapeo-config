import { RowData, cleanCell, debug } from "./common";
import slugify from "slugify";

export function processFieldsSheet(rows: any[], categories: string[]): RowData[] {
  debug("Processing Fields sheet");
  let currentCategory = "";
  return rows.map((row) => {
    let rowData: RowData = {};
    const cleanedData = row._rawData.map(cleanCell).filter((cell: string) => cell !== "");

    if (cleanedData.length === 1 && categories.includes(slugify(cleanedData[0], { lower: true }))) {
      currentCategory = cleanedData[0];
      debug(`Set current category to: ${currentCategory}`);
      return null; // Skip category rows
    } else {
      rowData = {
        name: cleanedData[0],
        category: currentCategory,
        fields: cleanedData.slice(1),
        stringified: JSON.stringify(cleanedData.slice(1)),
      };
      debug(`Processed field: ${rowData.name} in category: ${rowData.category}`);
    }
    return rowData;
  }).filter(Boolean); // Remove null entries (category rows)
}
