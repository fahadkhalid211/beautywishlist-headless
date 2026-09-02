type StoreApiInit = RequestInit & {
  timeoutMs?: number;
  next?: {
    revalidate?: number | false;
    tags?: string[];
  };
};

export const STORE_API_TIMEOUT_MS = 8000;

export async function fetchStoreApi(
  input: RequestInfo | URL,
  init: StoreApiInit = {}
): Promise<Response> {
  const { timeoutMs = STORE_API_TIMEOUT_MS, ...requestInit } = init;

  try {
    return await fetch(input, {
      ...requestInit,
      signal: requestInit.signal ?? AbortSignal.timeout(timeoutMs),
    });
  } catch (error) {
    console.error("WooCommerce backend unavailable:", error);

    return Response.json(
      {
        code: "backend_unavailable",
        message: "The commerce service is temporarily unavailable. Please try again shortly.",
      },
      {
        status: 503,
        headers: {
          "Cache-Control": "no-store, max-age=0",
        },
      }
    );
  }
}
