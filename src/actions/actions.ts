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
} from "firebase/firestore";

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



interface Combination {
  name: string;
  value: string;
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
}

export const getCollectionsWithProducts = async (): Promise<
  {
    id: string;
    categoryName: string;
    description: string;
    products: Product[];
  }[]
> => {
  try {
    const categoriesSnapshot = await getDocs(collection(db, "categories"));
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
            shippingCost: data.shippingCost,
            skuId: data.skuId,
            createdDate: data.createdDate,
            updatedDate: data.updatedDate,
          } as Product;
        });

        return {
          id: category.id,
          categoryName: category.categoryName,
          description: category.description,
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
};

export const getCategoryByName = async (
  categoryName: string
): Promise<Category | null> => {
  try {
    const querySnapshot = await getDocs(
      query(
        collection(db, "categories"),
        where("categoryName", "==", categoryName)
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
  categoryName: string,
  limitNumber: number,
  lastVisibleDoc: DocumentSnapshot | null = null,
  sortBy: string = "latest",
  minPrice?: number,
  maxPrice?: number,
  color?:string,
): Promise<{
  products: Product[];
  totalCount: number;
  lastVisible: DocumentSnapshot | null;
}> => {
  try {
    const categoryQuery = query(
      collection(db, "categories"),
      where("categoryName", "==", categoryName)
    );
    const categorySnapshot = await getDocs(categoryQuery);

    if (categorySnapshot.empty) {
      return { products: [], totalCount: 0, lastVisible: null };
    }

    const productIds = categorySnapshot.docs[0].data()?.products || [];
    if (!productIds.length) {
      return { products: [], totalCount: 0, lastVisible: null };
    }

    let productsQuery = query(
      collection(db, "products"),
     where("categories", "array-contains", categorySnapshot.docs[0].data()?.id )
    );
    

    // Apply price filter if minPrice and maxPrice are provided
    if (minPrice !== undefined && maxPrice !== undefined) {
      productsQuery = query(
        productsQuery,
        where("productDiscountedPrice", ">=", minPrice),
        where("productDiscountedPrice", "<=", maxPrice)
      );
    } 

    switch (sortBy) {
      case "latest":
        productsQuery = query(productsQuery, orderBy("createdDate", "desc"));
        break;
      case "price-low":
        productsQuery = query(
          productsQuery,
          orderBy("productDiscountedPrice", "asc")
        );
        break;
      case "price-high":
        productsQuery = query(
          productsQuery,
          orderBy("productDiscountedPrice", "desc")
        );
        break;
      default:
        productsQuery = query(productsQuery, orderBy("createdDate", "desc"));
    }

    productsQuery = query(
      productsQuery,
      limit(limitNumber),
      ...(lastVisibleDoc ? [startAfter(lastVisibleDoc)] : [])
    );

    const productsSnapshot = await getDocs(productsQuery);
    const products = productsSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Product[];

    // Recalculate total count based on filters
    let countQuery = query(
      collection(db, "products"),
  where("categories", "array-contains", categorySnapshot.docs[0].data()?.id )
    );
    if (minPrice !== undefined && maxPrice !== undefined) {
      countQuery = query(
        countQuery,
        where("productDiscountedPrice", ">=", minPrice),
        where("productDiscountedPrice", "<=", maxPrice)
      );
    } else if (minPrice !== undefined) {
      countQuery = query(
        countQuery,
        where("productDiscountedPrice", ">=", minPrice)
      );
    } else if (maxPrice !== undefined) {
      countQuery = query(
        countQuery,
        where("productDiscountedPrice", "<=", maxPrice)
      );
    }
    const countSnapshot = await getCountFromServer(countQuery);
    const totalCount = countSnapshot.data().count;

    return {
      products,
      totalCount,
      lastVisible:
        productsSnapshot.docs[productsSnapshot.docs.length - 1] || null,
    };
  } catch (error) {
    console.error("Error fetching products:", error);
    return { products: [], totalCount: 0, lastVisible: null };
  }
};

export const getProductById = async (
  productId: string
): Promise<Product | null> => {
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
};

export const getRelatedProducts = async (
  categoryValues: string[] // Array of category values
): Promise<Product[]> => {
  try {
    if (categoryValues.length === 0) {
      return []; // Return empty array if no categories are provided
    }

    console.log(categoryValues, "categoryValues");

    const productsCollection = collection(db, "products");
    const q = query(
      productsCollection,
      where("categories", "array-contains-any", categoryValues)
    );

    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map((doc) => {
      const productData = doc.data() as Product;
      console.log(productData, "product data");
      return { ...productData, id: doc.id };
    });
  } catch (error) {
    console.error("Error fetching products in categories:", error);
    return []; // Return empty array on error
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
    console.log("coming inside");
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
        products: [{ productId, quantity, variantDetails }],
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      return;
    }




    const { products } = cartSnapshot.data() as CartData;
        console.log(products,variantDetails,"adwsdc")
    const existingProductIndex = products.findIndex(
      (p) =>
       
        p.productId === productId &&
        JSON.stringify(p.variantDetails?.combination || []) ===
          JSON.stringify(variantDetails?.combination || [])
    );


    console.log(existingProductIndex, "existingProductIndex");

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
        : [...products, { productId, quantity, variantDetails }];

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

    // Fetch products
    const productsRef = collection(db, "products");
    const q = query(productsRef, where("id", "in", productIdsInCart));
    const productsSnapshot = await getDocs(q);
    
    const productsData = productsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Product[]; // Assuming you have a Product type

    // Merge cart items with product data
    const cartProductsWithDetails = cartItems.reduce((acc, cartItem) => {
      const matchingProduct = productsData.find(p => p.id === cartItem.productId);
      
      if (!matchingProduct) return acc;

      console.log(matchingProduct,cartItem,"------->matching")

      const variant = matchingProduct.variantDetails?.find(v => 
        v.sku === cartItem.variantDetails?.sku &&
        v.combination?.every((comb, index) => 
          comb.value === cartItem.variantDetails?.combination[index]?.value
        )
      );

      const currentInventory = variant?.inventory ?? 0;
      const outOfStock = currentInventory < cartItem.quantity;

      acc.push({
        ...matchingProduct,
        variantDetails:cartItem.variantDetails,

        quantity: cartItem.quantity,
        currentInventory,
        outOfStock
      });

      return acc;
    }, [] as CartReturn[]);

    return cartProductsWithDetails;

  } catch (error) {
    console.error("Error fetching cart products:", error);
    return [];
  }
}

export const removeCartItem = async (productId: string, variantSku: string) => {
  try {
    const user = auth.currentUser;
    const cartId = user?.uid || localStorage.getItem("guestCartId");

    if (!cartId) return;

    const isGuest = !user || user.isAnonymous;
    const cartRef = doc(db, `${isGuest ? "guest-" : ""}carts`, cartId);
    const cartSnapshot = await getDoc(cartRef);

    if (!cartSnapshot.exists()) {
      return;
    }

    const { products } = cartSnapshot.data() as CartData;
    const existingProductIndex = products.findIndex(
      (p) => p.productId === productId && p.variantDetails?.sku === variantSku
    );

    if (existingProductIndex < 0) {
      return;
    }

    const updatedProducts = products.filter(
      (product, index) => index !== existingProductIndex
    );

    await updateDoc(cartRef, {
      products: updatedProducts,
      updatedAt: new Date(),
    });
  } catch (error) {
    console.error("Error removing cart item:", error);
    throw error;
  }
};

export const updateCartItem = async (
  updates: { productId: string; variantSku: string; quantity: number }[]
) => {
  try {
    console.log("coming here to update multiple items");
    const user = auth.currentUser;
    const cartId = user?.uid || localStorage.getItem("guestCartId");

    if (!cartId) {
      console.log("No cart ID found.");
      return;
    }

    const isGuest = !user || user.isAnonymous;
    const cartRef = doc(db, `${isGuest ? "guest-" : ""}carts`, cartId);
    const cartSnapshot = await getDoc(cartRef);

    if (!cartSnapshot.exists()) {
      console.log(`Cart with ID ${cartId} not found.`);
      return;
    }

    const { products: existingProducts } = cartSnapshot.data() as CartData;
    const updatedProducts = [...existingProducts];

    updates.forEach(({ productId, variantSku, quantity }) => {
      const existingProductIndex = updatedProducts.findIndex(
        (p) => p.productId === productId && p.variantDetails?.sku === variantSku
      );

      if (existingProductIndex >= 0) {
        updatedProducts[existingProductIndex] = {
          ...updatedProducts[existingProductIndex],
          quantity: quantity,
        };
      } else {
        console.warn(
          `Product with ID ${productId} and SKU ${variantSku} not found in cart for update.`
        );
      }
    });

    console.log(updatedProducts, "updatedProducts after applying batch");

    await updateDoc(cartRef, {
      products: updatedProducts,
      updatedAt: new Date(),
    });
    console.log("Cart items updated successfully in batch.");
  } catch (error) {
    console.error("Error updating cart items in batch:", error);
    throw error;
  }
};

export const getColorsByCategory = async (
  categoryName: string
): Promise<string[]> => {
  try {
    const categoryDocSnapshot = await getDocs(
      query(
        collection(db, "categories"),
        where("categoryName", "==", categoryName)
      )
    );

    if (categoryDocSnapshot.empty) {
      console.log("Category not found.");
      return [];
    }

    const categoryData = categoryDocSnapshot.docs[0].data();
    const productIds = (categoryData?.products as string[]) || [];

    if (!productIds.length) {
      console.log("No product IDs in category.");
      return [];
    }

    const productsRef = collection(db, "products");
    const productsSnapshot = await getDocs(
      query(productsRef, where("__name__", "in", productIds))
    );

    const products = productsSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Product[];

    const colors = new Set<string>();

    products.forEach((product) => {
      product.variants?.forEach((variant) => {
        if (
          variant.optionName?.toLowerCase() === "color" &&
          Array.isArray(variant.optionValue)
        ) {
          variant.optionValue.forEach((colorValue) => {
            if (typeof colorValue === "string" && colorValue.startsWith("#")) {
              colors.add(colorValue);
            }
          });
        }
      });
      product.variantDetails?.forEach((detail) => {
        detail.combination?.forEach((combo) => {
          if (
            combo.name?.toLowerCase() === "color" &&
            typeof combo.value === "string" &&
            combo.value.startsWith("#")
          ) {
            colors.add(combo.value);
          }
        });
      });
    });

    return Array.from(colors);
  } catch (error) {
    console.error("Error fetching colors by category:", error);
    return [];
  }
};

export const getMinMaxPriceByCategory = async (
  categoryName: string
): Promise<{ minPrice: number | null; maxPrice: number | null }> => {
  let minPrice: number | null = null;
  let maxPrice: number | null = null;

  try {
    const categoryDocSnapshot = await getDocs(
      query(
        collection(db, "categories"),
        where("categoryName", "==", categoryName)
      )
    );

    if (categoryDocSnapshot.empty) {
      console.log("Category not found.");
      return { minPrice, maxPrice };
    }

    const categoryData = categoryDocSnapshot.docs[0].data();
    const productIds = (categoryData?.products as string[]) || [];

    if (!productIds.length) {
      console.log("No product IDs in category.");
      return { minPrice, maxPrice };
    }

    const productsRef = collection(db, "products");
    const productsSnapshot = await getDocs(
      query(productsRef, where("__name__", "in", productIds))
    );

    const products = productsSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Product[];

    products.forEach((product) => {
      // Consider both original price and discounted price
      const pricesToConsider = [
        product.productPrice,
        product.productDiscountedPrice,
      ];

      pricesToConsider.forEach((price) => {
        if (typeof price === "number") {
          if (minPrice === null || price < minPrice) {
            minPrice = price;
          }
          if (maxPrice === null || price > maxPrice) {
            maxPrice = price;
          }
        }
      });

      // Also consider prices in variantDetails
      product.variantDetails?.forEach((detail) => {
        if (typeof detail.price === "number") {
          if (minPrice === null || detail.price < minPrice) {
            minPrice = detail.price;
          }
          if (maxPrice === null || detail.price > maxPrice) {
            maxPrice = detail.price;
          }
        }
        if (typeof detail.discountedPrice === "number") {
          if (minPrice === null || detail.discountedPrice < minPrice) {
            minPrice = detail.discountedPrice;
          }
          if (maxPrice === null || detail.discountedPrice > maxPrice) {
            maxPrice = detail.discountedPrice;
          }
        }
      });
    });

    return { minPrice, maxPrice };
  } catch (error) {
    console.error("Error fetching min/max price by category:", error);
    return { minPrice: null, maxPrice: null };
  }
};
