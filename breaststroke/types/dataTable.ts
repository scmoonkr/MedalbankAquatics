// types/dataTable.ts

export interface DataRow {
  id: number | string;
  [key: string]: any;
}

export interface DataColumn {
  key: string;
  label: string;
  sortable?: boolean;
  render?: (value: any, row: DataRow) => string;
}
