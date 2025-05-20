import { Invoice } from "../models/Invoice.js";

export async function generateInvoiceNumber() {
  const now = new Date();

  const monthNames = [
    "JAN",
    "FEB",
    "MAR",
    "APR",
    "MAY",
    "JUN",
    "JUL",
    "AUG",
    "SEP",
    "OCT",
    "NOV",
    "DEC",
  ];
  const month = monthNames[now.getMonth()];
  const day = now.getDate().toString().padStart(2, "0");
  const yearShort = now.getFullYear().toString().slice(-2);

  const prefix = `PRO-${month}${day}${yearShort}`;
  // Example: PRO-APR2825

  // Find last invoice for today
  const lastInvoice = await Invoice.findOne({
    invoiceNumber: { $regex: `^${prefix}` },
  }).sort({ createdAt: -1 });

  let newNumber = 1;
  if (lastInvoice) {
    const parts = lastInvoice.invoiceNumber.split("-");
    const lastSeq = parseInt(parts[2], 10);
    newNumber = lastSeq + 1;
  }

  const invoiceNumber = `${prefix}-${newNumber}`;
  return invoiceNumber;
}
