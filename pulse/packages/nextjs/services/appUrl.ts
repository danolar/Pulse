const stripTrailingSlash = (value: string): string => value.replace(/\/$/, "");

export const getAppPort = (): number => {
  const port = Number(process.env.PORT ?? "3000");
  return Number.isFinite(port) && port > 0 ? port : 3000;
};

/** Public origin for this deployment (OAuth callbacks, Twilio webhooks in prod, metadata). */
export const getAppBaseUrl = (): string => {
  const explicit = process.env.APP_BASE_URL?.trim();
  if (explicit) return stripTrailingSlash(explicit);

  if (process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim()) {
    return `https://${stripTrailingSlash(process.env.VERCEL_PROJECT_PRODUCTION_URL.trim())}`;
  }

  if (process.env.VERCEL_URL?.trim()) {
    return `https://${stripTrailingSlash(process.env.VERCEL_URL.trim())}`;
  }

  return `http://localhost:${getAppPort()}`;
};

export const getGoogleOAuthRedirectUri = (): string => {
  const explicit = process.env.GOOGLE_OAUTH_REDIRECT_URI?.trim();
  if (explicit) return explicit;
  return `${getAppBaseUrl()}/api/google/oauth/callback`;
};

/** Twilio must reach a public URL. Dev: set TWILIO_WEBHOOK_BASE_URL (ngrok). Prod: APP_BASE_URL is enough. */
export const getTwilioWebhookBaseUrl = (): string | null => {
  const explicit = process.env.TWILIO_WEBHOOK_BASE_URL?.trim();
  if (explicit) return stripTrailingSlash(explicit);

  const baseUrl = getAppBaseUrl();
  if (baseUrl.includes("localhost") || baseUrl.includes("127.0.0.1")) {
    return null;
  }

  return baseUrl;
};
