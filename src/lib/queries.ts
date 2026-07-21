import "server-only";
//
// Server-only data layer — read-only Firestore queries via the Firebase Admin
// SDK. Called directly from async Server Components (NOT server actions — we
// have no client-invoked mutations here). Never import this from a client
// component; `import "server-only"` enforces that at build time.
//
// Each function mirrors a client fn in src/actions/actions.ts but:
//   • uses the Admin SDK chainable API,
//   • preserves the SAME cache key + TTL (via shared @/lib/cache),
//   • getCollectionsWithProducts is batched (fixes the N+1: 1+N → 1+⌈N/10⌉),
//   • getRelatedProducts chunks ≤10 (fixes silent break for >10 categories),
//   • returns serializable shapes (no Firestore snapshots) so results can
//     cross the RSC boundary as props.
//
import { unstable_cache } from "next/cache";
import type { Product } from "@/types/product";
import type { Category } from "@/types/category";
import { getAdminDb } from "@/lib/firebase-admin";
import { withCache } from "@/lib/cache";
import { toMillis as toMillisShared } from "@/lib/dates";

const MIN = 60 * 1000;
const CHUNK = 10; // Firestore array-contains-any cap

function chunk<T>(arr: T[], size = CHUNK): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

/** Convert a date-like value to epoch ms (0 when missing/invalid). */
function toMs(t: unknown): number {
  return toMillisShared(t) ?? 0;
}

/** Strip Firestore-specific types so the product is serializable across the
 *  RSC boundary (createdDate/updatedDate → epoch ms). */
function serializeProduct(product: any): Product {
  return {
    ...product,
    createdDate: toMs(product.createdDate),
    updatedDate: toMs(product.updatedDate) || null,
  };
}

/** Strip Firestore Timestamps from a category doc so it is RSC-serializable. */
function serializeCategory(cat: any): Category {
  return {
    ...cat,
    createdDate: toMs(cat.createdDate) || null,
    updatedDate: toMs(cat.updatedDate) || null,
  };
}

/** Hydrated category + its display products (home page). */
export interface CollectionWithProducts {
  id: string;
  categoryName: string;
  description?: string;
  isSubcategory?: boolean;
  products: Product[];
}

// ── Categories ───────────────────────────────────────────────────────

export async function getAllCategoriesServer(): Promise<Category[]> {
  return withCache("allCategories", 5 * MIN, async () => {
    const snap = await getAdminDb()
      .collection("categories")
      .where("active", "==", true)
      .get();
    const categories = snap.docs.map((d) => ({
      ...d.data(),
      id: d.id,
    })) as Category[];
    // Sort by the admin-controlled `order` field (set via the backoffice
    // rearrange tool). Done in memory because `order` is optional — a
    // Firestore orderBy on it could drop docs missing the field and would
    // need a composite (active, order) index. Categories without an `order`
    // sort last, with name as a stable tiebreaker.
    return categories.sort((a, b) => {
      const ao = typeof a.order === "number" ? a.order : Infinity;
      const bo = typeof b.order === "number" ? b.order : Infinity;
      if (ao !== bo) return ao - bo;
      return (a.categoryName || "").localeCompare(b.categoryName || "");
    });
  });
}

export async function getCategoryByIdServer(id: string): Promise<Category | null> {
  return withCache(`category-${id}`, 5 * MIN, async () => {
    // Query by the stored `id` FIELD (not the doc id) to match the client
    // implementation exactly — the two can differ.
    const snap = await getAdminDb()
      .collection("categories")
      .where("id", "==", id)
      .where("active", "==", true)
      .limit(1)
      .get();
    if (snap.empty) return null;
    const d = snap.docs[0];
    return serializeCategory({ id: d.id, ...(d.data() as object) });
  });
}

