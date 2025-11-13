import { GraphQLClient, gql } from "graphql-request";

const DEFAULT_ENDPOINT = "http://localhost/testing/graphql";
const endpoint =
  process.env.NEXT_PUBLIC_WORDPRESS_API_URL ?? DEFAULT_ENDPOINT;

const client = new GraphQLClient(endpoint);

type RawCategory = {
  name?: string | null;
  slug?: string | null;
};

type RawFeaturedImage = {
  node?: { sourceUrl?: string | null } | null;
};

type RawPostSummary = {
  id?: string | null;
  title?: string | null;
  date?: string | null;
  slug?: string | null;
  excerpt?: string | null;
  featuredImage?: RawFeaturedImage | null;
  categories?: { nodes?: RawCategory[] | null } | null;
  testPost?: string | null;
  customFields?: { testPost?: string | null } | null;
  posts?: { testPost?: string | null } | null;
};

type RawPostDetail = RawPostSummary & {
  content?: string | null;
};

export type CategorySummary = {
  name: string;
  slug: string;
};

export type PostSummary = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  date: string | null;
  testPost: string | null;
  featuredImage: RawFeaturedImage | null;
  categories: CategorySummary[];
};

export type PostDetail = PostSummary & {
  content: string;
};

type QueryVariant<TResult> = {
  query: string;
  variables?: Record<string, unknown>;
  transform: (data: any) => TResult | undefined;
};

const POST_SUMMARY_FRAGMENT = gql`
  fragment PostSummaryFields on Post {
    id
    title
    date
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
`;

const POST_DETAIL_FRAGMENT = gql`
  ${POST_SUMMARY_FRAGMENT}
  fragment PostDetailFields on Post {
    ...PostSummaryFields
    content
  }
`;

function normaliseAcfValue(node: RawPostSummary): string | null {
  return (
    node?.testPost ??
    node?.customFields?.testPost ??
    node?.posts?.testPost ??
    null
  );
}

function mapCategory(node: RawCategory): CategorySummary {
  return {
    name: node?.name ?? "",
    slug: node?.slug ?? "",
  };
}

function mapPostSummary(node: RawPostSummary): PostSummary {
  return {
    id: node?.id ?? "",
    title: node?.title ?? "",
    slug: node?.slug ?? "",
    excerpt: node?.excerpt ?? "",
    date: node?.date ?? null,
    testPost: normaliseAcfValue(node),
    featuredImage: node?.featuredImage ?? null,
    categories: Array.isArray(node?.categories?.nodes)
      ? node!.categories!.nodes!.map(mapCategory)
      : [],
  };
}

function mapPostDetail(node: RawPostDetail): PostDetail {
  const summary = mapPostSummary(node);
  return {
    ...summary,
    content: node?.content ?? "",
  };
}

async function requestWithFallbacks<TResult>(
  variants: QueryVariant<TResult>[],
  fallbackValue: TResult
): Promise<TResult> {
  for (const variant of variants) {
    try {
      const data = await client.request(variant.query, variant.variables);
      const result = variant.transform(data);
      if (result !== undefined) {
        return result;
      }
    } catch (error) {
      if (process.env.NODE_ENV !== "production") {
        console.warn("[lib/api] GraphQL variant failed", error);
      }
    }
  }

  return fallbackValue;
}

function buildSummaryVariants(
  operationName: string,
  {
    limit,
    variables = {},
    additionalVariableDefinitions = "",
    whereClause = "",
  }: {
    limit: number;
    variables?: Record<string, unknown>;
    additionalVariableDefinitions?: string;
    whereClause?: string;
  }
): QueryVariant<PostSummary[]>[] {
  const variableDefinitions = ["$first: Int!"];
  if (additionalVariableDefinitions) {
    variableDefinitions.push(additionalVariableDefinitions);
  }
  const variableSignature = variableDefinitions.join(", ");
  const postsClause = `posts(first: $first${whereClause})`;

  const selections = [
    { suffix: "DirectACF", extraSelection: "testPost" },
    { suffix: "CustomFieldsACF", extraSelection: "customFields { testPost }" },
    { suffix: "PostsGroupACF", extraSelection: "posts { testPost }" },
    { suffix: "Fallback", extraSelection: "" },
  ];

  return selections.map(({ suffix, extraSelection }) => {
    const extra =
      extraSelection && extraSelection.length > 0
        ? `\n            ${extraSelection}`
        : "";
    return {
      query: gql`
        ${POST_SUMMARY_FRAGMENT}
        query ${operationName}_${suffix}(${variableSignature}) {
          ${postsClause} {
            nodes {
              ...PostSummaryFields${extra}
            }
          }
        }
      `,
      variables: { first: limit, ...variables },
      transform: (data: any) => {
        const nodes = data?.posts?.nodes;
        return Array.isArray(nodes)
          ? nodes.map(mapPostSummary)
          : ([] as PostSummary[]);
      },
    };
  });
}

function buildDetailVariants(slug: string): QueryVariant<PostDetail | null>[] {
  const selections = [
    { suffix: "DirectACF", extraSelection: "testPost" },
    { suffix: "CustomFieldsACF", extraSelection: "customFields { testPost }" },
    { suffix: "PostsGroupACF", extraSelection: "posts { testPost }" },
    { suffix: "Fallback", extraSelection: "" },
  ];

  return selections.map(({ suffix, extraSelection }) => {
    const extra =
      extraSelection && extraSelection.length > 0
        ? `\n        ${extraSelection}`
        : "";

    return {
      query: gql`
        ${POST_DETAIL_FRAGMENT}
        query SinglePost_${suffix}($slug: ID!) {
          post(id: $slug, idType: SLUG) {
            ...PostDetailFields${extra}
          }
        }
      `,
      variables: { slug },
      transform: (data: any) => {
        const node = data?.post;
        return node ? mapPostDetail(node) : null;
      },
    };
  });
}

export async function fetchAllPosts(limit = 50): Promise<PostSummary[]> {
  const variants = buildSummaryVariants("AllPosts", { limit });
  return requestWithFallbacks<PostSummary[]>(variants, []);
}

export async function fetchAllCategories(): Promise<CategorySummary[]> {
  const query = gql`
    query AllCategories {
      categories {
        nodes {
          name
          slug
        }
      }
    }
  `;

  const data = await client.request(query);
  const nodes = data?.categories?.nodes;
  return Array.isArray(nodes) ? nodes.map(mapCategory) : [];
}

export async function fetchPostsByCategory(
  slug: string,
  limit = 50
): Promise<PostSummary[]> {
  if (!slug) {
    return [];
  }

  const variants = buildSummaryVariants("PostsByCategory", {
    limit,
    variables: { category: slug },
    additionalVariableDefinitions: "$category: String!",
    whereClause: ", where: { categoryName: $category }",
  });

  return requestWithFallbacks<PostSummary[]>(variants, []);
}

export async function fetchPostBySlug(slug: string): Promise<PostDetail | null> {
  if (!slug) {
    return null;
  }

  const variants = buildDetailVariants(slug);
  return requestWithFallbacks<PostDetail | null>(variants, null);
}

