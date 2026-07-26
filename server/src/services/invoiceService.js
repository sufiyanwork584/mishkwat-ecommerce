import PDFDocument from 'pdfkit';
import { formatPrice } from '../utils/helpers.js';

/**
 * Mishkwat Invoice Generator
 * Generates a professionally formatted PDF invoice for orders.
 */

// ── Brand Colors ──
const COLORS = {
  primary: '#1B6B4A',      // Deep Islamic green
  primaryLight: '#2D9B6E', // Lighter green for accents
  gold: '#C8A951',         // Elegant gold accent
  dark: '#1A1A2E',         // Near-black for headings
  text: '#333333',         // Body text
  muted: '#777777',        // Secondary text
  light: '#F5F5F5',        // Light background fills
  border: '#E0E0E0',       // Table borders
  white: '#FFFFFF',
};

// ── Helper: Draw a filled rectangle ──
const drawRect = (doc, x, y, w, h, color) => {
  doc.save().rect(x, y, w, h).fill(color).restore();
};

// ── Helper: Draw a horizontal line ──
const drawLine = (doc, x1, y, x2, color = COLORS.border, width = 0.5) => {
  doc.save().moveTo(x1, y).lineTo(x2, y).lineWidth(width).strokeColor(color).stroke().restore();
};

/**
 * Generate a premium PDF invoice and return as Buffer.
 */
