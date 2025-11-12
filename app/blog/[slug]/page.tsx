import { notFound } from "next/navigation";
import { fetchAllPosts, fetchPostBySlug } from "@/lib/api";
import CleanHTML from "@/components/CleanHTML";

export const revalidate = 60;

// Pre-generate all slugs for static paths
export async function generateStaticParams() {
  const posts = await fetchAllPosts();
  return posts.map((post: any) => ({
    slug: post.slug,
  }));
}

export default async function SinglePostPage({ params }: { params: Promise<{ slug: string }> }) {
  // ✅ Await params (Next.js 16 requirement)
  const { slug } = await params;

  if (!slug) return notFound();

  const post = await fetchPostBySlug(slug);
  if (!post) return notFound();

  return (
    <article className="max-w-3xl mx-auto p-6">
      <h1
        className="text-4xl font-bold mb-4"
        dangerouslySetInnerHTML={{ __html: post.title }}
      />
      {post.featuredImage?.node?.sourceUrl && (
        <img
          src={post.featuredImage.node.sourceUrl}
          alt={post.title}
          className="mb-6 rounded-lg"
        />
      )}
      <CleanHTML html={post.content} />
    </article>
  );
}
