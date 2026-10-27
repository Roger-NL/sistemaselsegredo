import { spawnSync } from "node:child_process";
import { describe, expect, it } from "vitest";

describe("Firebase Admin in a serverless CommonJS runtime", () => {
  it("loads authentication and resolves a valid RSA signing key without require(ESM)", () => {
    // Vercel can disable Node's require(ESM) interop. Ordinary dev/build checks
    // otherwise miss the import-time crash before /comecar even renders.
    const result = spawnSync(process.execPath, ["--no-experimental-require-module", "-e", `
      const assert = require('node:assert/strict');
      const { generateKeyPairSync, sign, verify } = require('node:crypto');
      const { getAuth } = require('firebase-admin/auth');
      const jwks = require(require.resolve('jwks-rsa', {
        paths: [require.resolve('firebase-admin/auth')],
      }));
      (async () => {
        assert.equal(typeof getAuth, 'function');
        const { publicKey, privateKey } = generateKeyPairSync('rsa', { modulusLength: 2048 });
        const client = jwks({
          cache: false,
          rateLimit: false,
          fetcher: async () => ({ keys: [{ ...publicKey.export({ format: 'jwk' }), kid: 'regression', alg: 'RS256', use: 'sig' }] }),
        });
        const key = await client.getSigningKey('regression');
        const payload = Buffer.from('local compatibility check');
        const signature = sign('RSA-SHA256', payload, privateKey);
        assert.equal(verify('RSA-SHA256', payload, key.getPublicKey(), signature), true);
        assert.equal(verify('RSA-SHA256', Buffer.from('tampered'), key.getPublicKey(), signature), false);
        console.log('firebase-auth-and-jwks-ok');
      })().catch(error => { console.error(error); process.exitCode = 1; });
    `], { encoding: "utf8", timeout: 15_000 });

    expect(result.error).toBeUndefined();
    expect(result.status, result.stderr).toBe(0);
    expect(result.stdout).toContain("firebase-auth-and-jwks-ok");
  });
});
