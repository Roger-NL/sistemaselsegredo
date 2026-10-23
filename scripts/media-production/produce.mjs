// The old direct generator is intentionally disabled: it could bypass global cost coordination.
// A future authorized production job must resolve catalog IDs through the shared speech cache.
throw new Error("DIRECT_SPEECH_GENERATION_DISABLED: use the approved catalog/cache service; no provider request was made.");
