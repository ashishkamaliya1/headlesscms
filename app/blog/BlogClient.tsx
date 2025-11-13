"use client";

import { useState } from "react";
import Link from "next/link";
import CategoryFilter from "@/components/CategoryFilter";
import type { CategorySummary, PostSummary } from "@/lib/api";

interface BlogClientProps {
  initialPosts: PostSummary[];
  initialCategories: CategorySummary[];
}

export default function BlogClient({
  initialPosts,
  initialCategories,
}: BlogClientProps) {
  const [posts, setPosts] = useState<PostSummary[]>(initialPosts);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFilter(slug: string) {
    try {
      setIsLoading(true);
      setError(null);

      const endpoint =
        slug === "all"
          ? "/api/posts"
          : `/api/posts?category=${encodeURIComponent(slug)}`;

      const response = await fetch(endpoint, { cache: "no-store" });
      if (!response.ok) {
        throw new Error(`Failed to fetch posts for "${slug}"`);
      }

      const data = (await response.json()) as PostSummary[];
      setPosts(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to filter posts", err);
      setError("Unable to load posts. Please try again.");
      setPosts([]);
    } finally {
      setIsLoading(false);
    }
  }

  const hasPosts = posts.length > 0;

  return (
    <div className="mx-auto max-w-4xl space-y-6 p-6">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold">Blog</h1>
        <p className="text-sm text-gray-500">
          Browse the latest content coming directly from WordPress via WPGraphQL.
        </p>
      </header>

      <CategoryFilter categories={initialCategories} onChange={handleFilter} />

      {error && <p className="text-sm text-red-500">{error}</p>}
      {isLoading && <p className="text-sm text-gray-500">Loading posts…</p>}

      {!isLoading && !hasPosts && !error && (
        <p className="text-sm text-gray-500">No posts available for this filter.</p>
      )}

      <div className="space-y-6">
        {posts.map((post) => {
          const href = `/blog/${post.slug}`;

          return (
            <article key={post.id} className="border-b pb-4">
              <Link href={href}>
                <h2
                  className="text-xl font-semibold transition hover:text-blue-600"
                  dangerouslySetInnerHTML={{ __html: post.title }}
                />
              </Link>

              {post.date && (
                <p className="mt-1 text-sm text-gray-500">
                  {new Date(post.date).toLocaleDateString()}
                </p>
              )}

              {typeof post.testPost === "string" && post.testPost.length > 0 && (
                <p className="mt-2 text-sm text-gray-700">
                  Extra Info: {post.testPost}
                </p>
              )}

              {post.featuredImage?.node?.sourceUrl && (
                <Link href={href}>
                  <img
                    src={post.featuredImage.node.sourceUrl}
                    alt={post.title}
                    className="mt-3 rounded-lg transition hover:opacity-90"
                  />
                </Link>
              )}

              <div
                className="mt-3 text-gray-700"
                dangerouslySetInnerHTML={{ __html: post.excerpt }}
              />

              <Link
                href={href}
                className="mt-4 inline-block text-blue-600 hover:underline"
              >
                Read More →
              </Link>
            </article>
          );
        })}
      </div>
    </div>
  );
}

