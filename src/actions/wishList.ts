import { db } from "@/firebase/config";
import { doc, getDoc, updateDoc, arrayRemove } from "firebase/firestore";

export interface WishlistItem {
  id: string;
  productId: string;
  name: string;
  image: string;
  price: number;
  discountedPrice: number;
  addedAt: string;
  variant: {
    sku: string;
    combination: {
      name: string;
      value: string;
    }[];
  };
}

export const getUserWishlist = async (userId: string): Promise<WishlistItem[]> => {
  try {
    const wishlistRef = doc(db, "wishlists", userId);
    const docSnap = await getDoc(wishlistRef);
    
    if (!docSnap.exists()) return [];
    
    const data = docSnap.data();
    return data.products || [];
  } catch (error) {
    console.error("Error fetching wishlist:", error);
    throw error;
  }
};

export const removeFromWishlist = async (userId: string, productId: string): Promise<void> => {
  try {
    const wishlistRef = doc(db, "wishlists", userId);
    const docSnap = await getDoc(wishlistRef);
    
    if (!docSnap.exists()) throw new Error("Wishlist not found");
    
    const data = docSnap.data();
    const productToRemove = data.products.find((p: WishlistItem) => p.id === productId);
    
    if (!productToRemove) throw new Error("Product not in wishlist");
    
    await updateDoc(wishlistRef, {
      products: arrayRemove(productToRemove)
    });
  } catch (error) {
    console.error("Error removing from wishlist:", error);
    throw error;
  }
};