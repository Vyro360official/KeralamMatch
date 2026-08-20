import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Script from "next/script";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://keralammatch.com"),
  title: {
    default: "KeralamMatch — Premium Matrimony for Malayali Community",
    template: "%s | KeralamMatch",
  },
  description:
    "Find your life partner safely and privately. KeralamMatch is Kerala's most trusted, privacy-first matrimonial platform for the global Malayali community.",
  keywords: [
    "Kerala matrimony",
    "Malayali matrimonial",
    "Kerala brides",
    "Kerala grooms",
    "Trivandrum matrimony",
    "Nair matrimony",
    "Christian matrimony Kerala",
    "Muslim matrimony Kerala",
    "Ezhava matrimony",
    "privacy-first matrimony",
  ],
  authors: [{ name: "KeralamMatch" }],
  creator: "KeralamMatch",
  publisher: "KeralamMatch Technologies Pvt. Ltd.",
  robots: { index: true, follow: true, googleBot: { index: true, follow: true } },
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: "https://keralammatch.com",
    siteName: "KeralamMatch",
    title: "KeralamMatch — Premium Matrimony for Malayali Community",
    description:
      "Kerala's most trusted matrimonial platform. Privacy-first. Verified profiles. Find your perfect match.",
    images: [
      { url: "/og-image.jpg", width: 1200, height: 630, alt: "KeralamMatch — Premium Matrimony" },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "KeralamMatch — Premium Matrimony for Malayali Community",
    description: "Kerala's most trusted matrimonial platform.",
    images: ["/og-image.jpg"],
    creator: "@keralammatch",
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION || "",
  },
  alternates: {
    canonical: "https://keralammatch.com",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const gaId = process.env.NEXT_PUBLIC_GA_ID;
  const clarityId = process.env.NEXT_PUBLIC_CLARITY_ID;

  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#d4a853" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />

        {/* Structured Data — Organization */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              name: "KeralamMatch",
              url: "https://keralammatch.com",
              logo: "https://keralammatch.com/icons/icon-512.png",
              sameAs: [
                "https://twitter.com/keralammatch",
                "https://www.instagram.com/keralammatch",
                "https://www.facebook.com/keralammatch",
              ],
              contactPoint: {
                "@type": "ContactPoint",
                contactType: "customer support",
                email: "support@keralammatch.com",
                availableLanguage: ["English", "Malayalam"],
              },
            }),
          }}
        />
      </head>
      <body className="min-h-full flex flex-col">
        {children}

        {/* Google Analytics 4 */}
        {gaId && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
              strategy="afterInteractive"
            />
            <Script id="ga-init" strategy="afterInteractive">
              {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${gaId}',{page_path:window.location.pathname});`}
            </Script>
          </>
        )}

        {/* Microsoft Clarity */}
        {clarityId && (
          <Script id="clarity-init" strategy="afterInteractive">
            {`(function(c,l,a,r,i,t,y){c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);})(window,document,"clarity","script","${clarityId}");`}
          </Script>
        )}

        {/* PWA Service Worker Registration */}
        <Script id="sw-register" strategy="afterInteractive">
          {`if ('serviceWorker' in navigator) { navigator.serviceWorker.register('/sw.js').catch(() => {}); }`}
        </Script>
      </body>
    </html>
  );
}
