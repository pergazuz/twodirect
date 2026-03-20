"use client";

import { ReactNode } from "react";
import { AuthProvider } from "@/contexts/AuthContext";
import { LocationProvider } from "@/contexts/LocationContext";
import { LocationPicker } from "@/components";
import { ChatBot } from "@/components/ChatBot";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <LocationProvider>
        {children}
        <LocationPicker />
        <ChatBot />
      </LocationProvider>
    </AuthProvider>
  );
}

