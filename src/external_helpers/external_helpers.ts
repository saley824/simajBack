import * as XLSX from "xlsx";

export interface PriceRow {
    name: string;
    id: number;
    gb1: number;
    gb3: number;
    gb5: number;
    gb10: number;
    gb20: number;
    gb50: number;
}

function readExcel(filePath: string): PriceRow[] {
    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const rows = XLSX.utils.sheet_to_json<PriceRow>(sheet);
    console.log(rows)
    return rows;

}



export default {
    readExcel,

};