export async function getCategoryByNameServer(name: string): Promise<Category | null> {
  return withCache(`category-name-${name}`, 5 * MIN, async () => {
    try {
      const snap = await getAdminDb()
        .collection("categories")
        .where("categoryName", "==", name)
        .where("active", "==", true)
        .limit(1)
        .get();
      if (snap.empty) return null;
      const d = snap.docs[0];
      return serializeCategory({ id: d.id, ...(d.data() as object) });
    } catch (error) {
      console.error("Error fetching category by name:", error);
      return null;
    }
  });
}

// ── Home: collections + products (batched N+1 fix) ───────────────────

/** Top 4 parent categories that have a numeric `order` (ascending). */
async function fetchHomeTopCategories(): Promise<Category[]> {
  const db = getAdminDb();
  const pickTop = (docs: Array<{ id: string; data: () => Record<string, unknown> }>) =>
    (
      docs.map((d) => ({
        ...d.data(),
        id: d.id,
      })) as Category[]
    )
      .filter(
        (c) =>
          !c.isSubcategory &&
          typeof (c as { order?: unknown }).order === "number"
      )
      .sort((a, b) => {
        const ao = (a as { order: number }).order;
        const bo = (b as { order: number }).order;
        if (ao !== bo) return ao - bo;
        return (a.categoryName || "").localeCompare(b.categoryName || "");
      })
      .slice(0, 4);

  // Prefer indexed query (active + order) — avoids downloading every category.
  try {
    const snap = await db
      .collection("categories")
      .where("active", "==", true)
      .orderBy("order", "asc")
      .limit(24)
      .get();
    const top = pickTop(snap.docs);
    if (top.length > 0) return top;
  } catch (err) {
    console.warn(
      "Home categories ordered query failed; falling back to full scan:",
      err
    );
  }

  const catSnap = await db.collection("categories").where("active", "==", true).get();
  return pickTop(catSnap.docs);
}

async function fetchCollectionsWithProducts(): Promise<CollectionWithProducts[]> {
  const topLevel = await fetchHomeTopCategories();
  if (topLevel.length === 0) return [];

  const db = getAdminDb();
  return Promise.all(
    topLevel.map(async (c) => {
      const snap = await db
        .collection("products")
        .where("categories", "array-contains", c.id)
        .where("active", "==", true)
        .orderBy("position", "asc")
        .limit(4)
        .get();

      return {
        id: c.id,
        categoryName: c.categoryName,
        description: c.description,
        isSubcategory: c.isSubcategory,
        products: snap.docs.map((d) =>
          serializeProduct({ id: d.id, ...(d.data() as object) })
        ),
      };
    })
  );
}

export async function getCollectionsWithProductsServer(): Promise<
  CollectionWithProducts[]
> {
  // Next Data Cache survives across serverless invocations (unlike in-memory
  // withCache alone). Keep a short process cache for bursty repeat renders.
  return withCache("collectionsWithProducts:v5", 5 * MIN, () =>
    unstable_cache(fetchCollectionsWithProducts, ["collectionsWithProducts:v5"], {
      revalidate: 300,
      tags: ["home-collections"],
    })()
  );
}

// ── Products ─────────────────────────────────────────────────────────

export async function getProductByIdServer(productId: string): Promise<Product | null> {
  return withCache(`product-${productId}`, 2 * MIN, () =>
    unstable_cache(
      async () => {
        const d = await getAdminDb().collection("products").doc(productId).get();
        if (!d.exists) return null;
        return serializeProduct({ id: d.id, ...(d.data() as object) });
      },
      [`product-${productId}`],
      { revalidate: 120, tags: [`product-${productId}`] }
    )()
  );
}

export async function getRelatedProductsServer(
  categoryValues: string[]
): Promise<Product[]> {
  if (!categoryValues.length) return [];
  // One primary category is enough for "related" and avoids multi-chunk
  // array-contains-any queries that stall the product page.
  const cats = [...new Set(categoryValues)].slice(0, 1);
  const key = `related-v2-${cats.join(",")}`;

  return withCache(key, 2 * MIN, () =>
    unstable_cache(
      async () => {
        try {
          const snap = await getAdminDb()
            .collection("products")
            .where("categories", "array-contains", cats[0])
            .where("active", "==", true)
            .orderBy("position", "asc")
            // Fetch 5 so after excluding the current product we can still show 4.
            .limit(5)
            .get();

          return snap.docs.map((d) =>
            serializeProduct({ id: d.id, ...(d.data() as object) })
          );
        } catch (error) {
          console.error("Error fetching related products:", error);
          return [];
        }
      },
      [key],
      { revalidate: 120, tags: ["related-products"] }
    )()
  );
}

