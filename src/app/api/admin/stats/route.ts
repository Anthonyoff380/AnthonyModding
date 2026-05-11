import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.isAdmin) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const [totalOrders, pendingOrders, completedOrders, revenueData] = await Promise.all([
      prisma.order.count(),
      prisma.order.count({ where: { status: "PENDING" } }),
      prisma.order.count({ where: { status: "COMPLETED" } }),
      prisma.order.aggregate({
        where: { status: { in: ["CONFIRMED", "IN_PROGRESS", "COMPLETED"] } },
        _sum: { price: true },
      }),
    ]);

    return NextResponse.json({
      totalOrders,
      pendingOrders,
      completedOrders,
      totalRevenue: revenueData._sum.price || 0,
    });
  } catch (error) {
    console.error("Erreur:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
