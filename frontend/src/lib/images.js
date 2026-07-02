// Shared image helpers. Auctions may exist without images (older seed data,
// admin-created records, etc.), so always route through firstImage() before
// rendering — never do `a.images?.[0]` inline.
export const AUCTION_PLACEHOLDER =
  "https://images.pexels.com/photos/31513715/pexels-photo-31513715.jpeg";

export function firstImage(auction) {
  const img = auction?.images?.[0];
  if (typeof img === "string" && img.trim() !== "") return img;
  return AUCTION_PLACEHOLDER;
}
