import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

interface Params {
  params: Promise<{ id: string }>;
}

// GET - Récupérer une commande
export async function GET(request: Request, { params }: Params) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.isAdmin) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const { id } = await params;
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        product: { select: { id: true, name: true, category: true, images: true } },
      },
    });

    if (!order) {
      return NextResponse.json({ error: "Commande non trouvée" }, { status: 404 });
    }

    return NextResponse.json(order);
  } catch (error) {
    console.error("Erreur:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

// PATCH - Mettre à jour une commande
export async function PATCH(request: Request, { params }: Params) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.isAdmin) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const { id } = await params;
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

    const updateData: Record<string, unknown> = {};
    
    if (buyerName !== undefined) updateData.buyerName = buyerName;
    if (buyerEmail !== undefined) updateData.buyerEmail = buyerEmail;
    if (buyerDiscord !== undefined) updateData.buyerDiscord = buyerDiscord;
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (price !== undefined) updateData.price = parseFloat(price);
    if (orderType !== undefined) updateData.orderType = orderType;
    if (developers !== undefined) updateData.developers = developers;
    if (status !== undefined) updateData.status = status;
    if (purchaseDate !== undefined) updateData.purchaseDate = new Date(purchaseDate);
    if (productId !== undefined) updateData.productId = productId || null;

    const order = await prisma.order.update({
      where: { id },
      data: updateData,
      include: {
        product: { select: { id: true, name: true, category: true } },
      },
    });

    return NextResponse.json(order);
  } catch (error) {
    console.error("Erreur:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

// DELETE - Supprimer une commande
export async function DELETE(request: Request, { params }: Params) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.isAdmin) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const { id } = await params;
    await prisma.order.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erreur:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
