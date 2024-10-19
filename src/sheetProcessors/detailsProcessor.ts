import { cleanCell } from "./common";
import { debug } from "../utils";
import type { RowData } from "../types";

export function processDetailsSheet(rows: any[]): RowData[] {
  debug("Processing Details sheet");
  return rows.map((row) => {
    const cleanedData = row._rawData.map(cleanCell).filter((cell: string) => cell !== "" && cell !== " ");
    let options = cleanedData[1]
      ? cleanedData[1].split(",").map((option: string) => option.trim()).filter((option: string) => option !== "")
      : [];
    
    const checkType = (data: string[]): string => {
      if (data[2] === "m") return "select_multiple";
      if (data[1]?.toLowerCase().includes("text")) return "text";
      if (data[1]?.toLowerCase().includes("num")) return "number";
      return "select_one";
    };

    const setRowData = (field: string, type: string): RowData => {
      const baseData: RowData = { field, type };
      if (type !== "text" && type !== "number") {
        baseData.options = options;
        baseData.stringified = JSON.stringify(options);
      }
      return baseData;
    };

    const type = checkType(cleanedData);
    const rowData: RowData = setRowData(cleanedData[0], type);
    debug(`Processed detail: ${rowData.field} with type: ${rowData.type}`);
    return rowData;
  });
}
