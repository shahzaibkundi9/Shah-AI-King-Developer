import { Request, Response } from "express";
import prisma from "../../db";
import { generateCSV, generatePDF, generateExcel } from "../../services/export.service";

/**
 * Export controller: creates ExportJob entry and runs generator (sync for demo)
 */

export async function startExport(req: any, res: Response) {
  const { type, params } = req.body; // type: csv|pdf|excel
  const job = await prisma.exportJob.create({ data: { type, params: params || {}, status: "PENDING" } });
  try {
    let fileUrl = "";
    if (type === "csv") fileUrl = await generateCSV(job.id, params);
    if (type === "pdf") fileUrl = await generatePDF(job.id, params);
    if (type === "excel") fileUrl = await generateExcel(job.id, params);
    await prisma.exportJob.update({ where: { id: job.id }, data: { status: "DONE", url: fileUrl } });
    res.json({ ok: true, jobId: job.id, url: fileUrl });
  } catch (err: any) {
    await prisma.exportJob.update({ where: { id: job.id }, data: { status: "FAILED" } });
    res.status(500).json({ error: err.message });
  }
}

export async function getStatus(req: any, res: Response) {
  const job = await prisma.exportJob.findUnique({ where: { id: req.params.id } });
  if (!job) return res.status(404).json({ error: "Not found" });
  res.json({ data: job });
}

export async function download(req: any, res: Response) {
  const job = await prisma.exportJob.findUnique({ where: { id: req.params.id } });
  if (!job || !job.url) return res.status(404).json({ error: "File not ready" });
  // For demo: redirect to stored file url
  res.redirect(job.url);
}
