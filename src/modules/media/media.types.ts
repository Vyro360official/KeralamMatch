export interface PhotoUploadResult {
  id: string;
  url: string;
  watermarkedUrl: string;
  type: "PHOTO";
}

export interface VoiceUploadResult {
  url: string;
  type: "VOICE";
}