export const generateInvoice = (order) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: 'A4',
        margins: { top: 40, bottom: 40, left: 50, right: 50 },
        bufferPages: true,
      });

      const buffers = [];
      doc.on('data', (chunk) => buffers.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(buffers)));

      const pageWidth = doc.page.width;
      const contentWidth = pageWidth - 100; // 50px margin each side
      const rightEdge = pageWidth - 50;

      // ================================================================
      //  HEADER BANNER
      // ================================================================
      drawRect(doc, 0, 0, pageWidth, 100, COLORS.primary);

      // Brand name
      doc.font('Helvetica-Bold').fontSize(30).fillColor(COLORS.white)
        .text('MISHKWAT', 50, 25);

      // Tagline
      doc.font('Helvetica').fontSize(9).fillColor('#A8D5BA')
        .text('Premium Islamic E-Commerce', 50, 60);

      // Invoice label on the right
      doc.font('Helvetica-Bold').fontSize(22).fillColor(COLORS.gold)
        .text('INVOICE', rightEdge - 150, 28, { width: 150, align: 'right' });

      // ================================================================
      //  INVOICE META (below banner)
      // ================================================================
      let y = 115;

      // Left column: Invoice details
      doc.font('Helvetica-Bold').fontSize(9).fillColor(COLORS.muted).text('INVOICE NO.', 50, y);
      doc.font('Helvetica-Bold').fontSize(11).fillColor(COLORS.dark).text(`#${order.orderNumber}`, 50, y + 13);

      doc.font('Helvetica-Bold').fontSize(9).fillColor(COLORS.muted).text('DATE', 200, y);
      doc.font('Helvetica').fontSize(11).fillColor(COLORS.dark)
        .text(new Date(order.createdAt).toLocaleDateString('en-IN', {
          day: '2-digit', month: 'short', year: 'numeric',
        }), 200, y + 13);

      doc.font('Helvetica-Bold').fontSize(9).fillColor(COLORS.muted).text('PAYMENT', 340, y);
      doc.font('Helvetica').fontSize(11).fillColor(COLORS.dark)
        .text(order.paymentMethod.toUpperCase(), 340, y + 13);

      doc.font('Helvetica-Bold').fontSize(9).fillColor(COLORS.muted).text('STATUS', rightEdge - 100, y, { width: 100, align: 'right' });

      // Payment status badge
      const statusText = order.paymentStatus.toUpperCase();
      const isPaid = order.paymentStatus.toLowerCase() === 'paid';
      const badgeColor = isPaid ? COLORS.primaryLight : '#E74C3C';
      const statusWidth = doc.widthOfString(statusText, { font: 'Helvetica-Bold', fontSize: 9 }) + 16;
      const badgeX = rightEdge - statusWidth;
      drawRect(doc, badgeX, y + 11, statusWidth, 18, badgeColor);
      doc.font('Helvetica-Bold').fontSize(9).fillColor(COLORS.white)
        .text(statusText, badgeX, y + 15, { width: statusWidth, align: 'center' });

      // ================================================================
      //  SEPARATOR
      // ================================================================
      y = 160;
      drawLine(doc, 50, y, rightEdge, COLORS.border, 1);

      // ================================================================
      //  BILLING & SHIPPING ADDRESSES
      // ================================================================
      y = 175;

      // FROM (Mishkwat)
      drawRect(doc, 50, y, contentWidth / 2 - 10, 100, COLORS.light);
      doc.font('Helvetica-Bold').fontSize(9).fillColor(COLORS.primary).text('FROM', 62, y + 10);
      doc.font('Helvetica-Bold').fontSize(10).fillColor(COLORS.dark).text('Mishkwat', 62, y + 25);
      doc.font('Helvetica').fontSize(9).fillColor(COLORS.text)
        .text('Premium Islamic Store', 62, y + 40)
        .text('Mumbai, Maharashtra', 62, y + 53)
        .text('India', 62, y + 66)
        .text('support@mishkwat.com', 62, y + 79);

      // TO (Customer)
      const rightColX = 50 + contentWidth / 2 + 10;
      drawRect(doc, rightColX, y, contentWidth / 2 - 10, 100, COLORS.light);
      doc.font('Helvetica-Bold').fontSize(9).fillColor(COLORS.primary).text('SHIP TO', rightColX + 12, y + 10);
      doc.font('Helvetica-Bold').fontSize(10).fillColor(COLORS.dark).text(order.shippingAddress.fullName, rightColX + 12, y + 25);
      doc.font('Helvetica').fontSize(9).fillColor(COLORS.text)
        .text(order.shippingAddress.street, rightColX + 12, y + 40)
        .text(`${order.shippingAddress.city}, ${order.shippingAddress.state} ${order.shippingAddress.zipCode}`, rightColX + 12, y + 53)
        .text(order.shippingAddress.country || 'India', rightColX + 12, y + 66)
        .text(`Phone: ${order.shippingAddress.phone}`, rightColX + 12, y + 79);

      // ================================================================
      //  ITEMS TABLE
      // ================================================================
      y = 295;

      // Table header background
      drawRect(doc, 50, y, contentWidth, 25, COLORS.primary);

      // Table header text
      doc.font('Helvetica-Bold').fontSize(9).fillColor(COLORS.white);
      doc.text('#', 60, y + 7, { width: 25 });
      doc.text('PRODUCT', 85, y + 7, { width: 250 });
      doc.text('QTY', 340, y + 7, { width: 45, align: 'center' });
      doc.text('PRICE', 390, y + 7, { width: 70, align: 'right' });
      doc.text('TOTAL', rightEdge - 80, y + 7, { width: 80, align: 'right' });

      y += 25;

      // Table rows
      doc.font('Helvetica').fontSize(9).fillColor(COLORS.text);
      order.items.forEach((item, i) => {
        // Alternating row background
        if (i % 2 === 0) {
          drawRect(doc, 50, y, contentWidth, 24, COLORS.light);
        }

        const rowY = y + 7;
        doc.fillColor(COLORS.muted).text(`${i + 1}`, 60, rowY, { width: 25 });
        doc.fillColor(COLORS.dark).font('Helvetica').text(item.title.substring(0, 45), 85, rowY, { width: 250 });
        doc.fillColor(COLORS.text).text(`${item.quantity}`, 340, rowY, { width: 45, align: 'center' });
        doc.text(formatPrice(item.price), 390, rowY, { width: 70, align: 'right' });
        doc.font('Helvetica-Bold').text(formatPrice(item.price * item.quantity), rightEdge - 80, rowY, { width: 80, align: 'right' });
        doc.font('Helvetica');

        y += 24;
      });

      // Bottom border of table
      drawLine(doc, 50, y, rightEdge, COLORS.border, 1);

      // ================================================================
      //  TOTALS SECTION
      // ================================================================
      y += 15;
      const totalsX = 360;
      const totalsValueX = rightEdge - 90;
      const totalsWidth = 90;

      // Subtotal
      doc.font('Helvetica').fontSize(10).fillColor(COLORS.text);
      doc.text('Subtotal', totalsX, y);
      doc.text(formatPrice(order.subtotal), totalsValueX, y, { width: totalsWidth, align: 'right' });
      y += 20;

      // Tax
      doc.text('Tax (GST)', totalsX, y);
      doc.text(formatPrice(order.tax), totalsValueX, y, { width: totalsWidth, align: 'right' });
      y += 20;

      // Shipping
      doc.text('Shipping', totalsX, y);
      const shippingText = order.shippingCost === 0 ? 'FREE' : formatPrice(order.shippingCost);
      if (order.shippingCost === 0) {
        doc.fillColor(COLORS.primaryLight);
      }
      doc.text(shippingText, totalsValueX, y, { width: totalsWidth, align: 'right' });
      doc.fillColor(COLORS.text);
      y += 20;

      // Discount (if applicable)
      if (order.discount > 0) {
        doc.fillColor('#E74C3C');
        doc.text('Discount', totalsX, y);
        doc.text(`-${formatPrice(order.discount)}`, totalsValueX, y, { width: totalsWidth, align: 'right' });
        doc.fillColor(COLORS.text);
        y += 20;
      }

      // Coupon code (if applicable)
      if (order.couponCode) {
        doc.font('Helvetica').fontSize(8).fillColor(COLORS.muted);
        doc.text(`Coupon: ${order.couponCode}`, totalsX, y);
        y += 16;
      }

      // Grand total
      drawLine(doc, totalsX, y, rightEdge, COLORS.primary, 1.5);
      y += 8;
      drawRect(doc, totalsX - 10, y - 2, rightEdge - totalsX + 10, 28, COLORS.primary);
      doc.font('Helvetica-Bold').fontSize(13).fillColor(COLORS.white);
      doc.text('TOTAL', totalsX, y + 4);
      doc.text(formatPrice(order.totalAmount), totalsValueX - 10, y + 4, { width: totalsWidth + 10, align: 'right' });

      // ================================================================
      //  FOOTER
      // ================================================================
      const footerY = doc.page.height - 80;

      drawLine(doc, 50, footerY, rightEdge, COLORS.border, 0.5);

      // Thank you message
      doc.font('Helvetica-Bold').fontSize(10).fillColor(COLORS.primary)
        .text('Thank you for shopping with Mishkwat!', 50, footerY + 12, { align: 'center', width: contentWidth });

      // Legal note
      doc.font('Helvetica').fontSize(7).fillColor(COLORS.muted)
        .text('This is a computer-generated invoice and does not require a signature.', 50, footerY + 30, { align: 'center', width: contentWidth })
        .text('Mishkwat — Premium Islamic E-Commerce | www.mishkwat.com | support@mishkwat.com', 50, footerY + 42, { align: 'center', width: contentWidth });

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
};
