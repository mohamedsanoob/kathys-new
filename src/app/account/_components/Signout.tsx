"use client"; // Corrected 'cleint' to 'client'
import { auth } from "@/firebase/config";
import { signOut } from "firebase/auth";

const Signout = () => {
  const handleSignOut = async () => {
    try {
      await signOut(auth); // Sign out the user
      window.location.href = "/"; // Redirect to home page after sign out
    } catch (error) {
      console.error("Error signing out:", error); // Log any errors
    }
  };

  return (
    <div>
      <button onClick={handleSignOut}>Sign out</button>{" "}
      {/* Changed "Signout" to "Sign out" for consistency */}
    </div>
  );
};

export default Signout;
