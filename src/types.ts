export interface SheetData {
  [key: string]: any[];
}

export interface DetailData {
  field: string;
  type: string;
  options: string[];
  stringified: string;
}

export interface FieldData {
  name: string;
  color: string;
  category: string;
  fields: string[];
}

export interface TranslationData {
  [key: string]: string;
}

export interface PresetCategoryData {
  name: string;
  color: string;
}

export interface RowData {
  [key: string]: string | string[];
}
