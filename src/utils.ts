import path from "path";
import slugify from "slugify";

export const fieldsFolder = path.join(
  process.cwd(),
  process.env.DEBUG === "true" ? "tests/fields" : "fields"
);
export const translationsFolder = path.join(process.cwd(), "translations");

export function cleanData(data: { [key: string]: any[] }): void {
  Object.keys(data).forEach(sheetName => {
    data[sheetName] = data[sheetName].filter(row => Object.keys(row).length > 0);
  });
}

export function validateDetailsData(detailsData: any[]): void {
  if (!detailsData[0]?.field) {
    throw new Error("First field in Details sheet is missing or invalid.");
  }
}

export function debug(...args: any[]): void {
  if (process.env.DEBUG === "true") {
    console.debug(...args);
  }
}

export function slugifyName(name: string): string {
  return slugify(name, { lower: true });
}
