import { WalletProvider } from "@/lib/wallet/WalletProvider";
import { ToastProvider } from "@/components/ui";

export default function ClaimLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ToastProvider>
      <WalletProvider>{children}</WalletProvider>
    </ToastProvider>
  );
}
