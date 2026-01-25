/**
 * Health check endpoint for Docker health monitoring
 */
export default defineEventHandler(() => {
  return {
    status: "ok",
    timestamp: new Date().toISOString(),
  };
});
