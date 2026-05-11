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
    const partners = await prisma.partner.findMany({ orderBy: { order: "asc" } });
    return NextResponse.json(partners);
  } catch (error) {
    console.error("Erreur:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.isAdmin) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const body = await request.json();
    const { name, logo, website, description, order, isActive } = body;

    if (!name || !logo) {
      return NextResponse.json({ error: "Nom et logo requis" }, { status: 400 });
    }

    const partner = await prisma.partner.create({
      data: {
        name,
        logo,
        website: website || null,
        description: description || null,
        order: order || 0,
        isActive: isActive ?? true,
      },
    });

    return NextResponse.json(partner, { status: 201 });
  } catch (error) {
    console.error("Erreur:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
