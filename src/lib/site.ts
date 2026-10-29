const productionHostname = process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim();

export const SITE_URL = new URL(`https://${productionHostname || 'anirudhaarin.vercel.app'}`);