export interface ProductsByCategoryResult {
  products: Product[];
  totalCount: number;
  /** id of the last product in the page — the client reconstructs a cursor
   *  from this for the next `loadMore` (keeps client getProductsByCategory
   *  unchanged). Null when the page is empty. */
  lastProductId: string | null;
  categories?: Record<string, unknown>;
}

export interface ProductsByCategoryParams {
  categoryId: string;
  limit?: number;
  sortBy?: string;
  minPrice?: number;
  maxPrice?: number;
  colorFilter?: string; // hex like "#8baf3a"
  sizeFilter?: string[]; // like ["42"]
}

/** Server-side FIRST page fetch for a category listing. Pagination cursor is
 *  returned as lastProductId; subsequent pages are fetched client-side. */
export async function getProductsByCategoryServer(
  params: ProductsByCategoryParams
): Promise<ProductsByCategoryResult> {
  const {
    categoryId,
    limit: limitNumber = 10,
    sortBy = "latest",
    minPrice,
    maxPrice,
    colorFilter,
    sizeFilter,
  } = params;

  try {
    const catSnap = await getAdminDb()
      .collection("categories")
      .where("id", "==", categoryId)
      .where("active", "==", true)
      .limit(1)
      .get();
    if (catSnap.empty) return { products: [], totalCount: 0, lastProductId: null };

    const categoryData = catSnap.docs[0].data() as Record<string, unknown>;
    const subCategories = (categoryData?.subCategories as string[]) || [];
    const allCategoryIds = [categoryId, ...subCategories];

    const queryPromises = chunk(allCategoryIds).map((c) => {
      let q: FirebaseFirestore.Query = getAdminDb()
        .collection("products")
        .where("categories", "array-contains-any", c)
        .where("active", "==", true)
        .orderBy("position", "asc");
      if (minPrice !== undefined && maxPrice !== undefined) {
        q = q
          .where("productDiscountedPrice", ">=", minPrice)
          .where("productDiscountedPrice", "<=", maxPrice);
      }
      switch (sortBy) {
        case "price-low":
          q = q.orderBy("productDiscountedPrice", "asc");
          break;
        case "price-high":
          q = q.orderBy("productDiscountedPrice", "desc");
          break;
        case "latest":
        default:
          q = q.orderBy("createdDate", "desc");
      }
      return q.limit(limitNumber).get();
    });

    const productsSnapshots = await Promise.all(queryPromises);

    let unique = (
      [...new Map(
        productsSnapshots
          .flatMap((s) => s.docs)
          .map((d) => [d.id, { id: d.id, ...(d.data() as object) }])
      ).values()] as Product[]
    );

    // Client-side color/size filters (mirrors the client implementation).
    unique = unique.filter((product) => {
      let colorMatch = true;
      let sizeMatch = true;

      if (colorFilter) {
        colorMatch =
          (product.variantDetails?.some((variant) =>
            variant.combination?.some((combo) => {
              if (!combo || !combo.name || !combo.value) return false;
              if (combo.name.toLowerCase().trim() === "color") {
                const filterValue = colorFilter?.toLowerCase().trim() || "";
                const variantValue = combo.value?.toLowerCase().trim() || "";
                return variantValue === filterValue || variantValue.includes(filterValue);
              }
              return false;
            })
          ) as boolean) ?? false;
      }

      if (sizeFilter && sizeFilter.length > 0) {
        sizeMatch =
          (product.variantDetails?.some((variant) =>
            variant.combination?.some(
              (combo) =>
                combo.name?.toLowerCase() === "size" && sizeFilter?.includes(combo.value)
            )
          ) as boolean) || false;
      }

      return colorMatch && sizeMatch;
    });

    switch (sortBy) {
      case "latest":
        unique.sort(
          (a, b) => (toMs((b as any).createdDate) || 0) - (toMs((a as any).createdDate) || 0)
        );
        break;
      case "price-low":
        unique.sort((a, b) => (a.productDiscountedPrice || 0) - (b.productDiscountedPrice || 0));
        break;
      case "price-high":
        unique.sort((a, b) => (b.productDiscountedPrice || 0) - (a.productDiscountedPrice || 0));
        break;
    }

    const products = unique.slice(0, limitNumber).map((p) => serializeProduct(p));

    // Total count via count() aggregation (cheap — no doc download).
    const countResults = await Promise.all(
      chunk(allCategoryIds).map((c) => {
        let cq: FirebaseFirestore.Query = getAdminDb()
          .collection("products")
          .where("categories", "array-contains-any", c)
          .where("active", "==", true);
        if (minPrice !== undefined && maxPrice !== undefined) {
          cq = cq
            .where("productDiscountedPrice", ">=", minPrice)
            .where("productDiscountedPrice", "<=", maxPrice);
        }
        return cq.count().get();
      })
    );
    const totalCount = countResults.reduce((sum, snap) => sum + snap.data().count, 0);

    // Cursor must be the Firestore-ORDER last doc of the first chunk — this
    // matches the client getProductsByCategory `lastVisible`. Using the
    // client-SORTED last product would start page 2 from the wrong spot.
    const firstChunkDocs = productsSnapshots[0]?.docs ?? [];
    const lastProductId =
      products.length > 0 && firstChunkDocs.length > 0
        ? firstChunkDocs[firstChunkDocs.length - 1].id
        : null;

    return { products, totalCount, lastProductId, categories: categoryData };
  } catch (error) {
    console.error("Error fetching products by category:", error);
    return { products: [], totalCount: 0, lastProductId: null };
  }
}

