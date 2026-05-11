import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// GET - Récupérer toutes les commandes
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.isAdmin) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const orders = await prisma.order.findMany({
      include: {
        product: {
          select: { id: true, name: true, category: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(orders);
  } catch (error) {
    console.error("Erreur:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

// POST - Créer une commande
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.isAdmin) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const body = await request.json();
    const {
      buyerName,
      buyerEmail,
      buyerDiscord,
      title,
      description,
      price,
      orderType,
      developers,
      status,
      purchaseDate,
      productId,
    } = body;

    if (!buyerName || !title) {
      return NextResponse.json({ error: "Nom acheteur et titre requis" }, { status: 400 });
    }

    const order = await prisma.order.create({
      data: {
        buyerName,
        buyerEmail: buyerEmail || null,
        buyerDiscord: buyerDiscord || null,
        title,
        description: description || null,
        price: parseFloat(price) || 0,
        orderType: orderType || "PRIVATE",
        developers: developers || [],
        status: status || "PENDING",
        purchaseDate: purchaseDate ? new Date(purchaseDate) : new Date(),
        productId: productId || null,
      },
      include: {
        product: {
          select: { id: true, name: true, category: true },
        },
      },
    });

    return NextResponse.json(order, { status: 201 });
  } catch (error) {
    console.error("Erreur:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
