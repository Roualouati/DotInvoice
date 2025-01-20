import prisma from "@/app/utils/db"
import { requireUser } from "@/app/utils/hooks";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { redirect } from "next/navigation";
import WarningGif from '@/public/warning.gif';
import Image from "next/image";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { SubmitButton } from "@/app/components/SubmitButtons";
import { DeleteInvoice } from "@/app/action";
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

type Params=Promise<{invoiceId:string}>;
export default async function deleteInvoiceRoute({
    params,
}:{params :Params,}
){
    const session=await requireUser();
    const {invoiceId}=await params;
    await Authorize(invoiceId,session.user?.id as string);
    
    return(
    <div className="flex flex-1 justify-center items-center">
        <Card className="mx-w-[500px]">
            <CardHeader>
                <CardTitle>Delete Invoice</CardTitle>
                <CardDescription> Are you sure you want delete this invoice? </CardDescription>
            </CardHeader>
            <CardContent>
                <Image src={WarningGif} alt="Warning Gif" className="rounded-md w-[350px] "/>
            </CardContent>
            <CardFooter className="flex items-center justify-between">
                <Link href="/dashboard/invoices" className={buttonVariants(
                    {
                        variant:'secondary',
                                            
                    }
                )} >Cancel</Link>
                <form action={async ()=>{
                    "use server"
                    await DeleteInvoice(invoiceId);
                }}>
                    <SubmitButton text="Delete Invoice" variant='destructive'/>
                </form>
            </CardFooter>
        </Card>
    </div>
    )
}