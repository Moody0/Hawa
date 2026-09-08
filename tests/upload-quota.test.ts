import { test } from "vitest";
import assert from "node:assert/strict";
import { checkUploadQuota, resetUploadQuota } from "../lib/upload-quota";

test("checkUploadQuota allows requests under limit and blocks over limit", () => {
    const testId = "test-customer-123";
    resetUploadQuota(testId);

    // Initial check should be allowed
    const first = checkUploadQuota(testId);
    assert.equal(first.allowed, true);
    assert.equal(first.remaining, 19);

    // Consume all remaining slots
    for (let i = 0; i < 19; i++) {
        const res = checkUploadQuota(testId);
        assert.equal(res.allowed, true);
    }

    // Next attempt should be blocked
    const blocked = checkUploadQuota(testId);
    assert.equal(blocked.allowed, false);
    assert.equal(blocked.remaining, 0);

    // Resetting restores quota
    resetUploadQuota(testId);
    const afterReset = checkUploadQuota(testId);
    assert.equal(afterReset.allowed, true);
});
