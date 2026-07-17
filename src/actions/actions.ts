import { auth, db } from "@/firebase/config";
import {
  collection,
  doc,
  DocumentData,
  getCountFromServer,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  setDoc,
  startAfter,
  updateDoc,
  deleteDoc,
  where,
  DocumentSnapshot,
  serverTimestamp,
} from "firebase/firestore";
import { withCache } from "@/lib/cache";

// Re-export so existing importers of `invalidateCache` from "@/actions/actions" keep working.
export { invalidateCache } from "@/lib/cache";

interface DocumentInterface extends DocumentData {
  id: string;
  createdDate?: string;
  updatedDate?: string;
}
interface Category {
  active: boolean;
  categoryName: string;
  description: string;
  desktopBanner: string | null;
  id: string;
  images: string[];
  isSubcategory: boolean;
  mobileBanner: string | null;
  order?: number;
  parentCategory: {
    categoryId: string;
    categoryName: string;
  };
  products: string[]; // Array of product IDs
}
interface Product {
  id: string;
  productName: string;
  productPrice: number;
  productDiscountedPrice: number;
  categories: string[];

  images: string[];
  variants: {
    optionValue: string[];
    optionName: string;
  }[];
  variantDetails: {
    price: number;
    discountedPrice: number;
    inventory: number;
    combination: {
      name: string;
      value: string;
    }[];
    sku: string;
  }[];
}


interface VariantDetail {
price: number;
  discountedPrice: number;
  inventory: number;
  combination: {
    name: string;
    value: string;
  }[];
  sku: string;
}
interface CartProduct {
  productId: string;
  quantity: number;
  variantDetails: VariantDetail;
}
interface CartReturn {
    id: string;
  images: string[];
  productName: string;
  productPrice: number;
  productDiscountedPrice?: number;
  quantity: number;
  variantDetails: VariantDetail;
  currentInventory?: number;
  outOfStock?: boolean;

  unitQuantity: number;
  productCategory: string;
  variants: { optionValue: string[]; optionName: string }[];

  description: string;

  active: boolean;

  productUnit: string;
 
  taxRate: number;
  categories: string[];
  shippingCost: number;
  
  skuId: string;
  createdDate?: { seconds: number; nanoseconds: number };
  updatedDate?: { seconds: number; nanoseconds: number };
}
interface CartData {
  userId: string | null;
  products: CartProduct[];
  createdAt: Date;
  updatedAt: Date;
}

type StoredCartLine = {
  productId?: string;
  quantity?: number;
  variantDetails?: {
    sku?: string;
    combination?: { name: string; value: string | { name?: string } }[];
  };
};

/**
 * Resolve which Firestore cart doc to use. Must stay consistent across
 * add / get / update / remove — never mix guestCartId with a logged-in uid.
 */
export function resolveCartTarget(user = auth.currentUser): {
  cartId: string | null;
  collectionName: "carts" | "guest-carts";
  isGuest: boolean;
} | null {
  const isLoggedIn = !!(user && !user.isAnonymous);
  if (isLoggedIn) {
    return {
      cartId: user!.uid,
      collectionName: "carts",
      isGuest: false,
    };
  }

  if (typeof window === "undefined") return null;
  const guestId = localStorage.getItem("guestCartId");
  if (!guestId) {
    return { cartId: null, collectionName: "guest-carts", isGuest: true };
  }
  return {
    cartId: guestId,
    collectionName: "guest-carts",
    isGuest: true,
  };
}

function ensureGuestCartId(): string {
  let guestId = localStorage.getItem("guestCartId");
  if (!guestId) {
    guestId = crypto.randomUUID();
    localStorage.setItem("guestCartId", guestId);
  }
  return guestId;
}

function cartLineSku(line?: { sku?: string } | null): string {
  return String(line?.sku ?? "").trim();
}

function cartCombinationsMatch(
  a?: { name: string; value: string | { name?: string } }[],
  b?: { name: string; value: string | { name?: string } }[]
): boolean {
  if (!Array.isArray(a) || !Array.isArray(b) || !a.length || !b.length) {
    return false;
  }
  if (a.length !== b.length) return false;
  return a.every((opt) =>
    b.some(
      (other) =>
        other.name === opt.name &&
        normalizeOptionValue(other.value) === normalizeOptionValue(opt.value)
    )
  );
}

/**
 * Match a stored cart line to a product (+ optional variant).
 * Prefer SKU, then combination; non-variant lines match by productId only.
 */
function cartLinesAreSame(
  existing: StoredCartLine,
  productId: string,
  incomingVariant?: {
    sku?: string;
    combination?: { name: string; value: string | { name?: string } }[];
  } | null
): boolean {
  if (existing.productId !== productId) return false;

  const existingSku = cartLineSku(existing.variantDetails);
  const incomingSku = cartLineSku(incomingVariant);

  // Both non-variant (no sku)
  if (!existingSku && !incomingSku) return true;

  if (existingSku && incomingSku) {
    return existingSku === incomingSku;
  }

  // Fallback: same combination when one side lacks sku
  if (
    cartCombinationsMatch(
      existing.variantDetails?.combination,
      incomingVariant?.combination
    )
  ) {
    return true;
  }

  // One has sku and the other doesn't → different lines
  return false;
}

/** Collapse duplicate lines that share the same productId + variant. */
function dedupeCartLines(products: StoredCartLine[]): StoredCartLine[] {
  const merged: StoredCartLine[] = [];
  for (const line of products) {
    if (!line?.productId) continue;
    const idx = merged.findIndex((m) =>
      cartLinesAreSame(m, line.productId!, line.variantDetails)
    );
    if (idx >= 0) {
      merged[idx] = {
        ...merged[idx],
        quantity:
          (Number(merged[idx].quantity) || 0) + (Number(line.quantity) || 0),
        variantDetails:
          merged[idx].variantDetails?.sku || merged[idx].variantDetails?.combination
            ? merged[idx].variantDetails
            : line.variantDetails || merged[idx].variantDetails,
      };
    } else {
      merged.push({ ...line });
    }
  }
  return merged;
}

