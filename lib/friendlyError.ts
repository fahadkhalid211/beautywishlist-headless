export type ErrorContext = "cart" | "checkout" | "coupon" | "auth" | "generic";

export function getFriendlyErrorMessage(
  rawMessage: string | undefined,
  context: ErrorContext = "generic"
): string {
  const msg = (rawMessage || "").toLowerCase();

  if (msg.includes("stock") || msg.includes("insufficient") || msg.includes("backorder")) {
    return "This product is out of stock — try another one!";
  }
  if (msg.includes("coupon") && (msg.includes("invalid") || msg.includes("not found") || msg.includes("does not exist") || msg.includes("doesn't exist"))) {
    return "That coupon code doesn't look right. Double-check and try again.";
  }
  if (msg.includes("coupon") && msg.includes("expired")) {
    return "This coupon has expired.";
  }
  if (msg.includes("coupon") && (msg.includes("minimum") || msg.includes("already applied") || msg.includes("cannot be applied") || msg.includes("can't be applied"))) {
    return rawMessage || "That coupon can't be applied to this order.";
  }
  if (msg.includes("incorrect email") || msg.includes("incorrect password") || (msg.includes("password") && msg.includes("incorrect"))) {
    return "That email or password doesn't match our records.";
  }
  if (msg.includes("email") && msg.includes("exists")) {
    return "An account with this email already exists — try logging in instead.";
  }
  if (msg.includes("phone") && msg.includes("required")) {
    return "Please add a phone number so we can reach you about your delivery.";
  }
  if (msg.includes("shipping") && (msg.includes("method") || msg.includes("rate") || msg.includes("calculate"))) {
    return "We couldn't calculate shipping for this address. Please double-check it.";
  }
  if (msg.includes("address") && msg.includes("required")) {
    return "Please fill in all required address fields.";
  }

  // If the message is already a reasonably short, readable sentence, trust it as-is.
  if (rawMessage && rawMessage.includes(" ") && rawMessage.length < 150 && !msg.includes("error") && !msg.includes("exception")) {
    return rawMessage;
  }

  switch (context) {
    case "cart":
      return "We couldn't add that to your cart just now. Please try again.";
    case "checkout":
      return "We couldn't place your order. Please check your details and try again.";
    case "coupon":
      return "We couldn't apply that coupon right now. Please try again.";
    case "auth":
      return "Something interrupted that request. Please try again.";
    default:
      return "That didn't go through. Please try again in a moment.";
  }
}
