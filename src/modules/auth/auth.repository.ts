import { prisma } from "@/lib/db";
import { UserRegistrationInput } from "./auth.types";
import { User } from "@prisma/client";

export interface IAuthRepository {
  findByFirebaseUid(firebaseUid: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  findByPhone(phone: string): Promise<User | null>;
  createUser(input: UserRegistrationInput): Promise<User>;
  logAuditAction(userId: string, action: string, ip?: string, userAgent?: string): Promise<void>;
}

export class AuthRepository implements IAuthRepository {
  async findByFirebaseUid(firebaseUid: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { firebaseUid },
      include: {
        profile: true,
        wallet: true,
      },
    });
  }

  async findByEmail(email: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { email },
    });
  }

  async findByPhone(phone: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { phone },
    });
  }

  async createUser(input: UserRegistrationInput): Promise<User> {
    // Create User, Profile, Wallet, and default NotificationSettings in a single transaction
    return prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          firebaseUid: input.firebaseUid,
          email: input.email,
          phone: input.phone,
          wallet: {
            create: {
              balance: 0,
              currency: "INR",
            },
          },
          notificationSettings: {
            create: {
              inApp: true,
              email: true,
              push: true,
              sms: false,
            },
          },
        },
      });

      return user;
    });
  }

  async logAuditAction(userId: string, action: string, ip?: string, userAgent?: string): Promise<void> {
    await prisma.auditLog.create({
      data: {
        userId,
        action,
        ipAddress: ip || null,
        userAgent: userAgent || null,
      },
    });
  }
}
