/**
 * Server startup hook.
 *
 * DEV/CI ONLY: when this process runs behind an HTTPS proxy (as in the cloud
 * dev sandbox), Node's global fetch — which supabase-js uses — does not route
 * through it, so outbound requests fail to resolve. Here we point undici's
 * global dispatcher at the proxy. Guarded by HTTPS_PROXY, so in production
 * (no proxy) this is a complete no-op and `undici` is never imported.
 */
export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;
  const proxy = process.env.HTTPS_PROXY ?? process.env.https_proxy;
  if (!proxy) return;

  // Bundler-ignored dynamic import: undici is a devDependency and must not be
  // bundled into or required by the production server.
  const { setGlobalDispatcher, ProxyAgent } = await import(
    /* webpackIgnore: true */ /* turbopackIgnore: true */ "undici"
  );
  setGlobalDispatcher(new ProxyAgent({ uri: proxy }));
  // TLS trust for the proxy's CA comes from NODE_EXTRA_CA_CERTS in the sandbox.
}
