import { cleanCell, debug } from "./common";
import slugify from "slugify";
import { GoogleSpreadsheet } from "google-spreadsheet";

interface CategoryData {
  name: string;
  color: string;
}

// ...

interface RGBColor {
  red?: number;
  green?: number;
  blue?: number;
  alpha?: { value: number };
}

const protoToCssColor = (rgbColor: RGBColor): string => {
  const red = Math.floor((rgbColor.red || 0) * 255);
  const green = Math.floor((rgbColor.green || 0) * 255);
  const blue = Math.floor((rgbColor.blue || 0) * 255);

  if (!('alpha' in rgbColor)) {
    return rgbToCssColor(red, green, blue);
  }

  const alphaFrac = rgbColor.alpha?.value || 0;
  return `rgba(${red},${green},${blue},${alphaFrac})`;
};

const rgbToCssColor = (red: number, green: number, blue: number): string => {
  const rgbNumber = (red << 16) | (green << 8) | blue;
  return `#${rgbNumber.toString(16).padStart(6, '0')}`;
};

export async function processCategoriesFromFields(sheet: GoogleSpreadsheet.GoogleSpreadsheetWorksheet): Promise<CategoryData[]> {
  debug("Extracting categories from Fields sheet");
  const categories: CategoryData[] = [];
  const categoryRows: number[] = [];

  // First pass: identify rows with categories
  await sheet.loadCells(`A1:A${sheet.rowCount}`);
  for (let rowIndex = 0; rowIndex < sheet.rowCount; rowIndex++) {
    const cell = sheet.getCell(rowIndex, 0);
    const cleanedValue = cleanCell(cell.value?.toString() || "");
    if (cleanedValue !== "") {
      categoryRows.push(rowIndex);
    }
  }

  // Second pass: load and process only the identified category cells
  if (categoryRows.length > 0) {
    const rangesToLoad = categoryRows.map(row => `A${row + 1}`);
    await sheet.loadCells(rangesToLoad.join(','));

    for (const rowIndex of categoryRows) {
      const cell = sheet.getCell(rowIndex, 0);
      const cleanedValue = cleanCell(cell.value?.toString() || "");
      console.log('STYLE', cell.effectiveFormat?.backgroundColorStyle);
      
      const category: CategoryData = {
        name: slugify(cleanedValue, { lower: true }),
        color: protoToCssColor(cell.effectiveFormat?.backgroundColorStyle?.rgbColor || {}),
      };
      categories.push(category);
      debug(`Extracted category: ${category.name} with color: ${category.color}`);
      debug('--------------------------------------------------------------------')
    }
  }

  return categories;
}