/** Normalize variant option values (string or { name, hex } object). */
export function normalizeOptionValue(
  value: string | { name?: string } | null | undefined
): string {
  if (value == null) return "";
  if (typeof value === "string") return value.trim();
  if (typeof value === "object" && value.name != null) {
    return String(value.name).trim();
  }
  return String(value).trim();
}

export function variantDetailsRecordFromCombination(
  combination?: { name: string; value: string | { name?: string } }[]
): Record<string, string> {
  if (!Array.isArray(combination)) return {};
  return combination.reduce<Record<string, string>>((acc, curr) => {
    if (curr?.name) acc[curr.name] = normalizeOptionValue(curr.value);
    return acc;
  }, {});
}

/** Sale price for a cart line (selected variant when present). */
export function getCartItemSalePrice(item: {
  variantDetails?: { discountedPrice?: number; price?: number };
  productDiscountedPrice?: number;
  productPrice: number;
}) {
  return (
    item.variantDetails?.discountedPrice ||
    item.variantDetails?.price ||
    item.productDiscountedPrice ||
    item.productPrice ||
    0
  );
}

/** Original/MRP for a cart line (for strikethrough when higher than sale). */
export function getCartItemOriginalPrice(item: {
  variantDetails?: { discountedPrice?: number; price?: number };
  productDiscountedPrice?: number;
  productPrice: number;
}) {
  const sale = getCartItemSalePrice(item);
  const original =
    item.variantDetails?.price ||
    item.productPrice ||
    sale;
  return original > sale ? original : sale;
}

export const hasProductVariants = (item: {
  variants?: unknown[];
  variantDetails?: { combination?: unknown[]; sku?: string };
}) =>
  (item.variants?.length ?? 0) > 0 ||
  (item.variantDetails?.combination?.length ?? 0) > 0 ||
  !!item.variantDetails?.sku;


interface Address {
  id: string;
  name: string;
  mobile: string;
  email: string;
  address: string;
  city: string;
  pincode: string;
  state: string;
  country?: string;
  notes?: string;
  companyName?: string;
  streetAddress1?: string;
  streetAddress2?: string;
  is_default?: boolean;
  created_at?: {
    seconds: number;
    nanoseconds: number;
  };
}

interface Order {
  id: string;
  // define the rest of your order fields
  orderNumber: string;
  items: any[];
  totalAmount: number;
  status: string;
  createdAt: any; // or Timestamp if you're using Firebase Timestamps
  // ...etc
}

export const updateUserAddress = async (
  userId: string,
  addressId: string,
  updatedData: Partial<Omit<Address, "id" | "created_at">> // You can update any field except id/created_at
): Promise<boolean> => {
  try {
    // Reference to the specific address document
    const addressRef = doc(db, "users", userId, "addresses", addressId);

    // Update the document with the new data
    await updateDoc(addressRef, updatedData);

    console.log("Address updated successfully");
    return true;
  } catch (error) {
    console.error("Error updating address:", error);
    return false;
  }
};

export const getAllCollections = async (): Promise<DocumentInterface[]> => {
  try {
    const querySnapshot = await getDocs(collection(db, "categories"));
    return querySnapshot.docs.map((doc) => {
      const { createdDate, updatedDate, ...docData } = doc.data();
      return {
        id: doc.id,
        ...docData,
        createdDate: createdDate?.toDate()?.toISOString(),
        updatedDate: updatedDate?.toDate()?.toISOString(),
      };
    });
  } catch (error) {
    console.error("Error fetching documents:", error);
    throw error;
  }
};

export const getAllProducts = async (): Promise<DocumentInterface[]> => {
  try {
    const querySnapshot = await getDocs(collection(db, "products"));
    return querySnapshot.docs.map((doc) => {
      const { createdDate, updatedDate, ...docData } = doc.data();
      return {
        id: doc.id,
        ...docData,
        createdDate: createdDate?.toDate()?.toISOString(),
        updatedDate: updatedDate?.toDate()?.toISOString(),
      };
    });
  } catch (error) {
    console.error("Error fetching documents:", error);
    throw error;
  }
};


interface Category {
  id: string;
  categoryName: string;
  description: string;
  active: boolean;
  // desktopBanner: string;
  images: string[];
  isSubcategory: boolean;
  slug: string;
  // mobileBanner?: string;
  // Add any other properties
}

interface Product {
  id: string;
  unitQuantity: number;
  productCategory: string;
  variants: { optionValue: string[]; optionName: string }[];
  productPrice: number;
  productName: string;
  
  outOfStock?: boolean;
  description: string;
  position : number;
  quantity: number;
  active: boolean;
  productDiscountedPrice: number;
  variantDetails: {
    price: number;
    discountedPrice: number;
    inventory: number;
    combination: { name: string; value: string }[];
    sku: string;
  }[];
  productUnit: string;
  images: string[];
  taxRate: number;
  categories: string[];
  shippingCost: number;
  currentInventory : number;
  skuId: string;
  createdDate?: { seconds: number; nanoseconds: number };
  updatedDate?: { seconds: number; nanoseconds: number };
  sizes?: string[];
  docId?: string;
}

export const getCollectionsWithProducts = async (): Promise<
  {
    id: string;
    categoryName: string;
    description: string;
    products: Product[];
  }[]
