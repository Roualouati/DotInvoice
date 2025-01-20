import prisma from "@/app/utils/db";
import { requireUser } from "@/app/utils/hooks";
import { emailClient } from "@/app/utils/mailtrap";
import { NextResponse } from "next/server";

export async function POST(
  request: Request,
  {
    params,
  }: {
    params: Promise<{ invoiceId: string }>;
  }
) {
  try {
    const session = await requireUser();

    const { invoiceId } = await params;

    const invoiceData = await prisma.invoice.findUnique({
      where: {
        id: invoiceId,
        userId: session.user?.id,
      },
    });

    if (!invoiceData) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
    }

    const sender = {
        email: "hello@demomailtrap.com",
        name: "Roua Louati",
      };
      emailClient.send({
        from:sender,
        to:[{email:"louatii.roua@gmail.com"}],
        template_uuid: "719a03c8-a10e-43b7-a78c-e1eb24d4f281",
    template_variables: {
      "first_name":invoiceData.clientName,
      "company_info_name": "Dot Invoice",
      "company_info_address": "Tunis 458",
      "company_info_city": "Tunis",
      "company_info_zip_code": "110603",
      "company_info_country": "Tunisia"
    }
      });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to send Email reminder" },
      { status: 500 }
    );
  }
}