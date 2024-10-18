import slugify from "slugify";

export interface RowData {
  [key: string]: string | string[];
}

export interface SheetData {
  [key: string]: RowData[];
}

export function cleanCell(cell: string): string {
  // Remove text within parentheses and trim
  return cell.replace(/\(.*?\)/g, "").trim();
}

export function capitalizeFirstLetter(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export function slugifyHeader(header: string): string {
  return slugify(header);
}

export function debug(...args: any[]): void {
  if (process.env.DEBUG === "true") {
    console.debug(...args);
  }
}
