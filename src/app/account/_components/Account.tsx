"use client";

import { useAuth } from "@/context/AuthContext";

const Account = () => {
      const { currentUser } = useAuth();

      

      console.log(currentUser,"----------->user")
  return (
    <div className="container mx-auto flex w-[90%] justify-between py-4">
          <p className="text-xl font-medium">Account</p>
          <p className="text-lg">{currentUser?.phoneNumber}</p>
        </div>
  )
}

export default Account;