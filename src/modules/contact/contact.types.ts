import { RequestStatus } from "@prisma/client";

export interface ContactRequestDetails {
  id: string;
  senderId: string;
  receiverId: string;
  status: RequestStatus;
  createdAt: Date;
  acceptedAt: Date | null;
  expiresAt: Date | null;
}

export interface UnlockedContactResult {
  phone: string;
  email: string;
  expiresAt: Date;
  timeLeftSeconds: number;
}
