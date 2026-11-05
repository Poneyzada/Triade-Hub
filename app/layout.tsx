import type { Metadata } from "next";
import "./globals.css";
import { TriadeProvider } from "@/lib/store";

export const metadata: Metadata = {
  title: "Tríade Hub | Sistema de Gestão All-in-One da Tríade Studio",
  description:
    "Plataforma executiva de gestão de clientes, cofre de acessos, onboarding dinâmico e projetos da Tríade Studio.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" className="dark">
      <body className="bg-triade-bg text-zinc-100 antialiased selection:bg-triade-cyan/30 selection:text-triade-cyanLight min-h-screen">
        <div className="cosmic-grain" />
        <TriadeProvider>{children}</TriadeProvider>
      </body>
    </html>
  );
}
