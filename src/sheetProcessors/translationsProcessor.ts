import { cleanCell, capitalizeFirstLetter, slugifyHeader } from "./common";
import { debug } from "../utils";
import type { RowData, SheetData } from "../types";
export function processTranslationsSheet(rows: any[], headerValues: string[], categories: string[]): SheetData {
  debug("Processing Translations sheet");
  const languages = headerValues.map(slugifyHeader);
  const data: SheetData = { Translations: [] };

  rows.forEach((row) => {
    const firstCell = row._rawData[0].trim().toLowerCase();
    if (!categories.includes(firstCell)) {
      const rowData: RowData = {};
      row._rawData.forEach((cell: string, index: number) => {
        const cleanedCell = cleanCell(cell);
        rowData[languages[index]] = capitalizeFirstLetter(cleanedCell);
      });
      data.Translations.push(rowData);
      debug(`Processed translation: ${rowData[languages[0]]}`);
    } else {
      debug(`Skipped category row: ${firstCell}`);
    }
  });

  return data;
}
