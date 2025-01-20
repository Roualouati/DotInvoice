import prisma from "@/app/utils/db";
import { NextResponse } from "next/server";
import jsPDF from "jspdf";
import { formatCurrency } from "@/app/utils/formatCurrency";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ invoiceId: string }> }
) {
  const { invoiceId } = await params;
  const data = await prisma.invoice.findUnique({
    where: {
      id: invoiceId,
    },
    select: {
      invoiceName: true,
      invoiceNumber: true,
      currency: true,
      fromName: true,
      fromAddress: true,
      fromEmail: true,
      clientName: true,
      clientAddress: true,
      clientEmail: true,
      date: true,
      dueDate: true,
      invoiceItemDescription: true,
      invoiceItemQuantity: true,
      invoiceItemRate: true,
      total: true,
      note: true,
    },
  });

  if (!data) {
    return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
  }

  const pdf = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  // Add Branding or Logo
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(24);
  pdf.text("Invoice", 20, 15); // Placeholder for logo
  pdf.setFontSize(12);

  // Invoice Information
  pdf.setFontSize(10);
  pdf.text(`Invoice Number: #${data.invoiceNumber}`, 150, 20);
  pdf.text(
    `Date: ${new Intl.DateTimeFormat("en-US", { dateStyle: "long" }).format(
      data.date
    )}`,
    150,
    25
  );
  pdf.text(`Due Date: ${data.dueDate}`, 150, 30);

 // From Section with Grey Background
pdf.setFillColor(240, 240, 240); // Light grey color
pdf.rect(20, 40, 170, 25, "F"); // Draw rectangle for "From" section (x, y, width, height)
pdf.setFont("helvetica", "bold");
pdf.setTextColor(0, 0, 0); // Black text color
pdf.text("From:", 25, 50);
pdf.setFont("helvetica", "normal");
pdf.text([data.fromName, data.fromEmail, data.fromAddress], 25, 55);

// Bill To Section with Grey Background
pdf.setFillColor(240, 240, 240); // Light grey color

pdf.rect(20, 70, 170, 25, "F"); // Draw rectangle for "Bill To" section
pdf.setFont("helvetica", "bold");
pdf.text("Bill To:", 25, 75);
pdf.setFont("helvetica", "normal");
pdf.text([data.clientName, data.clientEmail, data.clientAddress], 25, 80);


// Optional: Draw a thin line for separation
pdf.setDrawColor(200, 200, 200); // Light grey line
pdf.line(20, 70, 190, 70); // Line below "From"


  // Table Header
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(10);
  pdf.text("Description", 20, 110);
  pdf.text("Quantity", 100, 110);
  pdf.text("Rate", 130, 110);
  pdf.text("Total", 160, 110);
  pdf.line(20, 112, 190, 112);

  // Table Content
  pdf.setFont("helvetica", "normal");
  pdf.text(data.invoiceItemDescription || "", 20, 120);
  pdf.text(data.invoiceItemQuantity.toString(), 100, 120);
  pdf.text(
    formatCurrency({
      amount: data.invoiceItemRate,
      currency: data.currency as any,
    }),
    130,
    120
  );
  pdf.text(
    formatCurrency({
      amount: data.total,
      currency: data.currency as any,
    }),
    160,
    120
  );

  // Total Section
  pdf.line(20, 140, 190, 140);
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(12);
  pdf.text(`Total (${data.currency})`, 130, 150);
  pdf.text(
    formatCurrency({
      amount: data.total,
      currency: data.currency as any,
    }),
    160,
    150
  );

  // Notes Section
  if (data.note) {
    pdf.setFont("helvetica", "italic");
    pdf.setFontSize(10);
    pdf.text("Note:", 20, 170);
    pdf.text(data.note, 20, 175);
  }

  // Footer
  pdf.setDrawColor(0, 0, 0);
  pdf.line(20, 270, 190, 270);
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(10);
  pdf.text("Thank you for your business!", 20, 280);

  // Generate PDF as buffer
  const pdfBuffer = Buffer.from(pdf.output("arraybuffer"));

  return new NextResponse(pdfBuffer, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": "inline", // display it inline
    },
  });
}
