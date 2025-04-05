import { auth, db } from "@/firebase/config";
import {
  collection,
  doc,
  DocumentData,
  getDoc,
  getDocs,
  query,
  setDoc,
  updateDoc,
  where,
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
  combination: Combination[];
  discountedPrice: number;
  inventory: number;
  price: number;
  sku: string;
}
interface CartProduct {
  productId: string;
  quantity: number;
  variantDetails?: VariantDetail;
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

export const getProductsByCategory = async (
  productIds: string[]
): Promise<Product[]> => {
  if (!productIds.length) {
    return [];
  }

  const productsCollection = collection(db, "products");
  const querySnapshot = await getDocs(
    query(productsCollection, where("id", "in", productIds))
  );

  return querySnapshot.docs.map((doc) => {
    const productData = doc.data() as Product; // Type assertion
    return { ...productData }; // Return the product with the document ID
  });
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

  const isGuest = !user || user.isAnonymous;
  const cartRef = doc(db, `${isGuest ? "guest-" : ""}carts`, cartId);
  const cartSnapshot = await getDoc(cartRef);
  const cartItems = cartSnapshot.exists()
    ? cartSnapshot.data()?.products || []
    : [];

  // Extract the product IDs from the cart items
  const productIdsInCart = cartItems
    .map((item: CartProduct) => item.productId)
    .filter(Boolean) as string[];

  if (productIdsInCart.length === 0) {
    return [];
  }

  const productsRef = collection(db, "products");
  const q = query(productsRef, where("__name__", "in", productIdsInCart));

  const productsSnapshot = await getDocs(q);
  const productsData = productsSnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));

  const cartProductsWithDetails = cartItems
    .map((cartItem: CartProduct) => {
      const matchingProduct = productsData.find(
        (product) => product.id === cartItem.productId
      );
      if (matchingProduct) {
        return {
          ...matchingProduct,
          variantDetails: cartItem.variantDetails,
          quantity: cartItem.quantity,
        };
      }
      return [];
    })
    .filter(Boolean);

  return cartProductsWithDetails;
}
