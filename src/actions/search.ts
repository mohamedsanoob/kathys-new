import { db } from "@/firebase/config";
import {
  collection,
  query,
  where,
  getDocs,
  limit,
  orderBy,
} from "firebase/firestore";

export type Product = {
  id: string;
  productName: string;
  productPrice: number;
  productDiscountedPrice?: number;
  images: string[];
  categories: string[];
  active?: boolean; // Added since it's in your main interface
};

export async function searchProducts(queryStr: string): Promise<Product[]> {
  try {
    // Early return for empty query
    if (!queryStr.trim()) return [];

    const productsRef = collection(db, "products");
    const searchTerm = queryStr.toLowerCase();

    // Create a query that searches for products where name contains the search string
    // Using array-contains for categories if needed
    const q = query(
      productsRef,
      where("productNameLower", ">=", searchTerm),
      where("productNameLower", "<=", searchTerm + "\uf8ff"),
    //   where("active", "==", true), // Only search active products
      orderBy("productNameLower")
    );

    const querySnapshot = await getDocs(q);

    const results: Product[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      results.push({
        id: doc.id,
        productName: data.productName,
        productPrice: data.productPrice,
        productDiscountedPrice: data.productDiscountedPrice,
        images: data.images || [], // Return all images instead of just first
        categories: data.categories || [], // Changed to match your interface
        active: data.active,
      });
    });

    return results;
  } catch (error) {
    console.error("Firestore search error:", error);
    return [];
  }
}