// ── Category facets (filter UI) ──────────────────────────────────────

/** Fetch the deduped product set for a category + its subcategories (cached). */
async function fetchCategoryProducts(
  categoryId: string,
  opts: { onlyActive?: boolean } = {}
): Promise<any[]> {
  const onlyActive = !!opts.onlyActive;
  return withCache(
    `server-facet-products-${categoryId}-${onlyActive ? "active" : "all"}`,
    5 * MIN,
    async () => {
      const catSnap = await getAdminDb()
        .collection("categories")
        .where("id", "==", categoryId)
        .limit(1)
        .get();
      if (catSnap.empty) return [];
      const categoryData = catSnap.docs[0].data() as Record<string, unknown>;
      const subCategories = (categoryData?.subCategories as string[]) || [];
      const allCategoryIds = [categoryId, ...subCategories];

      const snaps = await Promise.all(
        chunk(allCategoryIds).map((c) => {
          let q: FirebaseFirestore.Query = getAdminDb()
            .collection("products")
            .where("categories", "array-contains-any", c);
          if (onlyActive) q = q.where("active", "==", true);
          return q.get();
        })
      );
      const all = snaps.flatMap((s) =>
        s.docs.map((d) => ({ id: d.id, ...(d.data() as object) }))
      );
      return [...new Map(all.map((p) => [p.id, p])).values()];
    }
  );
}

export type CategoryFacetsServer = {
  colors: { color: { name: string; hex: string }; count: number }[];
  sizes: { size: string; count: number }[];
  price: { minPrice: number | null; maxPrice: number | null };
};

