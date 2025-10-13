import PDFDocument from "pdfkit";
import ExcelJS from "exceljs";

export async function exportToPDF({ columns, data, title }: { columns: string[]; data: (string | number)[][]; title?: string }) {
  const doc = new PDFDocument({ size: "A4", margin: 40 });
  const buffers: Buffer[] = [];
  doc.on("data", buffers.push.bind(buffers));
  doc.on("end", () => {});

  // Título
  if (title) {
    doc.fontSize(18).text(title, { align: "center" });
    doc.moveDown();
  }

  // Cabeçalho da tabela
  doc.fontSize(12).font("Helvetica-Bold");
  columns.forEach((col, i) => {
    doc.text(col, { continued: i < columns.length - 1 });
  });
  doc.moveDown(0.5);
  doc.font("Helvetica");

  // Dados
  data.forEach(row => {
    row.forEach((cell, i) => {
      doc.text(String(cell), { continued: i < row.length - 1 });
    });
    doc.moveDown(0.3);
  });

  doc.end();
  return await new Promise<Buffer>((resolve) => {
    doc.on("end", () => {
      resolve(Buffer.concat(buffers));
    });
  });
}

export async function exportToExcel({ columns, data, title }: { columns: string[]; data: (string | number)[][]; title?: string }) {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet(title || "Relatório");
  sheet.addRow(columns);
  data.forEach(row => sheet.addRow(row));
  const buffer = await workbook.xlsx.writeBuffer();
  return Buffer.from(buffer);
}
