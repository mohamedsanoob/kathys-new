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
  where,
  DocumentSnapshot,
  serverTimestamp,
} from "firebase/firestore";
import { withCache } from "@/lib/cache";
import { toIsoString, toMillis } from "@/lib/dates";

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
        createdDate: toIsoString(createdDate),
        updatedDate: toIsoString(updatedDate),
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
        createdDate: toIsoString(createdDate),
        updatedDate: toIsoString(updatedDate),
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
> => withCache("collectionsWithProducts:v5", 5 * 60 * 1000, async () => {
  const mapCat = (docSnap: { id: string; data: () => Record<string, any> }) => {
    const data = docSnap.data();
    return {
      ...data,
      id: docSnap.id,
      categoryName: data.categoryName,
      description: data.description,
      active: data.active,
      desktopBanner: data.desktopBanner,
      images: data.images || [],
      isSubcategory: data.isSubcategory,
      slug: data.slug,
      mobileBanner: data.mobileBanner,
    } as Category;
  };

  const pickTop = (docs: { id: string; data: () => Record<string, any> }[]) =>
    docs
      .map(mapCat)
      .filter((c) => !c.isSubcategory && typeof (c as any).order === "number")
      .sort((a, b) => {
        const ao = (a as any).order as number;
        const bo = (b as any).order as number;
        if (ao !== bo) return ao - bo;
        return (a.categoryName || "").localeCompare(b.categoryName || "");
      })
      .slice(0, 4);

  // Prefer indexed query — fall back to full scan if the composite index is missing.
  let categories: Category[] = [];
  try {
    const orderedSnap = await getDocs(
      query(
        collection(db, "categories"),
        where("active", "==", true),
        orderBy("order", "asc"),
        limit(24)
      )
    );
    categories = pickTop(orderedSnap.docs);
  } catch {
    /* index may be missing locally / before deploy */
  }

  if (categories.length === 0) {
    const categoriesSnapshot = await getDocs(
      query(collection(db, "categories"), where("active", "==", true))
    );
    categories = pickTop(categoriesSnapshot.docs);
  }

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
      const products: Product[] = productsSnapshot.docs.map((docSnap) => {
        const data = docSnap.data();
        return {
          id: docSnap.id,
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
          position: data?.position,
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
        images: category?.images || [],
        isSubcategory: category?.isSubcategory,
        slug: category?.slug,
        mobileBanner: category?.mobileBanner,
        products,
      };
    })
  );

  return collectionsWithProducts;
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
    const categoriesQuery = query(
      collection(db, "categories"),
      where("active", "==", true)
    );

    const querySnapshot = await getDocs(categoriesQuery);

    const categories = querySnapshot.docs.map((docSnap) => ({
      ...docSnap.data(),
      id: docSnap.id,
    })) as Category[];

    // Sort in memory so docs missing `order` are not dropped by orderBy.
    return categories.sort((a, b) => {
      const ao = typeof (a as any).order === "number" ? (a as any).order : Infinity;
      const bo = typeof (b as any).order === "number" ? (b as any).order : Infinity;
      if (ao !== bo) return ao - bo;
      return (a.categoryName || "").localeCompare(b.categoryName || "");
    });
  });

export const getCategoryById = async (
  id: string
): Promise<Category | null> =>
  withCache(`category-${id}`, 5 * 60 * 1000, async () => {
    const querySnapshot = await getDocs(
      query(
        collection(db, "categories"),
        where("id", "==", id),
        where("active", "==", true)
      )
    );

    if (querySnapshot.empty) return null;

    const docSnap = querySnapshot.docs[0];
    const categoryData = docSnap.data() as Category;
    return { ...categoryData, id: docSnap.id };
  });


export const getUserAddresses = async (
  userId?: string
): Promise<Address[]> => {
  try {
    // Always bind to the signed-in user — ignore mismatched client-supplied ids.
    const uid = auth.currentUser?.uid;
    if (!uid) return [];
    if (userId && userId !== uid) {
      console.warn("getUserAddresses: ignoring mismatched userId");
    }

    const addressesRef = collection(db, "users", uid, "addresses");
    const querySnapshot = await getDocs(addressesRef);
    if (querySnapshot.empty) return [];

    return querySnapshot.docs.map((docSnap) => ({
      id: docSnap.id,
      ...(docSnap.data() as Omit<Address, "id">),
    }));
  } catch (error) {
    console.error("Error fetching user addresses:", error);
    return [];
  }
};

