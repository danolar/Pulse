export type GoogleSurface = "gmailSend" | "gmailReceive" | "calendar" | "drive";

export type GoogleSurfacesConfig = Record<GoogleSurface, boolean>;

export const DEFAULT_GOOGLE_SURFACES: GoogleSurfacesConfig = {
  gmailSend: true,
  gmailReceive: true,
  calendar: true,
  drive: true,
};

export type GoogleConnectionRecord = {
  id: string;
  profileOwnerAddress: string;
  googleSub: string;
  googleEmail: string | null;
  surfaces: GoogleSurfacesConfig;
  gmailHistoryId: string | null;
  driveStartPageToken: string | null;
  connectedAt: string;
  revokedAt: string | null;
};

export type GoogleConnectionPublic = Omit<GoogleConnectionRecord, "id"> & {
  connected: boolean;
};

export type UpsertGoogleConnectionInput = {
  profileOwnerAddress: string;
  googleSub: string;
  googleEmail: string | null;
  refreshToken: string;
  surfaces: GoogleSurfacesConfig;
};

export type OAuthStatePayload = {
  nonce: string;
  profileOwner: string;
  surfaces: GoogleSurfacesConfig;
};
