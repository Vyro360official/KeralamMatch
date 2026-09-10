import MatrimonialLogoLoader from "@/components/ui/matrimonial-logo-loader";

export default function RootLoading() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/70 dark:bg-[#07132B]/80 backdrop-blur-xs">
      <MatrimonialLogoLoader size="md" />
    </div>
  );
}
