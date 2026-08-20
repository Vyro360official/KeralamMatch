import { prisma } from "@/lib/db";
import { Media } from "@prisma/client";

export interface IMediaRepository {
  createMedia(profileId: string, url: string, watermarkedUrl: string, type: string, order: number): Promise<Media>;
  deleteMedia(mediaId: string): Promise<void>;
  findMediaById(mediaId: string): Promise<Media | null>;
  countProfileMedia(profileId: string): Promise<number>;
  updateVoiceIntroduction(profileId: string, url: string | null): Promise<void>;
}

export class MediaRepository implements IMediaRepository {
  async createMedia(profileId: string, url: string, watermarkedUrl: string, type: string, order: number): Promise<Media> {
    return prisma.media.create({
      data: {
        profileId,
        url,
        watermarkedUrl,
        type,
        order,
        isApproved: false, // Default is pending approval (moderation queue)
      },
    });
  }

  async deleteMedia(mediaId: string): Promise<void> {
    await prisma.media.delete({
      where: { id: mediaId },
    });
  }

  async findMediaById(mediaId: string): Promise<Media | null> {
    return prisma.media.findUnique({
      where: { id: mediaId },
    });
  }

  async countProfileMedia(profileId: string): Promise<number> {
    return prisma.media.count({
      where: { profileId },
    });
  }

  async updateVoiceIntroduction(profileId: string, url: string | null): Promise<void> {
    await prisma.profile.update({
      where: { id: profileId },
      data: {
        voiceIntroduction: url,
      },
    });
  }
}