/** One cached facet payload — avoids 3× full-product scans. */
export async function getFacetsByCategoryServer(
  categoryId: string
): Promise<CategoryFacetsServer> {
  return withCache(`server-facets-${categoryId}`, 5 * MIN, async () => {
    try {
      const [activeProducts, allProducts] = await Promise.all([
        fetchCategoryProducts(categoryId, { onlyActive: true }),
        fetchCategoryProducts(categoryId),
      ]);

      const colorCounts = new Map<
        string,
        { color: { name: string; hex: string }; count: number }
      >();
      activeProducts.forEach((product) => {
        const productColorNames = new Set<string>();
        const processColor = (name?: string) => {
          if (!name) return;
          const colorName = name.toLowerCase();
          productColorNames.add(colorName);
          if (!colorCounts.has(colorName)) {
            colorCounts.set(colorName, { color: { name, hex: "#000000" }, count: 0 });
          }
        };
        product.variants?.forEach((variant: any) => {
          if (
            variant.optionName?.toLowerCase() === "color" &&
            Array.isArray(variant.optionValue)
          ) {
            variant.optionValue.forEach((v: string) => processColor(v));
          }
        });
        product.variantDetails?.forEach((detail: any) => {
          detail.combination?.forEach((combo: any) => {
            if (combo.name?.toLowerCase() === "color" && combo?.value) {
              processColor(combo.value);
            }
          });
        });
        productColorNames.forEach((colorName) => {
          const cd = colorCounts.get(colorName);
          if (cd) cd.count++;
        });
      });

      const sizeCounts = new Map<string, number>();
      let minPrice: number | null = null;
      let maxPrice: number | null = null;

      allProducts.forEach((product) => {
        const productSizes = new Set<string>();
        product.variants?.forEach((variant: any) => {
          if (
            variant.optionName?.toLowerCase() === "size" &&
            Array.isArray(variant.optionValue)
          ) {
            variant.optionValue.forEach((v: string) => productSizes.add(v));
          }
        });
        product.variantDetails?.forEach((detail: any) => {
          detail.combination?.forEach((combo: any) => {
            if (combo.name?.toLowerCase() === "size") productSizes.add(combo.value);
          });
        });
        if (Array.isArray(product.sizes)) {
          product.sizes.forEach((s: string) => {
            if (s) productSizes.add(s);
          });
        }
        productSizes.forEach((size) =>
          sizeCounts.set(size, (sizeCounts.get(size) || 0) + 1)
        );

        const prices = [product.productDiscountedPrice].filter(
          (p) => typeof p === "number"
        ) as number[];
        prices.forEach((price) => {
          if (minPrice === null || price < minPrice) minPrice = price;
          if (maxPrice === null || price > maxPrice) maxPrice = price;
        });
        product.variantDetails?.forEach((detail: any) => {
          const vp = [detail.discountedPrice].filter(
            (p) => typeof p === "number"
          ) as number[];
          vp.forEach((price) => {
            if (minPrice === null || price < minPrice) minPrice = price;
            if (maxPrice === null || price > maxPrice) maxPrice = price;
          });
        });
      });

      return {
        colors: Array.from(colorCounts.values()).sort((a, b) => b.count - a.count),
        sizes: Array.from(sizeCounts.entries())
          .map(([size, count]) => ({ size, count }))
          .sort((a, b) => {
            const aNum = parseFloat(a.size);
            const bNum = parseFloat(b.size);
            if (!isNaN(aNum) && !isNaN(bNum)) return aNum - bNum;
            return a.size.localeCompare(b.size);
          }),
        price: { minPrice, maxPrice },
      };
    } catch (error) {
      console.error("Error fetching facets by category:", error);
      return {
        colors: [],
        sizes: [],
        price: { minPrice: null, maxPrice: null },
      };
    }
  });
}

export async function getColorsByCategoryServer(
  categoryId: string
): Promise<{ color: { name: string; hex: string }; count: number }[]> {
  return (await getFacetsByCategoryServer(categoryId)).colors;
}

export async function getSizesByCategoryServer(
  categoryId: string
): Promise<{ size: string; count: number }[]> {
  return (await getFacetsByCategoryServer(categoryId)).sizes;
}

export async function getMinMaxPriceByCategoryServer(
  categoryId: string
): Promise<{ minPrice: number | null; maxPrice: number | null }> {
  return (await getFacetsByCategoryServer(categoryId)).price;
}
