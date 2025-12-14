/**
 * export.service.ts
 * - generateCSV -> use json2csv
 * - generatePDF -> use pdfkit
 * - generateExcel -> use exceljs
 *
 * For demo we store files to /tmp and return file:// urls (replace with Cloudinary/S3 in prod)
 */

import { Parser } from "json2csv";
import PDFDocument from "pdfkit";
import ExcelJS from "exceljs";
import fs from "fs";
import path from "path";
import prisma from "../db";

const TMP = path.join(__dirname, "../../tmp");
if (!fs.existsSync(TMP)) fs.mkdirSync(TMP, { recursive: true });

export async function generateCSV(jobId: string, params: any) {
  // example: export conversations
  const convs = await prisma.conversation.findMany({ include: { customer: true, messages: true } });
  const rows = convs.map(c => ({
    id: c.id,
    customer: c.customer.phone,
    lastMessage: c.lastMessage,
    updatedAt: c.updatedAt
  }));
  const parser = new Parser();
  const csv = parser.parse(rows);
  const file = path.join(TMP, `export_${jobId}.csv`);
  fs.writeFileSync(file, csv);
  return `file://${file}`;
}

export async function generatePDF(jobId: string, params: any) {
  const convs = await prisma.conversation.findMany({ include: { customer: true } });
  const file = path.join(TMP, `export_${jobId}.pdf`);
  const doc = new PDFDocument();
  doc.pipe(fs.createWriteStream(file));
  doc.fontSize(18).text("Conversations Report", { underline: true });
  convs.forEach(c => {
    doc.moveDown().fontSize(12).text(`ID: ${c.id}`);
    doc.text(`Customer: ${c.customer.phone}`);
    doc.text(`Last: ${c.lastMessage || "-"}`);
    doc.text(`Updated: ${c.updatedAt.toISOString()}`);
  });
  doc.end();
  return `file://${file}`;
}

export async function generateExcel(jobId: string, params: any) {
  const convs = await prisma.conversation.findMany({ include: { customer: true } });
  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet("Conversations");
  ws.columns = [{ header: "ID", key: "id" }, { header: "Customer", key: "customer" }, { header: "Last", key: "last" }, { header: "Updated", key: "updated" }];
  convs.forEach(c => ws.addRow({ id: c.id, customer: c.customer.phone, last: c.lastMessage, updated: c.updatedAt.toISOString() }));
  const file = path.join(TMP, `export_${jobId}.xlsx`);
  await wb.xlsx.writeFile(file);
  return `file://${file}`;
}
