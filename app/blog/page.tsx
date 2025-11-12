import { fetchAllPosts, fetchAllCategories } from "@/lib/api";
import BlogClient from "./BlogClient";

export const revalidate = 60; // ✅ allowed here (server)

export default async function BlogPage() {
  const posts = await fetchAllPosts();
  const categories = await fetchAllCategories();

  // Pass initial data to client component
  return <BlogClient initialPosts={posts} initialCategories={categories} />;
}
