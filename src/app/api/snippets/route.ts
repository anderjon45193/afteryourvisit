import { NextResponse } from "next/server";
import { getAuthenticatedBusiness } from "@/lib/api-utils";
import { mockDb } from "@/lib/mock-data";

// GET /api/snippets — List snippets
export async function GET() {
  const { error, business } = await getAuthenticatedBusiness();
  if (error) return error;

  const snippets = mockDb.getSnippets(business.id);
  return NextResponse.json(snippets);
}

// POST /api/snippets — Create snippet
export async function POST(request: Request) {
  const { error, business } = await getAuthenticatedBusiness();
  if (error) return error;

  const { label, text, category } = await request.json();

  if (!label) {
    return NextResponse.json({ error: "label is required" }, { status: 400 });
  }

  const snippet = {
    id: `snp-${mockDb.generateId()}`,
    label,
    text: text || label,
    category: category || "general",
    businessId: business.id,
    createdAt: new Date().toISOString(),
  };

  mockDb.snippets.push(snippet);
  return NextResponse.json(snippet, { status: 201 });
}
