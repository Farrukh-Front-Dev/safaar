import * as XLSX from "xlsx";

export function exportToExcel<T extends Record<string, any>>(data: T[], filename: string) {
  // Obyekt kalitlarini tekshirib, varaqqa (worksheet) aylantirish
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Ma'lumotlar");

  // Faylni yuklab berish
  XLSX.writeFile(workbook, `${filename}_${new Date().toISOString().split("T")[0]}.xlsx`);
}