> => withCache("collectionsWithProducts", 5 * 60 * 1000, async () => {
  try {
     const categoriesQuery = query(
      collection(db, "categories"),
      where("active", "==", true),  // Only active categories
      orderBy("order", "asc"),      // Sort by order in ascending order                // Limit to 5 results
    );
    const categoriesSnapshot = await getDocs(categoriesQuery);
    const categories: Category[] = categoriesSnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        categoryName: data.categoryName,
        description: data.description,
        active: data.active,
        desktopBanner: data.desktopBanner,
        images: data.images || [], // Default to empty array if missing
        isSubcategory: data.isSubcategory,
        slug: data.slug,
        mobileBanner: data.mobileBanner,
        // Ensure ALL properties from the Category interface are mapped here
      } as Category;
    });

    const collectionsWithProducts = await Promise.all(
      categories.map(async (category) => {
        const productsQuery = query(
          collection(db, "products"),
          where("categories", "array-contains", category.id),
           where("active", "==", true),
            orderBy("position", "asc"),    
          limit(4)
        );
        const productsSnapshot = await getDocs(productsQuery);
        const products: Product[] = productsSnapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            unitQuantity: data.unitQuantity,
            productCategory: data.productCategory,
            variants: data.variants || [],
            productPrice: data.productPrice,
            productName: data.productName,
            description: data.description,
            quantity: data.quantity,
            active: data.active,
            productDiscountedPrice: data.productDiscountedPrice,
            variantDetails: data.variantDetails || [],
            productUnit: data.productUnit,
            images: data.images || [],
            taxRate: data.taxRate,
            categories: data.categories || [],
            position : data?.position,
            shippingCost: data.shippingCost,
            skuId: data.skuId,
            createdDate: data.createdDate,
            updatedDate: data.updatedDate,
          } as Product;
        });

        return {
          id: category?.id,
          categoryName: category?.categoryName,
          description: category?.description,
               active: category?.active,
        desktopBanner: category?.desktopBanner,
        images: category?.images || [], // Default to empty array if missing
        isSubcategory: category?.isSubcategory,
        slug: category?.slug,
        mobileBanner: category?.mobileBanner,
          products: products,
        };
      })
    );

    return collectionsWithProducts;
  } catch (error) {
    console.error(
      "Error fetching collections with products from Firestore:",
      error
    );
    throw error;
  }
});




export const getCategoryByName = async (
  categoryName: string
): Promise<Category | null> => {
  try {
    const querySnapshot = await getDocs(
      query(
        collection(db, "categories"),
        where("categoryName", "==", categoryName),
             where("active", "==", true),
      )
    );

    if (querySnapshot.empty) return null; // Category not found

    const doc = querySnapshot.docs[0];
    const categoryData = doc.data() as Category; // Type assertion

    return { ...categoryData, id: doc.id }; // Return the category with the document ID
  } catch (error) {
    console.error("Error fetching category:", error);
    return null; // Handle the error gracefully
  }
};


export const getAllCategories = async (): Promise<Category[]> =>
  withCache("allCategories", 5 * 60 * 1000, async () => {
  try {
    const categoriesQuery = query(
      collection(db, "categories"),
      where("active", "==", true)
    );

    const querySnapshot = await getDocs(categoriesQuery);

    const categories = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Category[];

    // Sort by the admin-controlled `order` field (set via the backoffice
    // rearrange tool); categories without an `order` sort last, name breaks ties.
    return categories.sort((a, b) => {
      const ao = typeof a.order === "number" ? a.order : Infinity;
      const bo = typeof b.order === "number" ? b.order : Infinity;
      if (ao !== bo) return ao - bo;
      return (a.categoryName || "").localeCompare(b.categoryName || "");
    });
  } catch (error) {
    console.error("Error fetching categories:", error);
    return [];
  }
});

export const getCategoryById = async (
  id: string
): Promise<Category | null> =>
  withCache(`category-${id}`, 5 * 60 * 1000, async () => {
  try {
    const querySnapshot = await getDocs(
      query(
        collection(db, "categories"),
        where("id", "==", id),
             where("active", "==", true),
      )
    );

    if (querySnapshot.empty) return null; // Category not found

    const doc = querySnapshot.docs[0];
    const categoryData = doc.data() as Category; // Type assertion

    return { ...categoryData, id: doc.id }; // Return the category with the document ID
  } catch (error) {
    console.error("Error fetching category:", error);
    return null; // Handle the error gracefully
  }
});


export const getUserAddresses = async (
  userId: string
): Promise<Address[]> => {
  try {
    // Reference to the addresses subcollection under the user document
    const addressesRef = collection(db, "users", userId, "addresses");
    
    // Get all documents in the addresses subcollection
    const querySnapshot = await getDocs(addressesRef);

    // If no addresses found, return empty array
    if (querySnapshot.empty) return [];

    // Map through documents and format the data
    const addresses = querySnapshot.docs.map(doc => ({
      id: doc.id, // Include the document ID
      ...doc.data() as Omit<Address, 'id'> // Spread the rest of the address data
    }));

    return addresses;
  } catch (error) {
    console.error("Error fetching user addresses:", error);
    return []; // Return empty array in case of error
  }
};

const getOrderTimeMs = (order: Record<string, unknown>): number => {
  const readTime = (value: unknown): number | null => {
    if (!value) return null;
    if (typeof value === "object" && value !== null) {
      const ts = value as { toDate?: () => Date; seconds?: number };
      if (typeof ts.toDate === "function") return ts.toDate().getTime();
      if (typeof ts.seconds === "number") return ts.seconds * 1000;
    }
    if (typeof value === "string") {
      const parsed = Date.parse(value);
      return Number.isNaN(parsed) ? null : parsed;
    }
    if (typeof value === "number") return value;
    return null;
  };

  return (
    readTime(order.createdAt) ??
    readTime(order.timestamp) ??
    0
  );
};

export const getUserOrders = async (
  userId: string
): Promise<Order[]> => {
  try {
    // Reference to the orders subcollection under the user document
    const ordersRef = collection(db, "users", userId, "orders");

    // Get all documents in the orders subcollection
    const querySnapshot = await getDocs(ordersRef);

    // If no orders found, return empty array
    if (querySnapshot.empty) return [];

    // Map through documents and format the data
    const orders = querySnapshot.docs.map(doc => ({
      id: doc.id, // Include the document ID
      ...doc.data() as Omit<Order, 'id'> // Spread the rest of the order data
    }));

    return orders.sort(
      (a, b) => getOrderTimeMs(b as Record<string, unknown>) - getOrderTimeMs(a as Record<string, unknown>)
    );
  } catch (error) {
    console.error("Error fetching user orders:", error);
    return []; // Return empty array in case of error
  }
};



// export const getProductsByCategory = async (
//   productIds: string[]
// ): Promise<Product[]> => {
//   if (!productIds.length) {
//     return [];
//   }

//   const productsCollection = collection(db, "products");
//   const querySnapshot = await getDocs(
//     query(productsCollection, where("id", "in", productIds))
//   );

//   return querySnapshot.docs.map((doc) => {
//     const productData = doc.data() as Product; // Type assertion
//     return { ...productData }; // Return the product with the document ID
//   });
// };

