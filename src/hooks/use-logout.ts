"use client";

import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { signOutUser } from "@/services/authService";

export const useLogout = () => {
  const router = useRouter();
  const { toast } = useToast();

  const logout = async () => {
    try {
      await signOutUser();
      toast({ title: "Logged Out", description: "You have been successfully logged out." });
      router.push('/login');
    } catch (error) {
      console.error("Logout failed:", error);
      toast({ variant: "destructive", title: "Logout Failed", description: "Could not log out. Please try again." });
    }
  };

  return logout;
};
