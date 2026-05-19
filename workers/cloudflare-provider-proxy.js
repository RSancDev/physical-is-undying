export default {
  async fetch(request, env) {
    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders() });
    }

    const url = new URL(request.url);
    const target = targetForRequest(url);
    if (!target) {
      return json({ error: "Use /providers for Disq GraphQL or /tmdb/* for TMDb." }, 404);
    }

    const headers = new Headers(request.headers);
    headers.delete("host");
    headers.delete("authorization");

    if (target.includes("themoviedb.org") && env.TMDB_BEARER_TOKEN) {
      headers.set("Authorization", `Bearer ${env.TMDB_BEARER_TOKEN}`);
    }
    if (target.includes("disqapis.com") && env.DISQ_API_KEY) {
      headers.set("apikey", env.DISQ_API_KEY);
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

function targetForRequest(url) {
  if (url.pathname === "/providers") {
    return "https://product.disqapis.com/graphql";
  }

  if (url.pathname.startsWith("/tmdb/")) {
    const tmdbPath = url.pathname.replace(/^\/tmdb/, "");
    return `https://api.themoviedb.org/3${tmdbPath}${url.search}`;
  }

  return "";
}

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
