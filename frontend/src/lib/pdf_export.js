/*
 * MotoMart IMS
 * File: src/lib/pdf_export.js
 * Version: 1.1.0
 * Purpose: Export dashboard data to a clean PDF with tables (PDF-safe text).
 *
 * Why this exists:
 * - jsPDF's default fonts are NOT Unicode. Characters like "₱", "ñ", smart quotes, etc.
 *   can render as gibberish in exported PDFs.
 * - We keep exports stable by:
 *   1) formatting money using ASCII ("... pesos"), and
 *   2) normalizing text to a PDF-safe subset.
 */
'use strict';

import { formatPhp } from './format';

const CONFIRM_LABEL = 'Confirm';
const MOTOMART_RED = [220, 38, 38]; // tailwind red-600
const MOTOMART_RED_DARK = [153, 27, 27];
const MOTOMART_GRAY_BG = [17, 24, 39];

function applyRedTheme(doc) {
  // header rule
  const w = doc.internal.pageSize.getWidth();
  doc.setDrawColor(...MOTOMART_RED);
  doc.setLineWidth(2);
  doc.line(40, 54, w - 40, 54);
}

function tableTheme() {
  return {
    theme: 'grid',
    styles: {
      fontSize: 9,
      cellPadding: 6,
      lineColor: [55, 65, 81],
      textColor: [17, 24, 39],
    },
    headStyles: {
      fontStyle: 'bold',
      fillColor: MOTOMART_RED,
      textColor: [255, 255, 255],
      lineColor: MOTOMART_RED_DARK,
    },
    alternateRowStyles: { fillColor: [249, 250, 251] },
  };
}


const PDF_SAFE_REPLACEMENTS = [
  [/₱/g, 'pesos '],
  [/“|”/g, '"'],
  [/’|‘/g, "'"],
  [/–|—/g, '-'],
  [/•/g, '*'],
  [/ñ/g, 'n'],
  [/Ñ/g, 'N'],
  [/á|à|â|ä/g, 'a'],
  [/Á|À|Â|Ä/g, 'A'],
  [/é|è|ê|ë/g, 'e'],
  [/É|È|Ê|Ë/g, 'E'],
  [/í|ì|î|ï/g, 'i'],
  [/Í|Ì|Î|Ï/g, 'I'],
  [/ó|ò|ô|ö/g, 'o'],
  [/Ó|Ò|Ô|Ö/g, 'O'],
  [/ú|ù|û|ü/g, 'u'],
  [/Ú|Ù|Û|Ü/g, 'U'],
];

/**
 * Normalize text to something jsPDF's built-in fonts can render.
 * (Keeps ASCII printable characters, plus newline and basic tabs.)
 */
function toPdfSafeText(v) {
  let s = String(v ?? '').trim();

  for (const [re, rep] of PDF_SAFE_REPLACEMENTS) {
    s = s.replace(re, rep);
  }

  // Strip any remaining non-printable / non-ASCII characters.
  s = s.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '');
  s = s.replace(/[^\x09\x0A\x0D\x20-\x7E]/g, '');

  return s;
}

function nowStamp() {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  const hh = String(d.getHours()).padStart(2, '0');
  const mi = String(d.getMinutes()).padStart(2, '0');
  return { date: `${yyyy}-${mm}-${dd}`, time: `${hh}:${mi}` };
}