// Updated getProductsByCategory function
export const getProductsByCategory = async (
  categoryId: string,
  limitNumber: number,
  lastVisibleDoc: DocumentSnapshot | null = null,
  sortBy: string = "latest",
  minPrice?: number,
  maxPrice?: number,
  colorFilter?: string, // Hex color code like "#8baf3a"
  sizeFilter?: string[] // Size value like "42"
  
): Promise<{
  products: Product[];
  categories?: Record<string, any>;
  totalCount: number;
  lastVisible: DocumentSnapshot | null;
}> => {
  try {
    // First, get the category document
    const categoryQuery = query(
      collection(db, "categories"),
      where("id", "==", categoryId),
           where("active", "==", true),
    );
    const categorySnapshot = await getDocs(categoryQuery);

    if (categorySnapshot.empty) {
      return { products: [], totalCount: 0, lastVisible: null };
    }

    const categoryData = categorySnapshot.docs[0].data();
    const subCategories = categoryData?.subCategories || [];
    
    // Create an array of all relevant category IDs (main category + subcategories)
    const allCategoryIds = [categoryId, ...subCategories];

    // Since Firestore doesn't support array-contains-any with more than 10 items,
    // we need to split into chunks if there are more than 10 subcategories
    const chunkSize = 10
    const queryPromises = [];

    for (let i = 0; i < allCategoryIds.length; i += chunkSize) {
      const chunk = allCategoryIds.slice(i, i + chunkSize);
      let chunkQuery = query(
        collection(db, "products"),
        where("categories", "array-contains-any", chunk),
             where("active", "==", true),
                     orderBy("position", "asc"),    
      );

      // Apply price filters if provided
      if (minPrice !== undefined && maxPrice !== undefined) {
        chunkQuery = query(
          chunkQuery,
          where("productDiscountedPrice", ">=", minPrice),
          where("productDiscountedPrice", "<=", maxPrice)
        );
      }

      // Apply sorting
      switch (sortBy) {
        case "latest":
          chunkQuery = query(chunkQuery, orderBy("createdDate", "desc"));
          break;
        case "price-low":
          chunkQuery = query(chunkQuery, orderBy("productDiscountedPrice", "asc"));
          break;
        case "price-high":
          chunkQuery = query(chunkQuery, orderBy("productDiscountedPrice", "desc"));
          break;
        default:
          chunkQuery = query(chunkQuery, orderBy("createdDate", "desc"));
      }

      // Apply pagination
      chunkQuery = query(
        chunkQuery,
        limit(limitNumber),
        ...(lastVisibleDoc ? [startAfter(lastVisibleDoc)] : [])
      );

      queryPromises.push(getDocs(chunkQuery));
    }

    // Execute all queries in parallel
    const productsSnapshots = await Promise.all(queryPromises);
    
    // Combine and deduplicate results
    const allProducts = productsSnapshots.flatMap(snapshot => 
      snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product))
    );
    
    // Remove duplicates (in case a product belongs to multiple subcategories)
    let uniqueProducts = [...new Map(allProducts.map(item => [item.id, item])).values()];

    // Apply filters if provided (client-side filtering)
    uniqueProducts = uniqueProducts.filter(product => {
      let colorMatch = true;
      let sizeMatch = true;

      // Check color filter
if (colorFilter) {

  colorMatch = product.variantDetails?.some(variant => 
    variant.combination?.some(combo => {
      // Check if combo exists and has the required properties
      if (!combo || !combo.name || !combo.value) return false;

      // Case-insensitive comparison for color attribute
      if (combo.name.toLowerCase().trim() === "color") {
  
        const filterValue = colorFilter?.toLowerCase().trim() || '';
        const variantValue = combo.value?.toLowerCase().trim() || '';


        
        // Check for exact match or partial match
        return variantValue === filterValue || 
               variantValue.includes(filterValue);
      }
      return false;
    })
  ) ?? false; // Use nullish coalescing for undefined cases
}

      // Check size filter
      if (sizeFilter && sizeFilter.length > 0) {
        sizeMatch = product.variantDetails?.some(variant => 
          variant.combination?.some(combo => 
            combo.name?.toLowerCase() === "size" && sizeFilter?.includes(combo.value)
          )
        ) || false;
      }

      return colorMatch && sizeMatch;
    });
    
    // Sort the final combined results
    switch (sortBy) {
      case "latest":
        uniqueProducts.sort((a, b) => (b.createdDate?.seconds || 0) - (a.createdDate?.seconds || 0));
        break;
      case "price-low":
        uniqueProducts.sort((a, b) => (a.productDiscountedPrice || 0) - (b.productDiscountedPrice || 0));
        break;
      case "price-high":
        uniqueProducts.sort((a, b) => (b.productDiscountedPrice || 0) - (a.productDiscountedPrice || 0));
        break;
    }

    // Apply limit after combining
    const products = uniqueProducts.slice(0, limitNumber);

    // Get total count using getCountFromServer (much cheaper than getDocs)
    let totalCount = 0;

    const countPromises = [];
    for (let i = 0; i < allCategoryIds.length; i += chunkSize) {
      const chunk = allCategoryIds.slice(i, i + chunkSize);
      let countQuery = query(
        collection(db, "products"),
        where("categories", "array-contains-any", chunk),
        where("active", "==", true)
      );

      if (minPrice !== undefined && maxPrice !== undefined) {
        countQuery = query(
          countQuery,
          where("productDiscountedPrice", ">=", minPrice),
          where("productDiscountedPrice", "<=", maxPrice)
        );
      }

      countPromises.push(getCountFromServer(countQuery));
    }

    const countResults = await Promise.all(countPromises);
    totalCount = countResults.reduce((sum, snap) => sum + snap.data().count, 0);
    

    return {
      products,
      categories:categoryData,
      totalCount,
      lastVisible: products.length > 0 ? 
        productsSnapshots[0].docs[productsSnapshots[0].docs.length - 1] : null,
    };
  } catch (error) {
    console.error("Error fetching products:", error);
    return { products: [], totalCount: 0, lastVisible: null ,categories:{}};
  }
};

