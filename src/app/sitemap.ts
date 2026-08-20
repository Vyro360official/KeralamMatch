import { MetadataRoute } from "next";

const BASE = "https://keralammatch.com";

const districts = [
  "trivandrum", "ernakulam", "kozhikode", "kottayam", "thrissur",
  "kollam", "kannur", "palakkad", "malappuram", "alappuzha",
  "wayanad", "idukki", "pathanamthitta",
];

const communities = [
  "nair", "ezhava", "christian", "latin-catholic", "syrian-christian", "muslim",
];

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: BASE, lastModified: new Date(), changeFrequency: "daily", priority: 1 },
    { url: `${BASE}/find`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
    { url: `${BASE}/pricing`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
    { url: `${BASE}/blog`, lastModified: new Date(), changeFrequency: "daily", priority: 0.8 },
    { url: `${BASE}/trust`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE}/faq`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 },
    { url: `${BASE}/privacy`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
    { url: `${BASE}/terms`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
  ];

  const districtRoutes: MetadataRoute.Sitemap = districts.map((d) => ({
    url: `${BASE}/find/brides-in-${d}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  const communityRoutes: MetadataRoute.Sitemap = communities.map((c) => ({
    url: `${BASE}/find/${c}-matrimony`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  return [...staticRoutes, ...districtRoutes, ...communityRoutes];
}
