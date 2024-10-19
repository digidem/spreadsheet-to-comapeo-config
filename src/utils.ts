import path from "path";
import slugify from "slugify";
import fs from 'fs/promises';

let startTime: number;
let logFile: string;

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

export async function debug(...args: any[]): Promise<void> {
  if (process.env.DEBUG === "true") {
    if (!startTime) {
      startTime = Date.now();
      logFile = path.join('./tests', `${startTime}_log.txt`);
    }

    const timestamp = new Date().toLocaleString();
    const logEntry = `${timestamp}: ${args.map(arg =>
      typeof arg === 'object' ? JSON.stringify(arg) : arg
    ).join(' ')}\n`;

    console.debug(...args);

    try {
      await fs.appendFile(logFile, logEntry);
    } catch (error) {
      console.error('Failed to write to log file:', error);
    }
  }
}
process.on('exit', async () => {
  if (process.env.DEBUG === "true" && startTime) {
    const totalRunTime = (Date.now() - startTime) / 1000;
    const finalEntry = `Total Run Time: ${totalRunTime.toFixed(2)} seconds\n`;
    try {
      await fs.appendFile(logFile, finalEntry);
    } catch (error) {
      console.error('Failed to write final log entry:', error);
    }
  }
});

export function slugifyName(name: string): string {
  return slugify(name, { lower: true });
}
