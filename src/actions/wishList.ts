import { auth, db } from "@/firebase/config";
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

const requireUid = (userId?: string) => {
  const uid = auth.currentUser?.uid;
  if (!uid) throw new Error("Not signed in");
  if (userId && userId !== uid) {
    console.warn("wishlist: ignoring mismatched userId");
  }
  return uid;
};

export const getUserWishlist = async (
  userId?: string
): Promise<WishlistItem[]> => {
  const uid = requireUid(userId);
  const wishlistRef = doc(db, "wishlists", uid);
  const docSnap = await getDoc(wishlistRef);

  if (!docSnap.exists()) return [];

  const data = docSnap.data();
  return data.products || [];
};

export const removeFromWishlist = async (
  userId: string | undefined,
  productId: string
): Promise<void> => {
  const uid = requireUid(userId);
  const wishlistRef = doc(db, "wishlists", uid);
  const docSnap = await getDoc(wishlistRef);

  if (!docSnap.exists()) throw new Error("Wishlist not found");

  const data = docSnap.data();
  const productToRemove = data.products.find(
    (p: WishlistItem) => p.id === productId
  );

  if (!productToRemove) throw new Error("Product not in wishlist");

  await updateDoc(wishlistRef, {
    products: arrayRemove(productToRemove),
  });
};
