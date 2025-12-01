export interface ThirdPartyTokenResponse {
    code: number;
    message: string;
    data: {
        access_token: string;
    };
}

interface CachedToken {
    accessToken: string;
    expiresAt: number;
}

let cachedToken: CachedToken | null = null;

const TOKEN_LIFETIME_SECONDS = 3600;
const SAFETY_MARGIN_MS = 10_000;

/**
 * Fetches a NEW token from the third-party service.
 * Called only when token doesn't exist or is expired.
 */
async function fetchNewToken(): Promise<string> {
    console.log("[TokenHelper] Fetching NEW access token...");

    const response = await fetch(`${process.env.N_BASE_URL}/account/api/v1/auth`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            client_id: process.env.CLIENT_ID,
            client_key: process.env.CLIENT_KEY,
        }),
    });


    if (!response.ok) {
        console.error("[TokenHelper] Failed to fetch new token (HTTP error)");
        throw new Error("Failed to fetch access token");
    }

    const data = (await response.json()) as ThirdPartyTokenResponse;

    if (data.code !== 0 || !data.data?.access_token) {
        console.error("[TokenHelper] Third party returned error:", data);
        throw new Error("Third party auth error");
    }

    const accessToken = data.data.access_token;

    cachedToken = {
        accessToken,
        expiresAt:
            Date.now() + TOKEN_LIFETIME_SECONDS * 1000 - SAFETY_MARGIN_MS,
    };

    return cachedToken.accessToken;
}


export async function getAccessToken(): Promise<string> {
    const now = Date.now();

    // No token or expired token → refresh
    if (!cachedToken || cachedToken.expiresAt < now) {
        return fetchNewToken();
    }

    // Token is valid → return from memory
    return cachedToken.accessToken;
}
