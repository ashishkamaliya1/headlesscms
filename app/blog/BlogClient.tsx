"use client";

import { useState } from "react";
import CategoryFilter from "@/components/CategoryFilter";
import Link from "next/link";

export default function BlogClient({ initialPosts, initialCategories }: any) {
  const [posts, setPosts] = useState(initialPosts);

  async function handleFilter(slug: string) {
    const url =
      slug === "all"
        ? "/api/posts"
        : `/api/posts?category=${encodeURIComponent(slug)}`;
    const data = await fetch(url).then((r) => r.json());
    setPosts(data);
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Blog</h1>

      <CategoryFilter categories={initialCategories} onChange={handleFilter} />

      <div className="space-y-6">
  {posts.map((post: any) => (
    <div key={post.id} className="border-b pb-4">
      {/* ✅ Title linked to single page */}
      <Link href={`/blog/${post.slug}`}>
        <h2
          className="text-xl font-semibold hover:text-blue-600 transition"
          dangerouslySetInnerHTML={{ __html: post.title }}
        />
      </Link>

      {/* ✅ Optional image also clickable */}
      {post.featuredImage?.node?.sourceUrl && (
        <Link href={`/blog/${post.slug}`}>
          <img
            src={post.featuredImage.node.sourceUrl}
            alt={post.title}
            className="mt-2 rounded-lg hover:opacity-90 transition"
          />
        </Link>
      )}

      <div dangerouslySetInnerHTML={{ __html: post.excerpt }} />

      {/* ✅ Add a small “Read More” link/button */}
      <Link
        href={`/blog/${post.slug}`}
        className="inline-block mt-3 text-blue-600 hover:underline"
      >
        Read More →
      </Link>
    </div>
  ))}
</div>
    </div>
  );
}
