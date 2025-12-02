import { Header } from "@/components/shared/Header";
import { BottomNav } from "@/components/shared/BottomNav";
import { InstallBanner, OfflineIndicator } from "@/components/pwa";

export default function GameLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <OfflineIndicator />
      <Header />
      <main className="flex-1 pb-20">{children}</main>
      <BottomNav />
      <InstallBanner />
    </div>
  );
}
