"use client";

import React, { useState } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { NewClientModal } from "@/components/clients/NewClientModal";
import { NewTaskModal } from "@/components/tasks/NewTaskModal";

interface AppShellProps {
  children: React.ReactNode;
}

export const AppShell: React.FC<AppShellProps> = ({ children }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [newClientOpen, setNewClientOpen] = useState(false);
  const [newTaskOpen, setNewTaskOpen] = useState(false);

  return (
    <div className="relative flex min-h-screen bg-[#050B11]">
      {/* Sidebar Desktop e Mobile */}
      <Sidebar
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col lg:pl-72">
        <Header
          onOpenMobileMenu={() => setMobileMenuOpen(true)}
          onOpenNewClient={() => setNewClientOpen(true)}
          onOpenNewTask={() => setNewTaskOpen(true)}
        />

        <main className="flex-1 p-4 sm:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>

      {/* Modais Globais */}
      <NewClientModal
        isOpen={newClientOpen}
        onClose={() => setNewClientOpen(false)}
      />

      <NewTaskModal
        isOpen={newTaskOpen}
        onClose={() => setNewTaskOpen(false)}
      />
    </div>
  );
};
