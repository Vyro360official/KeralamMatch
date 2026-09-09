import MatrimonialLogoLoader from "@/components/ui/matrimonial-logo-loader";

export default function ProfileLoading() {
  return (
    <MatrimonialLogoLoader
      fullscreen
      text="Loading Profile..."
      subtext="Retrieving verified Malayali candidate details"
    />
  );
}