export const getProductById = async (
  productId: string
): Promise<Product | null> =>
  withCache(`product-${productId}`, 2 * 60 * 1000, async () => {
    try {
      const productRef = doc(db, "products", productId);
      const productSnap = await getDoc(productRef);

      if (productSnap.exists()) {
        return { ...(productSnap.data() as Product), id: productSnap.id };
      } else {
        return null; // Product not found
      }
    } catch (error) {
      console.error("Error fetching product details:", error);
      return null;
    }
  });

export const getRelatedProducts = async (
  categoryValues: string[] // Array of category values
): Promise<Product[]> => {
  try {
    if (categoryValues.length === 0) {
      return []; // Return empty array if no categories are provided
    }

  

    const productsCollection = collection(db, "products");
    const q = query(
      productsCollection,
      where("categories", "array-contains-any", categoryValues),
      where("active", "==", true),
       limit(8),
              orderBy("position", "asc"),    
    );

    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map((doc) => {
      const productData = doc.data() as Product;
   
      return { ...productData, id: doc.id };
    });
  } catch (error) {
    console.error("Error fetching products in categories:", error);
    return [];
  }
};

export const addProductToCart = async ({
  productId,
  variantDetails,
  quantity,
}: {
  productId: string;
  variantDetails?: VariantDetail;
  quantity: number;
}): Promise<void> => {
  try {
    const user = auth.currentUser;
    const isLoggedIn = !!(user && !user.isAnonymous);
    const cartId = isLoggedIn ? user!.uid : ensureGuestCartId();
    const cartRef = doc(
      db,
      isLoggedIn ? "carts" : "guest-carts",
      cartId
    );
    const cartSnapshot = await getDoc(cartRef);

    const newLine: StoredCartLine = variantDetails
      ? { productId, quantity, variantDetails }
      : { productId, quantity };

    if (!cartSnapshot.exists()) {
      await setDoc(cartRef, {
        userId: isLoggedIn ? cartId : null,
        products: [newLine],
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      return;
    }

    const { products = [] } = cartSnapshot.data() as CartData;
    const existingProductIndex = products.findIndex((p) =>
      cartLinesAreSame(p, productId, variantDetails)
    );

    let updatedProducts: StoredCartLine[];
    if (existingProductIndex >= 0) {
      updatedProducts = products.map((product, index) =>
        index === existingProductIndex
          ? {
              ...product,
              quantity: (Number(product.quantity) || 0) + quantity,
              variantDetails:
                product.variantDetails || variantDetails || undefined,
            }
          : product
      );
    } else {
      updatedProducts = [...products, newLine];
    }

    await updateDoc(cartRef, {
      products: dedupeCartLines(updatedProducts),
      updatedAt: new Date(),
    });
  } catch (error) {
    console.error("Error managing cart:", error);
    throw error;
  }
};

/**
 * After phone login: merge guest-carts/{guestCartId} into carts/{uid},
 * then delete the guest cart and clear localStorage.
 */
export async function mergeGuestCartIntoUserCart(
  userId: string
): Promise<void> {
  if (typeof window === "undefined" || !userId) return;

  const guestId = localStorage.getItem("guestCartId");
  if (!guestId) return;

  try {
    const guestRef = doc(db, "guest-carts", guestId);
    const userRef = doc(db, "carts", userId);
    const [guestSnap, userSnap] = await Promise.all([
      getDoc(guestRef),
      getDoc(userRef),
    ]);

    const guestProducts: StoredCartLine[] = guestSnap.exists()
      ? ((guestSnap.data() as CartData).products || [])
      : [];

    if (!guestProducts.length) {
      localStorage.removeItem("guestCartId");
      if (guestSnap.exists()) {
        await deleteDoc(guestRef).catch(() => {});
      }
      return;
    }

    const userProducts: StoredCartLine[] = userSnap.exists()
      ? ((userSnap.data() as CartData).products || [])
      : [];

    const merged = dedupeCartLines([...userProducts, ...guestProducts]);

    if (userSnap.exists()) {
      await updateDoc(userRef, {
        products: merged,
        updatedAt: new Date(),
      });
    } else {
      await setDoc(userRef, {
        userId,
        products: merged,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }

    await deleteDoc(guestRef).catch(() => {});
    localStorage.removeItem("guestCartId");
    window.dispatchEvent(new Event("cart-updated"));
  } catch (error) {
    console.error("Failed to merge guest cart:", error);
  }
};

export const addProductToBuyNowCart = async ({
  productId,
  variantDetails,
  quantity,
}: {
  productId: string;
  variantDetails?: VariantDetail;
  quantity: number;
}): Promise<void> => {
  try {
    const user = auth.currentUser;
    const isLoggedIn = user && !user.isAnonymous;

    const cartId = isLoggedIn
      ? user.uid
      : localStorage.getItem("guestBuyNowCartId") || crypto.randomUUID();

    if (!isLoggedIn) {
      localStorage.setItem("guestBuyNowCartId", cartId);
    }

    const cartRef = doc(db, `${isLoggedIn ? "" : "guest-"}buyNowCarts`, cartId);

    const productData = variantDetails !== undefined 
      ? { productId, quantity, variantDetails } 
      : { productId, quantity };

    await setDoc(cartRef, {
      userId: isLoggedIn ? cartId : null,
      products: [productData],
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

  } catch (error) {
    console.error("Error managing buy now cart:", error);
    throw error;
  }
};

export const getBuyNowCartProducts = async (): Promise<CartReturn[]> => {
  try {
    const user = auth.currentUser;
    const isLoggedIn = user && !user.isAnonymous;
    let cartId: string | null = null;

    if (isLoggedIn) {
      cartId = user.uid;
    } else {
      cartId = localStorage.getItem("guestBuyNowCartId");
    }

    if (!cartId) {
      return [];
    }

    const cartRef = doc(db, `${isLoggedIn ? "" : "guest-"}buyNowCarts`, cartId);
    const cartSnapshot = await getDoc(cartRef);

    if (!cartSnapshot.exists()) {
      return [];
    }

    const { products: cartProducts } = cartSnapshot.data() as CartData;
    
    if (!cartProducts || cartProducts.length === 0) {
      return [];
    }

    const productDetailsPromises = cartProducts.map(async (cartProduct) => {
      const productDoc = await getDoc(doc(db, "products", cartProduct.productId));
      if (!productDoc.exists()) {
        return null;
      }
      const productData = {
        ...productDoc.data(),
        id: productDoc.data().id || productDoc.id,
      } as Product;

      // Handle products without variants
      if (!productData.variantDetails || productData.variantDetails.length === 0) {
        const currentInventory = productData.quantity ?? 0;
        const outOfStock = currentInventory < cartProduct.quantity;

        return {
          ...productData,
          quantity: cartProduct.quantity,
          currentInventory,
          outOfStock,
          variantDetails: {
            price: productData.productPrice,
            discountedPrice: productData.productDiscountedPrice,
            inventory: productData.quantity,
            sku: productData.skuId,
            combination: [],
          },
        };
      }

      // Handle products with variants
      const variant = productData.variantDetails.find(
        (v) =>
          v.sku === cartProduct.variantDetails?.sku ||
          (Array.isArray(cartProduct.variantDetails?.combination) &&
            Array.isArray(v.combination) &&
            v.combination.every((c) =>
              cartProduct.variantDetails?.combination?.some(
                (cc) =>
                  cc.name === c.name &&
                  normalizeOptionValue(cc.value) ===
                    normalizeOptionValue(c.value)
              )
            ))
      );

      const currentInventory = variant?.inventory ?? 0;
      const outOfStock = currentInventory < cartProduct.quantity;
      const cartVariant = cartProduct.variantDetails;
      const resolved = variant || cartVariant;

      return {
        ...productData,
        quantity: cartProduct.quantity,
        variantDetails: {
          ...(resolved || {}),
          price:
            Number(resolved?.price) ||
            Number(productData.productPrice) ||
            0,
          discountedPrice:
            Number(resolved?.discountedPrice) ||
            Number(resolved?.price) ||
            Number(productData.productDiscountedPrice) ||
            Number(productData.productPrice) ||
            0,
          combination:
            variant?.combination || cartVariant?.combination || [],
          sku: resolved?.sku || cartVariant?.sku,
          inventory: variant?.inventory ?? cartVariant?.inventory,
        },
        currentInventory,
        outOfStock,
      };
    });

    const resolvedProducts = await Promise.all(productDetailsPromises);
    return resolvedProducts.filter((p) => p !== null) as CartReturn[];

  } catch (error) {
    console.error("Error fetching buy now cart products:", error);
    throw error;
  }
};

export async function getCartProducts() {
  const target = resolveCartTarget();
  if (!target?.cartId) return [];

  try {
    const cartRef = doc(db, target.collectionName, target.cartId);
    const cartSnapshot = await getDoc(cartRef);
    
    if (!cartSnapshot.exists()) return [];
    
    const rawItems: CartProduct[] = cartSnapshot.data()?.products || [];
    // Heal duplicate lines left by older buggy add-to-cart matching
    const cartItems = dedupeCartLines(rawItems) as CartProduct[];
    if (cartItems.length !== rawItems.length) {
      await updateDoc(cartRef, {
        products: cartItems,
        updatedAt: new Date(),
      }).catch(() => {});
    }
    const productIdsInCart = cartItems.map(item => item.productId).filter(Boolean) as string[];

    if (productIdsInCart.length === 0) return [];

    // Fetch products by document ID (authoritative, works regardless of whether
    // a redundant `id` field is stored inside the document)
    const productDocsPromises = productIdsInCart.map((pid) =>
      getDoc(doc(collection(db, "products"), pid))
    );
    const productDocs = await Promise.all(productDocsPromises);

    const productsData = productDocs
      .filter((d) => d.exists())
      .map((d) => ({
        ...(d.data() as Product),
        id: d.data()?.id || d.id,
        docId: d.id,
      })) as Product[];

    const variantMatchesCart = (
      variant: { sku?: string; combination?: { name: string; value: string | { name?: string } }[] },
      cartVariant?: { sku?: string; combination?: { name: string; value: string | { name?: string } }[] }
    ) => {
      if (!cartVariant) return false;
      if (cartVariant.sku && variant.sku === cartVariant.sku) return true;
      const cartCombo = cartVariant.combination;
      if (!Array.isArray(cartCombo) || !cartCombo.length) return false;
      return (
        Array.isArray(variant.combination) &&
        variant.combination.every((c) =>
          cartCombo.some(
            (cc) =>
              cc.name === c.name &&
              normalizeOptionValue(cc.value) === normalizeOptionValue(c.value)
          )
        )
      );
    };

    // Merge cart items with product data
    const cartProductsWithDetails = cartItems.map(cartItem => {
      const matchingProduct = productsData.find(
        p => p.id === cartItem.productId || p.docId === cartItem.productId
      );
      
      if (!matchingProduct) return null;

      // Handle products without variants
      if (!matchingProduct.variantDetails || matchingProduct.variantDetails.length === 0) {
        const currentInventory = matchingProduct.quantity ?? 0;
        const outOfStock = currentInventory < cartItem.quantity;
        
        return {
          ...matchingProduct,
          quantity: cartItem.quantity,
          currentInventory,
          outOfStock,
          variantDetails: {
            price: matchingProduct.productPrice,
            discountedPrice: matchingProduct.productDiscountedPrice,
            inventory: matchingProduct.quantity,
            sku: matchingProduct.skuId,
            combination: []
          }
        };
      }

      // Handle products with variants
      const variant = matchingProduct.variantDetails.find(v =>
        variantMatchesCart(v, cartItem.variantDetails)
      );

      const currentInventory = variant?.inventory ?? 0;
      const outOfStock = currentInventory < cartItem.quantity;
      const cartVariant = cartItem.variantDetails;
      const resolved = variant || cartVariant;

      return {
        ...matchingProduct,
        quantity: cartItem.quantity,
        variantDetails: {
          ...(resolved || {}),
          price:
            Number(resolved?.price) ||
            Number(matchingProduct.productPrice) ||
            0,
          discountedPrice:
            Number(resolved?.discountedPrice) ||
            Number(resolved?.price) ||
            Number(matchingProduct.productDiscountedPrice) ||
            Number(matchingProduct.productPrice) ||
            0,
          combination:
            variant?.combination || cartVariant?.combination || [],
          sku: resolved?.sku || cartVariant?.sku,
          inventory: variant?.inventory ?? cartVariant?.inventory,
        },
        currentInventory,
        outOfStock
      };
    }).filter(Boolean) as CartReturn[];

    return cartProductsWithDetails;

  } catch (error) {
    console.error("Error fetching cart products:", error);
    return [];
  }
}

/**
 * Does a stored cart line item correspond to (productId, variantSku)?
 * Non-variant items are stored without a variant sku, so they match by
 * productId only; variant items also require the sku to match. Shared by
 * updateCartItem and removeCartItem so both identify items the same way.
 */
const cartItemMatches = (
  product: StoredCartLine,
  productId: string,
  variantSku?: string | null
): boolean => {
  if (product.productId !== productId) return false;
  const existingSku = cartLineSku(product.variantDetails);
  // Non-variant lines are stored without a sku; UI may still pass product.skuId.
  if (!existingSku) return true;
  if (!variantSku) return true;
  return existingSku === String(variantSku).trim();
};

export const removeCartItem = async (productId: string, variantSku?: string | null) => {
  try {
    const target = resolveCartTarget();
    if (!target?.cartId) {
      console.error("No cart ID found - user not logged in and no guest cart");
      throw new Error("Cart not found");
    }

    const cartRef = doc(db, target.collectionName, target.cartId);
    const cartSnapshot = await getDoc(cartRef);

    if (!cartSnapshot.exists()) {
      console.error(`Cart document ${target.cartId} doesn't exist`);
      throw new Error("Cart not found");
    }

    const { products = [] } = cartSnapshot.data() as CartData;

    // Keep every item that does NOT match the one being removed.
    const updatedProducts = products.filter(
      (product) => !cartItemMatches(product, productId, variantSku)
    );

    if (products.length === updatedProducts.length) {
      console.warn(
        `Product not found in cart - ID: ${productId}, SKU: ${variantSku || 'none'}`
      );
      return false; // Indicate no item was removed
    }

    await updateDoc(cartRef, {
      products: updatedProducts,
      updatedAt: serverTimestamp(), // Use server timestamp for consistency
    });

    console.log(`Successfully removed product ${productId}${variantSku ? ` (variant: ${variantSku})` : ''}`);
    return true; // Indicate successful removal
  } catch (error) {
    console.error("Failed to remove cart item:", error);
    throw error;
  }
};

export const updateCartItem = async (
  updates: {
    productId: string;
    variantSku?: string | null; // Made optional for non-variant products
    quantity: number;
  }[]
) => {
  try {
    const target = resolveCartTarget();
    if (!target?.cartId) {
      console.error("No cart ID found - user not logged in and no guest cart");
      throw new Error("Cart not found");
    }

    const cartRef = doc(db, target.collectionName, target.cartId);
    const cartSnapshot = await getDoc(cartRef);

    if (!cartSnapshot.exists()) {
      console.error(`Cart document ${target.cartId} doesn't exist`);
      throw new Error("Cart not found");
    }

    const { products: existingProducts = [] } = cartSnapshot.data() as CartData;
    const updatedProducts = [...existingProducts];

    updates.forEach(({ productId, variantSku, quantity }) => {
      const line = updatedProducts.find((p) =>
        cartItemMatches(p, productId, variantSku)
      );
      if (line) {
        line.quantity = quantity;
      } else {
        console.warn(
          `Cart item not found for update: productId=${productId}, sku=${variantSku ?? "(none)"}`
        );
      }
    });

    // Filter out any products with quantity <= 0 and collapse duplicates
    const filteredProducts = dedupeCartLines(
      updatedProducts.filter((p) => (p.quantity || 0) > 0)
    );

    await updateDoc(cartRef, {
      products: filteredProducts,
      updatedAt: serverTimestamp(), // Better to use server timestamp
    });

    console.log(`Successfully updated ${updates.length} cart items`);
    return filteredProducts; // Return the updated cart items
  } catch (error) {
    console.error("Failed to update cart items:", error);
    throw error; // Re-throw for error handling upstream
  }
};

export const getColorsByCategory = async (
  categoryId: string
): Promise<{ color: { name: string; hex: string }; count: number }[]> => {
  try {
    // First, get the category document
    const categoryQuery = query(
      collection(db, "categories"),
      where("id", "==", categoryId)
    );
    const categorySnapshot = await getDocs(categoryQuery);

    if (categorySnapshot.empty) {
      console.log("Category not found.");
      return [];
    }

    const categoryData = categorySnapshot.docs[0].data();
    const subCategories = categoryData?.subCategories || [];
    
    // Create an array of all relevant category IDs (main category + subcategories)
    const allCategoryIds = [categoryId, ...subCategories];

    // Create a query for each category ID using array-contains
    const queryPromises = allCategoryIds.map(categoryId => 
      getDocs(query(
        collection(db, "products"),
        where("categories", "array-contains", categoryId),
        where("active", "==", true),
      ))
    );

    // Execute all queries in parallel
    const productsSnapshots = await Promise.all(queryPromises);
    
    // Combine all products
    const allProducts = productsSnapshots.flatMap(snapshot => 
      snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product))
    );
    
    // Remove duplicates (in case a product belongs to multiple subcategories)
    const uniqueProducts = [...new Map(allProducts.map(item => [item.id, item])).values()];

    // Create a map to track color counts and first encountered hex value
    const colorCounts = new Map<string, {
      color: { name: string; hex: string };
      count: number;
    }>();

    uniqueProducts.forEach((product) => {
      const productColorNames = new Set<string>();

      // Helper function to process color objects
      const processColor = (colorObj: { name: string; hex: string }) => {
        if (!colorObj?.name) return;
        
        const colorName = colorObj.name.toLowerCase();
        productColorNames.add(colorName);
        
        // Store the first encountered hex for this color name
        if (!colorCounts.has(colorName)) {
          colorCounts.set(colorName, {
            color: {
              name: colorObj.name,
              hex: colorObj.hex || '#000000' // default if hex missing
            },
            count: 0
          });
        }
      };

      // Check variants for colors
      product.variants?.forEach((variant) => {
        if (
          variant.optionName?.toLowerCase() === "color" &&
          Array.isArray(variant.optionValue)
        ) {
          variant.optionValue.forEach((c) =>
            processColor({ name: c, hex: "#000000" })
          );
        }
      });

      // Check variantDetails for colors
      product.variantDetails?.forEach((detail) => {
        detail.combination?.forEach((combo) => {
          if (combo.name?.toLowerCase() === "color" && combo?.value) {
            processColor({ name: combo.value, hex: "#000000" });
          }
        });
      });

      // Increment counts for each unique color name in this product
      productColorNames.forEach(colorName => {
        const colorData = colorCounts.get(colorName);
        if (colorData) colorData.count++;
      });
    });

    // Convert the map to an array of objects sorted by count (descending)
    return Array.from(colorCounts.values())
      .sort((a, b) => b.count - a.count);
  } catch (error) {
    console.error("Error fetching colors by category:", error);
    return [];
  }
};


export const getSizesByCategory = async (
  categoryId: string
): Promise<{ size: string; count: number }[]> => {

  console.log(categoryId)
  try {
    // First, get the category document
    const categoryQuery = query(
      collection(db, "categories"),
      where("id", "==", categoryId)
    );
    const categorySnapshot = await getDocs(categoryQuery);

    if (categorySnapshot.empty) {
      console.log("Category not found.");
      return [];
    }

    const categoryData = categorySnapshot.docs[0].data();
    const subCategories = categoryData?.subCategories || [];
    
    // Create an array of all relevant category IDs (main category + subcategories)
    const allCategoryIds = [categoryId, ...subCategories];

    // Create a query for each category ID using array-contains
    const queryPromises = allCategoryIds.map(categoryId => 
      getDocs(query(
        collection(db, "products"),
        where("categories", "array-contains", categoryId),
      ))
    );

    // Execute all queries in parallel
    const productsSnapshots = await Promise.all(queryPromises);
    
    // Combine all products
    const allProducts = productsSnapshots.flatMap(snapshot => 
      snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product))
    );


 
    
    // Remove duplicates (in case a product belongs to multiple subcategories)
    const uniqueProducts = [...new Map(allProducts.map(item => [item.id, item])).values()];

    // Create a map to count occurrences of each size
    const sizeCounts = new Map<string, number>();

    uniqueProducts.forEach((product) => {
      // Track sizes we've already counted for this product to avoid double-counting
      const productSizes = new Set<string>();

      // Check variants for sizes
      product.variants?.forEach((variant) => {
      
        if (
          variant.optionName?.toLowerCase() === "size" &&
          Array.isArray(variant.optionValue)
        ) {
          variant.optionValue.forEach((sizeValue) => {
       
              productSizes.add(sizeValue);
            
          });
        }
      });

      // Check variantDetails for sizes
      product.variantDetails?.forEach((detail) => {
        detail.combination?.forEach((combo) => {
          if (
            combo.name?.toLowerCase() === "size" 
          ) {
            productSizes.add(combo.value);
          }
        });
      });

      // Check the sizes array directly (if it exists)
      if (Array.isArray(product.sizes)) {
        product.sizes.forEach(size => {
          if (size) productSizes.add(size);
        });
      }

      // Update counts for each unique size in this product
      productSizes.forEach(size => {
        sizeCounts.set(size, (sizeCounts.get(size) || 0) + 1);
      });
    });

    // Convert the map to an array of objects and sort by size
    const sizesArray = Array.from(sizeCounts.entries())
      .map(([size, count]) => ({ size, count }))
      .sort((a, b) => {
        // Try to sort numerically if possible
        const aNum = parseFloat(a.size);
        const bNum = parseFloat(b.size);
        
        if (!isNaN(aNum) && !isNaN(bNum)) {
          return aNum - bNum;
        }
        
        // Fallback to alphabetical sorting
        return a.size.localeCompare(b.size);
      });

    return sizesArray;
  } catch (error) {
    console.error("Error fetching sizes by category:", error);
    return [];
  }
};
export const getMinMaxPriceByCategory = async (
  categoryId: string
): Promise<{ minPrice: number | null; maxPrice: number | null }> => {
  let minPrice: number | null = null;
  let maxPrice: number | null = null;

  try {
    // First, get the category document
    const categoryQuery = query(
      collection(db, "categories"),
      where("id", "==", categoryId)
    );
    const categorySnapshot = await getDocs(categoryQuery);

    if (categorySnapshot.empty) {
      console.log("Category not found.");
      return { minPrice, maxPrice };
    }

    const categoryData = categorySnapshot.docs[0].data();
    const subCategories = categoryData?.subCategories || [];
    
    // Create an array of all relevant category IDs (main category + subcategories)
    const allCategoryIds = [categoryId, ...subCategories];

    // Create a query for each category ID using array-contains
    const queryPromises = allCategoryIds.map(categoryId => 
      getDocs(query(
        collection(db, "products"),
        where("categories", "array-contains", categoryId)
      ))
    );

    // Execute all queries in parallel
    const productsSnapshots = await Promise.all(queryPromises);
    
    // Combine all products
    const allProducts = productsSnapshots.flatMap(snapshot => 
      snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product))
    );
    
    // Remove duplicates (in case a product belongs to multiple subcategories)
    const uniqueProducts = [...new Map(allProducts.map(item => [item.id, item])).values()];

    // Calculate min and max prices
    uniqueProducts.forEach((product) => {
      // Consider both original price and discounted price
      const pricesToConsider = [
        product.productDiscountedPrice,
      ].filter(price => typeof price === "number") as number[];

      pricesToConsider.forEach((price) => {
        if (minPrice === null || price < minPrice) {
          minPrice = price;
        }
        if (maxPrice === null || price > maxPrice) {
          maxPrice = price;
        }
      });

      // Also consider prices in variantDetails
      product.variantDetails?.forEach((detail) => {
        const variantPrices = [
          detail.discountedPrice
        ].filter(price => typeof price === "number") as number[];

        variantPrices.forEach((price) => {
          if (minPrice === null || price < minPrice) {
            minPrice = price;
          }
          if (maxPrice === null || price > maxPrice) {
            maxPrice = price;
          }
        });
      });
    });

    return { minPrice, maxPrice };
  } catch (error) {
    console.error("Error fetching min/max price by category:", error);
    return { minPrice: null, maxPrice: null };
  }
};
