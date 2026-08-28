import {
  NextRequest,
  NextResponse,
} from "next/server";

const API = process.env.NEXT_PUBLIC_WC_STORE_API!;

export async function POST(
  request: NextRequest
) {
  try {
    const {
      productId,
      quantity = 1,
    } = await request.json();

    let token =
      request.cookies.get(
        "wc_cart_token"
      )?.value;

    let nonce =
      request.cookies.get(
        "wc_nonce"
      )?.value;

    /*
     * Initialize session.
     */
    if (!token || !nonce) {
      const cartResponse = await fetch(
        `${API}/cart`,
        {
          method: "GET",
          cache: "no-store",
        }
      );

      token =
        cartResponse.headers.get(
          "Cart-Token"
        ) || token;

      nonce =
        cartResponse.headers.get(
          "Nonce"
        ) || nonce;
    }

    if (!token) {
      return NextResponse.json(
        {
          error: "Cart token unavailable",
        },
        { status: 500 }
      );
    }

    /*
     * Add product.
     */
    const response = await fetch(
      `${API}/cart/add-item?id=${productId}&quantity=${quantity}`,
      {
        method: "POST",
        cache: "no-store",
        headers: {
          "Cart-Token": token,
          ...(nonce
            ? { Nonce: nonce }
            : {}),
        },
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        data,
        {
          status: response.status,
        }
      );
    }

    const result =
      NextResponse.json(data);

    const returnedToken =
      response.headers.get(
        "Cart-Token"
      );

    const returnedNonce =
      response.headers.get(
        "Nonce"
      );

    result.cookies.set(
      "wc_cart_token",
      returnedToken || token,
      {
        httpOnly: true,
        secure:
          process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
      }
    );

    if (returnedNonce || nonce) {
      result.cookies.set(
        "wc_nonce",
        returnedNonce || nonce!,
        {
          httpOnly: true,
          secure:
            process.env.NODE_ENV === "production",
          sameSite: "lax",
          path: "/",
        }
      );
    }

    return result;
  } catch (error) {
    return NextResponse.json(
      {
        error: "Cart request failed",
        message:
          error instanceof Error
            ? error.message
            : "Unknown error",
      },
      { status: 500 }
    );
  }
}