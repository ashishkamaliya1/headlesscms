import { NextResponse } from "next/server";
import { fetchAllPosts, fetchPostsByCategory } from "@/lib/api";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const category = searchParams.get("category");
  const posts = category
    ? await fetchPostsByCategory(category)
    : await fetchAllPosts();
  return NextResponse.json(posts);
}
