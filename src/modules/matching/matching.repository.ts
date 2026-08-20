import { prisma } from "@/lib/db";
import { MatchScore } from "@prisma/client";
import { MatchBreakdown } from "./matching.types";

export interface IMatchingRepository {
  findMatchScore(userAId: string, userBId: string): Promise<MatchScore | null>;
  upsertMatchScore(userAId: string, userBId: string, score: number, breakdown: MatchBreakdown): Promise<MatchScore>;
}

export class MatchingRepository implements IMatchingRepository {
  async findMatchScore(userAId: string, userBId: string): Promise<MatchScore | null> {
    // Queries in both directions since the relationship is symmetric
    return prisma.matchScore.findFirst({
      where: {
        OR: [
          { userAId, userBId },
          { userAId: userBId, userBId: userAId },
        ],
      },
    });
  }

  async upsertMatchScore(userAId: string, userBId: string, score: number, breakdown: MatchBreakdown): Promise<MatchScore> {
    const existing = await this.findMatchScore(userAId, userBId);

    if (existing) {
      return prisma.matchScore.update({
        where: { id: existing.id },
        data: {
          score,
          breakdown: breakdown as any,
        },
      });
    }

    return prisma.matchScore.create({
      data: {
        userAId,
        userBId,
        score,
        breakdown: breakdown as any,
      },
    });
  }
}
