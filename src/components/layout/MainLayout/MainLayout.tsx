"use client";

import { AppSidebar } from "@/components/ui/app-sidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Outlet } from "react-router-dom";
import { useTranslation } from "react-i18next";

export default function MainLayout() {
  const { i18n } = useTranslation();

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  // Pick flag by current language
  const currentFlag = i18n.language === "am" ? "🇪🇹" : "🇺🇸";

  return (
      <SidebarProvider>
        <AppSidebar />

        <main className="w-full overflow-x-hidden overflow-y-auto p-1 min-h-screen bg-white">
          {/* Sidebar trigger and language dropdown */}
          <div className="flex justify-between items-center">
            <SidebarTrigger />

            <div className="mr-4">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="p-2 rounded-md hover:bg-muted transition text-xl">
                    {currentFlag}
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => changeLanguage("en")}>
                    🇺🇸 English
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => changeLanguage("am")}>
                    🇪🇹 Amharic
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Nested routes render here */}
          <Outlet />
        </main>
      </SidebarProvider>
  );
}