export async function exportDashboardPdf({ user, inventory, analytics }) {
  const [{ jsPDF }, autoTableMod] = await Promise.all([
    import('jspdf'),
    import('jspdf-autotable'),
  ]);

  // Some bundlers expose the plugin as default; we just need to ensure it runs.
  // eslint-disable-next-line no-unused-vars
  const _autoTable = autoTableMod?.default || autoTableMod;

  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  applyRedTheme(doc);
  const pageWidth = doc.internal.pageSize.getWidth();

  const stamp = nowStamp();
  const title = 'MOTOMART — Dashboard Export';
  const subtitle = `Date: ${stamp.date}  Time: ${stamp.time}`;
  const operator = `Exported by: ${toPdfSafeText(user?.full_name || user?.email || 'user')}`;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text(toPdfSafeText(title), 40, 46);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text(toPdfSafeText(subtitle), 40, 64);
  doc.text(toPdfSafeText(operator), 40, 78);

  // Summary cards (compact)
  const totals = analytics?.totals || {};
  const today = analytics?.todaySales || {};
  const summaryRows = [
    ['Items', String(totals.items ?? 0)],
    ['On Hand', String(totals.onHand ?? 0)],
    ['Sales Today (Units)', String(today.units ?? 0)],
    ['Sales Today (Revenue)', formatPhp(Number(today.revenue_php || 0))],
  ].map((r) => [toPdfSafeText(r[0]), toPdfSafeText(r[1])]);

  // eslint-disable-next-line no-undef
  doc.autoTable({
    ...tableTheme(),
    startY: 92,
    head: [['Summary', 'Value']],
    body: summaryRows,
    margin: { left: 40, right: 40 },
  });

  let cursorY = doc.lastAutoTable?.finalY ? doc.lastAutoTable.finalY + 18 : 140;

  // Today's Sales table
  const todayItems = Array.isArray(today.items) ? today.items : [];
  if (todayItems.length > 0) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text(toPdfSafeText(`Sales Today — ${toPdfSafeText(today.date)}`), 40, cursorY);
    cursorY += 10;

    const body = todayItems.map((x) => [
      toPdfSafeText(x.sku),
      toPdfSafeText(x.name),
      toPdfSafeText(String(x.units ?? 0)),
      toPdfSafeText(formatPhp(Number(x.revenue_php || 0))),
    ]);

    // eslint-disable-next-line no-undef
    doc.autoTable({
      ...tableTheme(),
      startY: cursorY + 6,
      head: [['SKU', 'Name', 'Units', 'Revenue']],
      body,
      styles: { ...tableTheme().styles, fontSize: 8, cellPadding: 5 },
      margin: { left: 40, right: 40 },
      columnStyles: {
        0: { cellWidth: 90 },
        1: { cellWidth: pageWidth - 40 - 40 - 90 - 60 - 90 },
        2: { cellWidth: 60, halign: 'right' },
        3: { cellWidth: 90, halign: 'right' },
      },
    });

    cursorY = (doc.lastAutoTable?.finalY || cursorY) + 18;
  }

  // Inventory table
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text(toPdfSafeText('Inventory Snapshot'), 40, cursorY);
  cursorY += 10;

  const inv = Array.isArray(inventory) ? inventory : [];
  const invBody = inv.map((i) => [
    toPdfSafeText(i.sku),
    toPdfSafeText(i.name),
    toPdfSafeText(i.category),
    toPdfSafeText(i.bin_location),
    toPdfSafeText(formatPhp(Number(i.price_php || 0))),
    toPdfSafeText(String(i.quantity_on_hand ?? 0)),
    toPdfSafeText(String(i.sold_units ?? 0)),
  ]);

  // eslint-disable-next-line no-undef
  doc.autoTable({
    startY: cursorY + 6,
    head: [['SKU', 'Name', 'Category', 'Bin', 'Price', 'On Hand', 'Sold']],
    body: invBody,
    styles: { fontSize: 7.6, cellPadding: 4 },
    headStyles: { fontStyle: 'bold' },
    theme: 'grid',
    margin: { left: 40, right: 40 },
    columnStyles: {
      0: { cellWidth: 70 },
      1: { cellWidth: 160 },
      2: { cellWidth: 70 },
      3: { cellWidth: 55 },
      4: { cellWidth: 90, halign: 'right' },
      5: { cellWidth: 55, halign: 'right' },
      6: { cellWidth: 45, halign: 'right' },
    },
    didDrawPage: () => {
      const page = doc.internal.getNumberOfPages();
      doc.setFontSize(9);
      doc.setTextColor(...MOTOMART_RED_DARK);
      doc.setFont('helvetica', 'normal');
      doc.text(`Page ${page}`, pageWidth - 80, doc.internal.pageSize.getHeight() - 22);
    },
  });

  const fileName = `motomart_dashboard_${stamp.date}.pdf`;
  doc.save(fileName);
}

export const RESET_CONFIRM_LABEL = CONFIRM_LABEL;
