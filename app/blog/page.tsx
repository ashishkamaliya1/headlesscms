import { fetchAllPosts, fetchAllCategories } from "@/lib/api";
import BlogClient from "./BlogClient";

export const revalidate = 60; // ✅ allowed here (server)

export default async function BlogPage() {
  const [posts, categories] = await Promise.all([
    fetchAllPosts(),
    fetchAllCategories(),
  ]);

  return <BlogClient initialPosts={posts} initialCategories={categories} />;
}
