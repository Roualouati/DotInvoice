import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import WarningGif from '@/public/warning.gif';
import Image from "next/image";
import paidGif from '@/public/paid.gif';
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { SubmitButton } from "@/app/components/SubmitButtons";
import { markAsPaid } from "@/app/action";
import { redirect } from "next/navigation";
import prisma from "@/app/utils/db";
import { requireUser } from "@/app/utils/hooks";
type Params=Promise<{invoiceId:string}>
async function Authorize(invoiceId:string,userId:string) {
    const data=await prisma.invoice.findUnique({
        where:{
            id:invoiceId,
            userId:userId,
        },
    });
    if(!data){
        return redirect('/dashboard/invoices');
    }
}

export default async function MarkAsPaid({params}:{params:Params}){
    const session=await requireUser();

    const {invoiceId}=await params;
    await Authorize(invoiceId,session.user?.id as string);

    return(
        <div className="flex flex-1 justify-center items-center">
            <Card className="mx-w-[500px]">
            <CardHeader>
                <CardTitle>Mark as Paid?</CardTitle>
                <CardDescription> Are you sure you want to mark this invoice as paid? </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-1 justify-center items-center" >
                <Image src={paidGif} alt="paid Gif" className="rounded-md w-[400px]  h-[400px]"/>
            </CardContent>
           <CardFooter className="flex items-center justify-between">
           <Link href="/dashboard/invoices" className={buttonVariants(
                    {
                        variant:'outline',
                                            
                    }
                )} >Cancel</Link>
                <form action={async ()=>{
                    "use server"
                    await markAsPaid(invoiceId);
                }}>
                    <SubmitButton text="Mark as Paid!" />
                </form>
           </CardFooter>
        </Card>
        </div>
    )
}