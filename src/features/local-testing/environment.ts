export function isLoopbackHost(host: string) {
  return /^(localhost|127\.0\.0\.1|\[::1\]|::1)(:\d+)?$/i.test(host);
}

export function localToolsAllowed(host: string) {
  return process.env.NODE_ENV === "development" && isLoopbackHost(host);
}
