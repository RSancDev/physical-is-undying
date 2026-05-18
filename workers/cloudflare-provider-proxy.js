export default {
  async fetch(request, env) {
    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders() });
    }

    const url = new URL(request.url);
    const target = url.searchParams.get("target");
    if (!target) {
      return json({ error: "Missing target URL" }, 400);
    }

    const allowList = [
      "https://api.disqapis.com/graphql",
      "https://api.themoviedb.org/3",
      "https://api.upcitemdb.com"
    ];

    if (!allowList.some((allowed) => target.startsWith(allowed))) {
      return json({ error: "Target is not allow-listed" }, 403);
    }

    const headers = new Headers(request.headers);
    headers.delete("host");

    if (target.includes("themoviedb.org") && env.TMDB_BEARER_TOKEN) {
      headers.set("Authorization", `Bearer ${env.TMDB_BEARER_TOKEN}`);
    }
    if (target.includes("disqapis.com") && env.DISQ_API_KEY) {
      headers.set("Authorization", `Bearer ${env.DISQ_API_KEY}`);
    }

    const proxied = await fetch(target, {
      method: request.method,
      headers,
      body: request.method === "GET" || request.method === "HEAD" ? undefined : await request.text()
    });

    return new Response(proxied.body, {
      status: proxied.status,
      headers: { ...corsHeaders(), "content-type": proxied.headers.get("content-type") || "application/json" }
    });
  }
};

function corsHeaders() {
  return {
    "access-control-allow-origin": "*",
    "access-control-allow-methods": "GET,POST,OPTIONS",
    "access-control-allow-headers": "authorization,content-type"
  };
}

function json(payload, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { ...corsHeaders(), "content-type": "application/json" }
  });
}
