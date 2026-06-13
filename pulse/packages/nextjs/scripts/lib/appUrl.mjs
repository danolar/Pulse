const stripTrailingSlash = value => value.replace(/\/$/, "");

export const getAppPort = env => {
  const port = Number(env.PORT ?? "3000");
  return Number.isFinite(port) && port > 0 ? port : 3000;
};

export const getAppBaseUrl = env => {
  const explicit = env.APP_BASE_URL?.trim();
  if (explicit) return stripTrailingSlash(explicit);

  if (env.VERCEL_PROJECT_PRODUCTION_URL?.trim()) {
    return `https://${stripTrailingSlash(env.VERCEL_PROJECT_PRODUCTION_URL.trim())}`;
  }

  if (env.VERCEL_URL?.trim()) {
    return `https://${stripTrailingSlash(env.VERCEL_URL.trim())}`;
  }

  return `http://localhost:${getAppPort(env)}`;
};

export const getGoogleOAuthRedirectUri = env => {
  const explicit = env.GOOGLE_OAUTH_REDIRECT_URI?.trim();
  if (explicit) return explicit;
  return `${getAppBaseUrl(env)}/api/google/oauth/callback`;
};

export const getTwilioWebhookBaseUrl = env => {
  const explicit = env.TWILIO_WEBHOOK_BASE_URL?.trim();
  if (explicit) return stripTrailingSlash(explicit);

  const baseUrl = getAppBaseUrl(env);
  if (baseUrl.includes("localhost") || baseUrl.includes("127.0.0.1")) {
    return null;
  }

  return baseUrl;
};
