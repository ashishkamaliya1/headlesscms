import { NextResponse } from "next/server";
import { fetchAllCategories } from "@/lib/api";

export async function GET() {
  const categories = await fetchAllCategories();
  return NextResponse.json(categories);
}
