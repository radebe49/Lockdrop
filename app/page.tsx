import dynamic from "next/dynamic";

const MarketingPageContent = dynamic(
  () =>
    import("@/components/marketing/MarketingPageContent").then(
      (mod) => mod.MarketingPageContent
    ),
  {
    ssr: false,
    loading: () => (
      <div className="flex min-h-screen items-center justify-center bg-dark-950">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-500 border-t-transparent" />
      </div>
    ),
  }
);

export default function MarketingPage() {
  return <MarketingPageContent />;
}
