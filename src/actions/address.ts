 // Assuming your firebase config is here

import { db } from "@/firebase/config";
import { deleteDoc, doc } from "firebase/firestore";

export const deleteUserAddressById = async (
  userId: string,
  addressId: string
): Promise<boolean> => {
  try {
    const addressRef = doc(db, "users", userId, "addresses", addressId);
    await deleteDoc(addressRef);
    console.log(
      `Successfully deleted address with ID '${addressId}' for user '${userId}'.`
    );
    return true;
  } catch (error) {
    console.error(
      `Error deleting address with ID '${addressId}' for user '${userId}':`,
      error
    );
    return false;
  }
};

