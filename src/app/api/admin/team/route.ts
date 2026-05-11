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
    const members = await prisma.teamMember.findMany({ orderBy: { order: "asc" } });
    return NextResponse.json(members);
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
    const { name, role, discordId, avatar, description, skills, order, isActive } = body;

    if (!name || !role) {
      return NextResponse.json({ error: "Nom et rôle requis" }, { status: 400 });
    }

    const member = await prisma.teamMember.create({
      data: {
        name,
        role,
        discordId: discordId || null,
        avatar: avatar || null,
        description: description || null,
        skills: skills || [],
        order: order || 0,
        isActive: isActive ?? true,
      },
    });

    return NextResponse.json(member, { status: 201 });
  } catch (error) {
    console.error("Erreur:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
