/*
 * MotoMart IMS
 * File: src/lib/pdf_export.js
 * Version: 1.3.0
 * Purpose: Export dashboard data to a cleaner premium red-themed PDF with tables (PDF-safe text).
 */
'use strict';

import { formatPhp } from './format';

const CONFIRM_LABEL = 'Confirm';

const MOTOMART_RED = [185, 28, 28];
const MOTOMART_RED_DARK = [127, 29, 29];
const MOTOMART_RED_SOFT = [254, 242, 242];
const MOTOMART_RED_BORDER = [252, 165, 165];
const MOTOMART_TEXT = [17, 24, 39];
const MOTOMART_TEXT_MUTED = [75, 85, 99];
const MOTOMART_WHITE = [255, 255, 255];

const PAGE_MARGIN_LEFT = 40;
const PAGE_MARGIN_RIGHT = 40;
const PAGE_FOOTER_OFFSET = 22;

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
 * @param {unknown} value
 * @returns {string}
 */
function toPdfSafeText(value) {
  let text = String(value ?? '').trim();

  for (const [pattern, replacement] of PDF_SAFE_REPLACEMENTS) {
    text = text.replace(pattern, replacement);
  }

  text = text.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '');
  text = text.replace(/[^\x09\x0A\x0D\x20-\x7E]/g, '');

  return text;
}

/**
 * Create current export timestamp.
 * @returns {{ date: string, time: string }}
 */
function nowStamp() {
  const currentDate = new Date();
  const year = currentDate.getFullYear();
  const month = String(currentDate.getMonth() + 1).padStart(2, '0');
  const day = String(currentDate.getDate()).padStart(2, '0');
  const hour = String(currentDate.getHours()).padStart(2, '0');
  const minute = String(currentDate.getMinutes()).padStart(2, '0');

  return {
    date: `${year}-${month}-${day}`,
    time: `${hour}:${minute}`,
  };
}

/**
 * Draw a clean accent line under the header block.
 * @param {import('jspdf').jsPDF} doc
 * @returns {void}
 */
function drawHeaderDivider(doc) {
  const pageWidth = doc.internal.pageSize.getWidth();

  doc.setDrawColor(...MOTOMART_RED_BORDER);
  doc.setLineWidth(1.2);
  doc.line(
    PAGE_MARGIN_LEFT,
    88,
    pageWidth - PAGE_MARGIN_RIGHT,
    88,
  );
}

/**
 * Draw section title with subtle red accent.
 * @param {import('jspdf').jsPDF} doc
 * @param {string} title
 * @param {number} y
 * @returns {number}
 */
