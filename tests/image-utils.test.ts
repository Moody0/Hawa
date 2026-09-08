import { describe, expect, it } from "vitest";
import {
  getImageSourceCandidates,
  getProxyImageUrl,
  getSafeImageUrl,
  IMAGE_PLACEHOLDER_SRC,
} from "@/lib/image-utils";

describe("image source fallbacks", () => {
  it("tries the proxy, the original URL, and the placeholder exactly once", () => {
    const source = "https://i.postimg.cc/rmf3jnNs/data-bodour-(48).png";

    expect(getImageSourceCandidates(source)).toEqual([
      getProxyImageUrl(source),
      source,
      IMAGE_PLACEHOLDER_SRC,
    ]);
  });

  it("does not recursively proxy an already proxied URL", () => {
    const source = "https://cdn.shopify.com/example/product.png";

    expect(getSafeImageUrl(getProxyImageUrl(source))).toBe(getProxyImageUrl(source));
  });

  it("uses only the placeholder for an invalid source", () => {
    expect(getImageSourceCandidates("not-an-image-url")).toEqual([
      IMAGE_PLACEHOLDER_SRC,
    ]);
  });
});
