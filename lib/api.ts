import { GraphQLClient, gql } from "graphql-request";

const endpoint = process.env.NEXT_PUBLIC_WORDPRESS_API_URL!;
const client = new GraphQLClient(endpoint);

// ✅ Get all posts
export async function fetchAllPosts() {
  const query = gql`
    {
      posts(first: 50) {
        nodes {
          id
          title
          slug
          excerpt
          featuredImage {
            node {
              sourceUrl
            }
          }
          categories {
            nodes {
              name
              slug
            }
          }
        }
      }
    }
  `;
  const data = await client.request(query);
  return data.posts.nodes;
}

// ✅ Get all categories
export async function fetchAllCategories() {
  const query = gql`
    {
      categories {
        nodes {
          id
          name
          slug
        }
      }
    }
  `;
  const data = await client.request(query);
  return data.categories.nodes;
}

// ✅ Get posts by category
export async function fetchPostsByCategory(slug: string) {
  const query = gql`
    {
      posts(where: { categoryName: "${slug}" }) {
        nodes {
          id
          title
          slug
          excerpt
          featuredImage {
            node {
              sourceUrl
            }
          }
          categories {
            nodes {
              name
              slug
            }
          }
        }
      }
    }
  `;
  const data = await client.request(query);
  return data.posts.nodes;
}

// ✅ (Re-added) Get single post by slug
export async function fetchPostBySlug(slug: string) {
  if (!slug) throw new Error("Slug is required in fetchPostBySlug()");

  const query = gql`
    {
      post(id: "${slug}", idType: SLUG) {
        id
        title
        slug
        content
        featuredImage {
          node {
            sourceUrl
          }
        }
      }
    }
  `;
  const data = await client.request(query);
  return data.post;
}
