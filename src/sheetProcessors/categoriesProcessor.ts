import { cleanCell, debug } from "./common";
import slugify from "slugify";
import { GoogleSpreadsheet } from "google-spreadsheet";

interface CategoryData {
  name: string;
  color: string;
}

export function processCategoriesFromFields(sheet: GoogleSpreadsheet.GoogleSpreadsheetWorksheet): CategoryData[] {
  debug("Extracting categories from Fields sheet");
  const categories: CategoryData[] = [];

  for (let rowIndex = 0; rowIndex < sheet.rowCount; rowIndex++) {
    const cell = sheet.getCell(rowIndex, 0);
    const cleanedValue = cleanCell(cell.value?.toString() || "");
    
    if (cleanedValue !== "") {
      const category: CategoryData = {
        name: slugify(cleanedValue, { lower: true }),
        color: cell.effectiveFormat?.backgroundColor ? 
          `#${Math.floor(cell.effectiveFormat.backgroundColor.red * 255).toString(16).padStart(2, '0')}${
            Math.floor(cell.effectiveFormat.backgroundColor.green * 255).toString(16).padStart(2, '0')}${
            Math.floor(cell.effectiveFormat.backgroundColor.blue * 255).toString(16).padStart(2, '0')}` : 
          '#000000'
      };
      categories.push(category);
      debug(`Extracted category: ${category.name} with color: ${category.color}`);
    }
  }

  return categories;
}
