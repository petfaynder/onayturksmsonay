import prisma from "@/lib/db";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import DeveloperClient from "@/components/DeveloperClient";

export const dynamic = "force-dynamic";

export default async function DeveloperPage() {
  const session = await auth();
  
  if (!session?.user?.email) {
    redirect("/auth/login");
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: {
      id: true,
      email: true,
      apiToken: true,
      webhookUrl: true
    }
  });

  if (!user) {
    redirect("/auth/login");
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <DeveloperClient 
        initialApiToken={user.apiToken || ""}
        initialWebhookUrl={user.webhookUrl || ""}
      />
    </div>
  );
}
