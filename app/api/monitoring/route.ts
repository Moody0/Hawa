// Legacy ingestion endpoint intentionally retired in favor of managed Sentry.
// No GET handler is exposed, so internal telemetry statistics cannot be read.
export async function POST() {
  return new Response(null, { status: 410 });
}
