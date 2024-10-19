import slugify from "slugify";


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