function drawSectionTitle(doc, title, y) {
  doc.setFillColor(...MOTOMART_RED);
  doc.rect(PAGE_MARGIN_LEFT, y - 9, 4, 14, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(...MOTOMART_RED_DARK);
  doc.text(toPdfSafeText(title), PAGE_MARGIN_LEFT + 10, y);

  return y + 8;
}

/**
 * Draw footer for current page.
 * @param {import('jspdf').jsPDF} doc
 * @returns {void}
 */
function drawFooter(doc) {
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const pageNumber = doc.internal.getCurrentPageInfo().pageNumber;

  doc.setDrawColor(...MOTOMART_RED_BORDER);
  doc.setLineWidth(0.8);
  doc.line(
    PAGE_MARGIN_LEFT,
    pageHeight - 34,
    pageWidth - PAGE_MARGIN_RIGHT,
    pageHeight - 34,
  );

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(...MOTOMART_RED_DARK);
  doc.text(`Page ${pageNumber}`, pageWidth - 78, pageHeight - PAGE_FOOTER_OFFSET);
}

/**
 * Shared red table theme.
 * @returns {object}
 */
function tableTheme() {
  return {
    theme: 'grid',
    styles: {
      fontSize: 9,
      cellPadding: 6,
      lineColor: MOTOMART_RED_BORDER,
      lineWidth: 0.35,
      textColor: MOTOMART_TEXT,
    },
    headStyles: {
      fontStyle: 'bold',
      fillColor: MOTOMART_RED,
      textColor: MOTOMART_WHITE,
      lineColor: MOTOMART_RED_DARK,
      lineWidth: 0.45,
    },
    bodyStyles: {
      textColor: MOTOMART_TEXT,
    },
    alternateRowStyles: {
      fillColor: MOTOMART_RED_SOFT,
    },
    margin: {
      left: PAGE_MARGIN_LEFT,
      right: PAGE_MARGIN_RIGHT,
    },
  };
}

export async function exportDashboardPdf({ user, inventory, analytics }) {
  const [{ jsPDF }, autoTableModule] = await Promise.all([
    import('jspdf'),
    import('jspdf-autotable'),
  ]);

  const autoTable = autoTableModule?.default || autoTableModule;

  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();
  const stamp = nowStamp();

  const totals = analytics?.totals || {};
  const today = analytics?.todaySales || {};
  const todayItems = Array.isArray(today.items) ? today.items : [];
  const inventoryItems = Array.isArray(inventory) ? inventory : [];

  const title = 'MOTOMART - Dashboard Export';
  const subtitle = `Date: ${stamp.date}  Time: ${stamp.time}`;
  const operator = `Exported by: ${toPdfSafeText(user?.full_name || user?.email || 'user')}`;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(...MOTOMART_RED_DARK);
  doc.text(toPdfSafeText(title), PAGE_MARGIN_LEFT, 46);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(...MOTOMART_TEXT_MUTED);
  doc.text(toPdfSafeText(subtitle), PAGE_MARGIN_LEFT, 64);
  doc.text(toPdfSafeText(operator), PAGE_MARGIN_LEFT, 78);

  drawHeaderDivider(doc);

  const summaryRows = [
    ['Items', String(totals.items ?? 0)],
    ['On Hand', String(totals.onHand ?? 0)],
    ['Sales Today (Units)', String(today.units ?? 0)],
    ['Sales Today (Revenue)', formatPhp(Number(today.revenue_php || 0))],
  ].map(([label, value]) => [toPdfSafeText(label), toPdfSafeText(value)]);

  autoTable(doc, {
    ...tableTheme(),
    startY: 102,
    head: [['Summary', 'Value']],
    body: summaryRows,
    didDrawPage: () => {
      drawFooter(doc);
    },
  });

  let cursorY = doc.lastAutoTable?.finalY ? doc.lastAutoTable.finalY + 22 : 150;

  if (todayItems.length > 0) {
    cursorY = drawSectionTitle(
      doc,
      `Sales Today - ${toPdfSafeText(today.date || stamp.date)}`,
      cursorY,
    );

    const salesRows = todayItems.map((item) => [
      toPdfSafeText(item.sku),
      toPdfSafeText(item.name),
      toPdfSafeText(String(item.units ?? 0)),
      toPdfSafeText(formatPhp(Number(item.revenue_php || 0))),
    ]);

    autoTable(doc, {
      ...tableTheme(),
      startY: cursorY + 8,
      head: [['SKU', 'Name', 'Units', 'Revenue']],
      body: salesRows,
      styles: {
        ...tableTheme().styles,
        fontSize: 8,
        cellPadding: 5,
      },
      columnStyles: {
        0: { cellWidth: 90 },
        1: { cellWidth: pageWidth - 40 - 40 - 90 - 60 - 90 },
        2: { cellWidth: 60, halign: 'right' },
        3: { cellWidth: 90, halign: 'right' },
      },
      didDrawPage: () => {
        drawFooter(doc);
      },
    });

    cursorY = (doc.lastAutoTable?.finalY || cursorY) + 22;
  }

  cursorY = drawSectionTitle(doc, 'Inventory Snapshot', cursorY);

  const inventoryRows = inventoryItems.map((item) => [
    toPdfSafeText(item.sku),
    toPdfSafeText(item.name),
    toPdfSafeText(item.category),
    toPdfSafeText(item.bin_location),
    toPdfSafeText(formatPhp(Number(item.price_php || 0))),
    toPdfSafeText(String(item.quantity_on_hand ?? 0)),
    toPdfSafeText(String(item.sold_units ?? 0)),
  ]);

  autoTable(doc, {
    ...tableTheme(),
    startY: cursorY + 8,
    head: [['SKU', 'Name', 'Category', 'Bin', 'Price', 'On Hand', 'Sold']],
    body: inventoryRows,
    styles: {
      ...tableTheme().styles,
      fontSize: 7.6,
      cellPadding: 4,
    },
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
      drawFooter(doc);
    },
  });

  drawFooter(doc);

  const fileName = `motomart_dashboard_${stamp.date}.pdf`;
  doc.save(fileName);
}

export const RESET_CONFIRM_LABEL = CONFIRM_LABEL;