import { cleanCell } from "./common";
import { debug } from "../utils";
import type { PresetCategoryData } from "../types";
import type { GoogleSpreadsheetWorksheet, GoogleSpreadsheetRow } from "google-spreadsheet";
import slugify from "slugify";

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

export async function processCategoriesFromPresets(sheet: GoogleSpreadsheetWorksheet): Promise<PresetCategoryData[]> {
  debug("Extracting presets from Categories sheet");
  const categories: PresetCategoryData[] = [];
  const presetRows = await sheet.getRows();
  const categoryRows: number[] = presetRows.filter((row: GoogleSpreadsheetRow) => row._rawData.length < 2).map((row) => row._rowNumber);
  debug('categoryRows', categoryRows);
  // First pass: identify rows with categories
  if (categoryRows.length > 0) {
    const startRow = Math.min(...categoryRows);
    const endRow = Math.max(...categoryRows);
    const rangeToLoad = `A${startRow}:A${endRow}`;
    await sheet.loadCells(rangeToLoad);
    for (const rowNumber of categoryRows) {
      const cell = sheet.getCell(rowNumber - 1, 0);
      if (!cell.value) {
        console.warn(`Cell at row ${rowNumber} is not loaded or empty`);
        continue;
      }
      const cleanedValue = cleanCell(cell.value?.toString() || "");

      const category: PresetCategoryData = {
        name: slugify(cleanedValue, { lower: true }),
        color: protoToCssColor(cell.effectiveFormat?.backgroundColorStyle?.rgbColor || {}),
      };
      categories.push(category);
      debug(`Extracted category: ${category.name} with color: ${category.color}`);
    }
  }

  return categories;
}