export const getUserOrders = async (userId?: string): Promise<Order[]> => {
  try {
    const uid = auth.currentUser?.uid;
    if (!uid) return [];
    if (userId && userId !== uid) {
      console.warn("getUserOrders: ignoring mismatched userId");
    }

    const ordersRef = collection(db, "users", uid, "orders");
    const querySnapshot = await getDocs(ordersRef);
    if (querySnapshot.empty) return [];

    const orders = querySnapshot.docs.map((docSnap) => ({
      id: docSnap.id,
      ...(docSnap.data() as Omit<Order, "id">),
    }));

    // Newest first (createdAt or timestamp).
    return orders.sort((a, b) => {
      const aMs =
        (a as any).createdAt?.seconds ||
        (a as any).timestamp?.seconds ||
        0;
      const bMs =
        (b as any).createdAt?.seconds ||
        (b as any).timestamp?.seconds ||
        0;
      return bMs - aMs;
    });
  } catch (error) {
    console.error("Error fetching user orders:", error);
    return [];
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
  colorFilter?: string,
  sizeFilter?: string[]
): Promise<{
  products: Product[];
  categories?: Record<string, any>;
  totalCount: number;
  lastVisible: DocumentSnapshot | null;
  hasMore: boolean;
}> => {
  const categoryQuery = query(
    collection(db, "categories"),
    where("id", "==", categoryId),
    where("active", "==", true)
  );
  const categorySnapshot = await getDocs(categoryQuery);

  if (categorySnapshot.empty) {
    return {
      products: [],
      totalCount: 0,
      lastVisible: null,
      hasMore: false,
    };
  }

  const categoryData = categorySnapshot.docs[0].data();
  const subCategories = categoryData?.subCategories || [];
  const allCategoryIds = [categoryId, ...subCategories];
  const chunkSize = 10;

  const matchesFilters = (product: Product) => {
    let colorMatch = true;
    let sizeMatch = true;

    if (colorFilter) {
      const filterValue = colorFilter.toLowerCase().trim();
      colorMatch =
        product.variantDetails?.some((variant) =>
          variant.combination?.some((combo) => {
            if (!combo?.name || !combo?.value) return false;
            if (combo.name.toLowerCase().trim() !== "color") return false;
            const variantValue = combo.value.toLowerCase().trim();
            return (
              variantValue === filterValue || variantValue.includes(filterValue)
            );
          })
        ) ?? false;
    }

    if (sizeFilter && sizeFilter.length > 0) {
      sizeMatch =
        product.variantDetails?.some((variant) =>
          variant.combination?.some(
            (combo) =>
              combo.name?.toLowerCase() === "size" &&
              sizeFilter.includes(combo.value)
          )
        ) || false;
    }

    return colorMatch && sizeMatch;
  };

  const sortProducts = (list: Product[]) => {
    switch (sortBy) {
      case "price-low":
        list.sort(
          (a, b) =>
            (a.productDiscountedPrice || 0) - (b.productDiscountedPrice || 0)
        );
        break;
      case "price-high":
        list.sort(
          (a, b) =>
            (b.productDiscountedPrice || 0) - (a.productDiscountedPrice || 0)
        );
        break;
      case "latest":
      default:
        list.sort(
          (a, b) =>
            (toMillis(b.createdDate) || 0) - (toMillis(a.createdDate) || 0)
        );
        break;
    }
    return list;
  };

  const buildChunkQuery = (chunk: string[], cursor: DocumentSnapshot | null) => {
    let chunkQuery = query(
      collection(db, "products"),
      where("categories", "array-contains-any", chunk),
      where("active", "==", true),
      orderBy("position", "asc")
    );

    if (minPrice !== undefined && maxPrice !== undefined) {
      chunkQuery = query(
        chunkQuery,
        where("productDiscountedPrice", ">=", minPrice),
        where("productDiscountedPrice", "<=", maxPrice)
      );
    }

    switch (sortBy) {
      case "price-low":
        chunkQuery = query(
          chunkQuery,
          orderBy("productDiscountedPrice", "asc")
        );
        break;
      case "price-high":
        chunkQuery = query(
          chunkQuery,
          orderBy("productDiscountedPrice", "desc")
        );
        break;
      case "latest":
      default:
        chunkQuery = query(chunkQuery, orderBy("createdDate", "desc"));
        break;
    }

    return query(
      chunkQuery,
      limit(limitNumber),
      ...(cursor ? [startAfter(cursor)] : [])
    );
  };

  // Color/size are applied in memory — keep paging Firestore until we fill
  // a page or the source is exhausted (avoids early hasMore=false).
  const hasClientFilters = Boolean(colorFilter) || Boolean(sizeFilter?.length);
  const maxRounds = hasClientFilters ? 8 : 1;

  let cursor = lastVisibleDoc;
  let collected: Product[] = [];
  const seenIds = new Set<string>();
  let firestoreMayHaveMore = false;
  let lastVisible: DocumentSnapshot | null = lastVisibleDoc;
  const docsById = new Map<string, DocumentSnapshot>();

  for (let round = 0; round < maxRounds && collected.length < limitNumber; round++) {
    const queryPromises = [];
    for (let i = 0; i < allCategoryIds.length; i += chunkSize) {
      const chunk = allCategoryIds.slice(i, i + chunkSize);
      queryPromises.push(getDocs(buildChunkQuery(chunk, cursor)));
    }

    const productsSnapshots = await Promise.all(queryPromises);
    firestoreMayHaveMore = productsSnapshots.some(
      (snap) => snap.docs.length >= limitNumber
    );

    docsById.clear();
    for (const snap of productsSnapshots) {
      for (const d of snap.docs) docsById.set(d.id, d);
    }

    if (docsById.size === 0) {
      firestoreMayHaveMore = false;
      break;
    }

    let batch = [...docsById.values()].map(
      (d) => ({ id: d.id, ...d.data() } as Product)
    );
    batch = sortProducts(batch.filter(matchesFilters));

    for (const product of batch) {
      if (seenIds.has(product.id)) continue;
      seenIds.add(product.id);
      collected.push(product);
      if (collected.length >= limitNumber) break;
    }

    // Advance cursor from the primary (first) chunk when possible; otherwise
    // from the last doc of the last product we accepted.
    const primarySnap = productsSnapshots[0];
    if (primarySnap?.docs?.length) {
      lastVisible = primarySnap.docs[primarySnap.docs.length - 1];
    } else if (collected.length > 0) {
      lastVisible =
        docsById.get(collected[collected.length - 1].id) || lastVisible;
    }
    cursor = lastVisible;

    if (!firestoreMayHaveMore) break;
  }

  const products = collected.slice(0, limitNumber);

  // Approximate total (price-scoped, not color/size).
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
    categories: categoryData,
    totalCount,
    lastVisible: products.length > 0 ? lastVisible : null,
    hasMore: firestoreMayHaveMore,
  };
};

