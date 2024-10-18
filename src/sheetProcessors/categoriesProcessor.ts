import { type RowData, cleanCell, debug } from "./common";
import slugify from "slugify";
import { GoogleSpreadsheetCell } from "google-spreadsheet";

interface CategoryData {
  name: string;
  color: string;
}

export function processCategoriesFromFields(rows: GoogleSpreadsheetCell[][]): CategoryData[] {
  debug("Extracting categories from Fields sheet");
  const categories: CategoryData[] = [];

  rows.forEach((row) => {
    const cleanedData = row._rawData.map(cleanCell).filter((cell: string) => cell !== "");
    // const cleanedData = row.map(cell => cleanCell(cell.value?.toString() || "")).filter((cell: string) => cell !== "");
    console.log('ROW', row._rawData[0]);
    if (cleanedData.length === 1) {
      const categoryName = cleanedData[0];
      // const category: CategoryData = {
      //   name: slugify(categoryName, { lower: true }),
      //   color: row[0].effectiveFormat?.backgroundColor?.red ? 
      //     `#${Math.floor(row[0].effectiveFormat.backgroundColor.red * 255).toString(16).padStart(2, '0')}${
      //       Math.floor(row[0].effectiveFormat.backgroundColor.green * 255).toString(16).padStart(2, '0')}${
      //       Math.floor(row[0].effectiveFormat.backgroundColor.blue * 255).toString(16).padStart(2, '0')}` : 
      //     '#000000'
      // };
      categories.push(category);
      debug(`Extracted category: ${category.name} with color: ${category.color}`);
    }
  });

  return categories;
}
