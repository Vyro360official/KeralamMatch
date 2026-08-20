export interface MembershipPlan {
  id: string;
  name: string;
  description: string;
  price: number;
  features: {
    contactRequestsPerDay: number;
    aiMatching: boolean;
    secureChat: boolean;
    profileBoost: number;
    maxPhotos: number;
    videoUpload: boolean;
    verificationPriority: string;
    featuredBadge: boolean;
    support: string;
  };
  durationDays: number;
}