export const getProductById = async (
  productId: string
): Promise<Product | null> =>
  withCache(`product-${productId}`, 2 * 60 * 1000, async () => {
    const productRef = doc(db, "products", productId);
    const productSnap = await getDoc(productRef);

    if (productSnap.exists()) {
      return { ...(productSnap.data() as Product), id: productSnap.id };
    }
    return null;
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
    console.log("coming inside",variantDetails,productId,quantity);
    const user = auth.currentUser;
    const isLoggedIn = user && !user.isAnonymous;

    const cartId = isLoggedIn
      ? user.uid
      : localStorage.getItem("guestCartId") || crypto.randomUUID();

    if (!isLoggedIn) {
      localStorage.setItem("guestCartId", cartId);
    }

    const cartRef = doc(db, `${isLoggedIn ? "" : "guest-"}carts`, cartId);
    const cartSnapshot = await getDoc(cartRef);

    if (!cartSnapshot.exists()) {
      await setDoc(cartRef, {
        userId: isLoggedIn ? cartId : null,
        products: [variantDetails !==undefined ? { productId, quantity, variantDetails }:{ productId, quantity }],
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      return;
    }




    const { products } = cartSnapshot.data() as CartData;
        console.log(products,variantDetails,"adwsdc",productId)
    const existingProductIndex = products.findIndex(
      (p) => 
       variantDetails !==undefined ? p.productId === productId &&  p.variantDetails?.sku===variantDetails?.sku :
        p.productId === productId 
    );





    let newQuantity;
    if (existingProductIndex >= 0) {
      newQuantity = products[existingProductIndex].quantity + quantity;
    } else {
      newQuantity = quantity;
    }

    const updatedProducts =
      existingProductIndex >= 0
        ? products.map((product, index) =>
            index === existingProductIndex
              ? { ...product, quantity: newQuantity }
              : product
          )
        : [...products,   variantDetails !==undefined ? { productId, quantity, variantDetails }:{ productId, quantity }];

    console.log(updatedProducts, "updatedProducts");

    await updateDoc(cartRef, {
      products: updatedProducts,
      updatedAt: new Date(),
    });
  } catch (error) {
    console.error("Error managing cart:", error);
    throw error;
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
  const user = auth.currentUser;
  const cartId = user?.uid || localStorage.getItem("guestCartId");

  if (!cartId) return [];

  try {
    const isGuest = !user || user.isAnonymous;
    const cartRef = doc(db, `${isGuest ? "guest-" : ""}carts`, cartId);
    const cartSnapshot = await getDoc(cartRef);
    
    if (!cartSnapshot.exists()) return [];
    
    const cartItems: CartProduct[] = cartSnapshot.data()?.products || [];
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
  product: { productId?: string; variantDetails?: { sku?: string } },
  productId: string,
  variantSku?: string | null
): boolean => {
  if (product.productId !== productId) return false;
  if (!product.variantDetails?.sku) return true;
  return product.variantDetails.sku === variantSku;
};

export const removeCartItem = async (productId: string, variantSku?: string | null) => {
  try {
    const user = auth.currentUser;
    const cartId = user?.uid || localStorage.getItem("guestCartId");

    if (!cartId) {
      console.error("No cart ID found - user not logged in and no guest cart");
      throw new Error("Cart not found");
    }

    const isGuest = !user || user.isAnonymous;
    const cartRef = doc(db, `${isGuest ? "guest-" : ""}carts`, cartId);
    const cartSnapshot = await getDoc(cartRef);

    if (!cartSnapshot.exists()) {
      console.error(`Cart document ${cartId} doesn't exist`);
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
    const user = auth.currentUser;
    const cartId = user?.uid || localStorage.getItem("guestCartId");

    if (!cartId) {
      console.error("No cart ID found - user not logged in and no guest cart");
      throw new Error("Cart not found");
    }

    const isGuest = !user || user.isAnonymous;
    const cartRef = doc(db, `${isGuest ? "guest-" : ""}carts`, cartId);
    const cartSnapshot = await getDoc(cartRef);

    if (!cartSnapshot.exists()) {
      console.error(`Cart document ${cartId} doesn't exist`);
      throw new Error("Cart not found");
    }

    const { products: existingProducts = [] } = cartSnapshot.data() as CartData;
    const updatedProducts = [...existingProducts];

    updates.forEach(({ productId, variantSku, quantity }) => {
      const target = updatedProducts.find((p) =>
        cartItemMatches(p, productId, variantSku)
      );
      if (target) {
        target.quantity = quantity;
      } else {
        console.warn(
          `Cart item not found for update: productId=${productId}, sku=${variantSku ?? "(none)"}`
        );
      }
    });

    // Filter out any products with quantity <= 0
    const filteredProducts = updatedProducts.filter(p => p.quantity > 0);

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

/** Fetch category + subcategory products once (cached). Previously colors /
 *  sizes / price each re-downloaded the full set — 3× the reads & latency. */
async function fetchCategoryProductsForFacets(
  categoryId: string,
  onlyActive: boolean
): Promise<Product[]> {
  return withCache(
    `facet-products-${categoryId}-${onlyActive ? "active" : "all"}`,
    5 * 60 * 1000,
    async () => {
      const categoryQuery = query(
        collection(db, "categories"),
        where("id", "==", categoryId)
      );
      const categorySnapshot = await getDocs(categoryQuery);
      if (categorySnapshot.empty) return [];

      const categoryData = categorySnapshot.docs[0].data();
      const subCategories = (categoryData?.subCategories as string[]) || [];
      const allCategoryIds = [categoryId, ...subCategories];

      const productsSnapshots = await Promise.all(
        allCategoryIds.map((id) => {
          const constraints = [
            where("categories", "array-contains", id),
            ...(onlyActive ? [where("active", "==", true)] : []),
          ];
          return getDocs(query(collection(db, "products"), ...constraints));
        })
      );

      const allProducts = productsSnapshots.flatMap((snapshot) =>
        snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Product))
      );
      return [...new Map(allProducts.map((item) => [item.id, item])).values()];
    }
  );
}

function deriveColorsFromProducts(
  products: Product[]
): { color: { name: string; hex: string }; count: number }[] {
  const colorCounts = new Map<
    string,
    { color: { name: string; hex: string }; count: number }
  >();

  products.forEach((product) => {
    const productColorNames = new Set<string>();
    const processColor = (colorObj: { name: string; hex: string }) => {
      if (!colorObj?.name) return;
      const colorName = colorObj.name.toLowerCase();
      productColorNames.add(colorName);
      if (!colorCounts.has(colorName)) {
        colorCounts.set(colorName, {
          color: { name: colorObj.name, hex: colorObj.hex || "#000000" },
          count: 0,
        });
      }
    };

    product.variants?.forEach((variant) => {
      if (
        variant.optionName?.toLowerCase() === "color" &&
        Array.isArray(variant.optionValue)
      ) {
        variant.optionValue.forEach((c) =>
          processColor({ name: c as string, hex: "#000000" })
        );
      }
    });

    product.variantDetails?.forEach((detail) => {
      detail.combination?.forEach((combo) => {
        if (combo.name?.toLowerCase() === "color" && combo?.value) {
          processColor({ name: combo.value, hex: "#000000" });
        }
      });
    });

    productColorNames.forEach((colorName) => {
      const colorData = colorCounts.get(colorName);
      if (colorData) colorData.count++;
    });
  });

  return Array.from(colorCounts.values()).sort((a, b) => b.count - a.count);
}

function deriveSizesFromProducts(
  products: Product[]
): { size: string; count: number }[] {
  const sizeCounts = new Map<string, number>();

  products.forEach((product) => {
    const productSizes = new Set<string>();
    product.variants?.forEach((variant) => {
      if (
        variant.optionName?.toLowerCase() === "size" &&
        Array.isArray(variant.optionValue)
      ) {
        variant.optionValue.forEach((sizeValue) => {
          productSizes.add(sizeValue as string);
        });
      }
    });
    product.variantDetails?.forEach((detail) => {
      detail.combination?.forEach((combo) => {
        if (combo.name?.toLowerCase() === "size") {
          productSizes.add(combo.value);
        }
      });
    });
    if (Array.isArray(product.sizes)) {
      product.sizes.forEach((size) => {
        if (size) productSizes.add(size);
      });
    }
    productSizes.forEach((size) => {
      sizeCounts.set(size, (sizeCounts.get(size) || 0) + 1);
    });
  });

  return Array.from(sizeCounts.entries())
    .map(([size, count]) => ({ size, count }))
    .sort((a, b) => {
      const aNum = parseFloat(a.size);
      const bNum = parseFloat(b.size);
      if (!isNaN(aNum) && !isNaN(bNum)) return aNum - bNum;
      return a.size.localeCompare(b.size);
    });
}

function derivePriceFromProducts(products: Product[]): {
  minPrice: number | null;
  maxPrice: number | null;
} {
  let minPrice: number | null = null;
  let maxPrice: number | null = null;

  products.forEach((product) => {
    const prices = [product.productDiscountedPrice].filter(
      (price) => typeof price === "number"
    ) as number[];
    prices.forEach((price) => {
      if (minPrice === null || price < minPrice) minPrice = price;
      if (maxPrice === null || price > maxPrice) maxPrice = price;
    });
    product.variantDetails?.forEach((detail) => {
      const variantPrices = [detail.discountedPrice].filter(
        (price) => typeof price === "number"
      ) as number[];
      variantPrices.forEach((price) => {
        if (minPrice === null || price < minPrice) minPrice = price;
        if (maxPrice === null || price > maxPrice) maxPrice = price;
      });
    });
  });

  return { minPrice, maxPrice };
}

export type CategoryFacets = {
  colors: { color: { name: string; hex: string }; count: number }[];
  sizes: { size: string; count: number }[];
  price: { minPrice: number | null; maxPrice: number | null };
};

/** Single fetch for filter UI — colors + sizes + price from one product set. */
export const getFacetsByCategory = async (
  categoryId: string
): Promise<CategoryFacets> =>
  withCache(`facets-${categoryId}`, 5 * 60 * 1000, async () => {
    try {
      // Colors historically filtered active-only; sizes/price included inactive.
      // Fetch both once each (cached) rather than three full downloads.
      const [activeProducts, allProducts] = await Promise.all([
        fetchCategoryProductsForFacets(categoryId, true),
        fetchCategoryProductsForFacets(categoryId, false),
      ]);
      return {
        colors: deriveColorsFromProducts(activeProducts),
        sizes: deriveSizesFromProducts(allProducts),
        price: derivePriceFromProducts(allProducts),
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

export const getColorsByCategory = async (
  categoryId: string
): Promise<{ color: { name: string; hex: string }; count: number }[]> => {
  const facets = await getFacetsByCategory(categoryId);
  return facets.colors;
};

export const getSizesByCategory = async (
  categoryId: string
): Promise<{ size: string; count: number }[]> => {
  const facets = await getFacetsByCategory(categoryId);
  return facets.sizes;
};

export const getMinMaxPriceByCategory = async (
  categoryId: string
): Promise<{ minPrice: number | null; maxPrice: number | null }> => {
  const facets = await getFacetsByCategory(categoryId);
  return facets.price;
};
