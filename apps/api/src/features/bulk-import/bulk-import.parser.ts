import csvParser from 'csv-parser';
import ExcelJS from 'exceljs';

import { r2Service } from '../../shared/storage/r2.client.js';

export interface ParsedFileRow {
  rowNumber: number;
  raw: Record<string, string>;
}

/**
 * Parses products rows from Cloudflare R2 object storage supporting both Excel (.xlsx) and CSV (.csv) formats.
 */
export async function parseRowsFromR2(objectKey: string): Promise<ParsedFileRow[]> {
  const stream = await r2Service.getObjectStream(objectKey);
  const isXlsx = objectKey.toLowerCase().endsWith('.xlsx');

  if (isXlsx) {
    const chunks: Buffer[] = [];
    for await (const chunk of stream) {
      chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
    }
    const buffer = Buffer.concat(chunks);
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(buffer as unknown as Parameters<typeof workbook.xlsx.load>[0]);

    const worksheet = workbook.getWorksheet('Products') || workbook.worksheets[0];
    if (!worksheet) return [];

    const rows: ParsedFileRow[] = [];
    const headers: string[] = [];
    const headerRow = worksheet.getRow(1);

    headerRow.eachCell({ includeEmpty: true }, (cell, colNumber) => {
      headers[colNumber] = String(cell.value ?? '')
        .trim()
        .toLowerCase();
    });

    worksheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
      if (rowNumber === 1) return; // Skip header

      const raw: Record<string, string> = {};
      row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
        const header = headers[colNumber];
        if (header) {
          let val = '';
          if (cell.value !== null && cell.value !== undefined) {
            if (typeof cell.value === 'object' && 'text' in cell.value) {
              val = String((cell.value as { text: unknown }).text ?? '');
            } else if (typeof cell.value === 'object' && 'result' in cell.value) {
              val = String((cell.value as { result: unknown }).result ?? '');
            } else {
              val = String(cell.value);
            }
          }
          raw[header] = val.trim();
        }
      });

      // Ignore empty blank rows
      if (Object.values(raw).some((v) => v.length > 0)) {
        rows.push({ rowNumber, raw });
      }
    });

    return rows;
  }

  // CSV parsing fallback
  const rows: ParsedFileRow[] = [];
  let rowNumber = 1;

  await new Promise<void>((resolve, reject) => {
    stream
      .pipe(
        csvParser({
          mapHeaders: ({ header }) => header.trim().toLowerCase(),
          skipLines: 0,
          strict: false,
        }),
      )
      .on('data', (rawRow: Record<string, string>) => {
        rowNumber++;
        rows.push({ rowNumber, raw: rawRow });
      })
      .on('end', () => resolve())
      .on('error', (err) => reject(err));
  });

  return rows;
}
