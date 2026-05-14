import { describe, expect, it } from "vitest";

import {
  buildAxiosConfigForAsyncApi,
  DEPENDENCY_VALUE_TOKEN,
  flattenPayloadToQueryParams,
  resolveAsyncApiConfigForFetch,
  serializeWatchValue,
  substituteDependencyToken,
  substitutePathParamPlaceholders,
} from "@/forms/utils/dependentApiRequest";
import type { AsyncApiConfig } from "@/forms/types/types";

describe("dependentApiRequest / serializeWatchValue", () => {
  it("returns '' for null/undefined", () => {
    expect(serializeWatchValue(undefined)).toBe("");
    expect(serializeWatchValue(null)).toBe("");
  });

  it("comma-joins arrays", () => {
    expect(serializeWatchValue(["a", "b", "c"])).toBe("a,b,c");
  });

  it("coerces primitives", () => {
    expect(serializeWatchValue(42)).toBe("42");
    expect(serializeWatchValue(true)).toBe("true");
    expect(serializeWatchValue("xyz")).toBe("xyz");
  });
});

describe("dependentApiRequest / DEPENDENCY_VALUE_TOKEN", () => {
  it("matches the public {value} marker", () => {
    expect(DEPENDENCY_VALUE_TOKEN).toBe("{value}");
  });
});

describe("dependentApiRequest / substituteDependencyToken", () => {
  it("replaces every {value} occurrence", () => {
    expect(substituteDependencyToken("a/{value}/b/{value}", "X")).toBe("a/X/b/X");
  });

  it("returns input unchanged when token absent", () => {
    expect(substituteDependencyToken("plain", "X")).toBe("plain");
  });

  it("substitutes empty replacement", () => {
    expect(substituteDependencyToken("a/{value}/b", "")).toBe("a//b");
  });
});

describe("dependentApiRequest / substitutePathParamPlaceholders", () => {
  it("returns url unchanged when replacement is empty", () => {
    expect(substitutePathParamPlaceholders("/api/:id/x", "")).toBe("/api/:id/x");
  });

  it("returns url unchanged when no placeholder present", () => {
    expect(substitutePathParamPlaceholders("/api/foo", "X")).toBe("/api/foo");
  });

  it("replaces /:id with encoded replacement (path only)", () => {
    expect(substitutePathParamPlaceholders("/api/:id/cities", "ne pal")).toBe(
      "/api/ne%20pal/cities",
    );
  });

  it("replaces /:value at end of path", () => {
    expect(substitutePathParamPlaceholders("/api/:value", "x/y")).toBe("/api/x%2Fy");
  });

  it("does not touch the query-string portion", () => {
    expect(
      substitutePathParamPlaceholders("/api/:id/cities?foo=:id&bar=baz", "12"),
    ).toBe("/api/12/cities?foo=:id&bar=baz");
  });

  it("only replaces /:id when followed by / ? or end", () => {
    expect(substitutePathParamPlaceholders("/api/:identity/x", "12")).toBe(
      "/api/:identity/x",
    );
  });
});

describe("dependentApiRequest / resolveAsyncApiConfigForFetch", () => {
  const base: AsyncApiConfig = {
    url: "",
    method: "GET",
    responseMapping: { dataPath: "data", labelKey: "name", valueKey: "id" },
  };

  it("substitutes {value} in url, headers, and string payload values", () => {
    const out = resolveAsyncApiConfigForFetch({
      ...base,
      url: "https://x/{value}",
      headers: { "X-Country": "{value}", "X-Static": "k" },
      payload: { country: "{value}", note: "see {value}" },
      _watchValue: "NP",
    });
    expect(out.url).toBe("https://x/NP");
    expect(out.headers).toEqual({ "X-Country": "NP", "X-Static": "k" });
    expect(out.payload).toEqual({ country: "NP", note: "see NP" });
  });

  it("substitutes /:id and /:value in url with encoding", () => {
    const out = resolveAsyncApiConfigForFetch({
      ...base,
      url: "/api/:id/cities",
      _watchValue: "ne pal",
    });
    expect(out.url).toBe("/api/ne%20pal/cities");
  });

  it("preserves nested arrays/objects in payload while substituting strings", () => {
    const out = resolveAsyncApiConfigForFetch({
      ...base,
      method: "POST",
      url: "https://x",
      payload: { ids: ["{value}", "static"], deep: { k: "{value}" } } as Record<
        string,
        unknown
      >,
      _watchValue: "Z",
    });
    expect(out.payload).toEqual({ ids: ["Z", "static"], deep: { k: "Z" } });
  });

  it("leaves payload undefined when not provided", () => {
    const out = resolveAsyncApiConfigForFetch({
      ...base,
      url: "/api",
    });
    expect(out.payload).toBeUndefined();
  });
});

describe("dependentApiRequest / flattenPayloadToQueryParams", () => {
  it("keeps primitives as-is", () => {
    expect(
      flattenPayloadToQueryParams({ s: "x", n: 1, b: true }),
    ).toEqual({ s: "x", n: 1, b: true });
  });

  it("strips null/undefined", () => {
    expect(
      flattenPayloadToQueryParams({ a: null, b: undefined, c: "ok" }),
    ).toEqual({ c: "ok" });
  });

  it("JSON-stringifies objects/arrays", () => {
    expect(
      flattenPayloadToQueryParams({ list: [1, 2], obj: { k: "v" } }),
    ).toEqual({ list: "[1,2]", obj: '{"k":"v"}' });
  });
});

describe("dependentApiRequest / buildAxiosConfigForAsyncApi", () => {
  const baseGet: AsyncApiConfig = {
    url: "https://x/{value}",
    method: "GET",
    responseMapping: { dataPath: "data", labelKey: "name", valueKey: "id" },
  };

  it("GET: payload becomes params; dynamicParams override/extend", () => {
    const cfg = buildAxiosConfigForAsyncApi(
      { ...baseGet, payload: { countryId: "{value}", limit: 10 }, _watchValue: "NP" },
      { search: "kath" },
    );
    expect(cfg.url).toBe("https://x/NP");
    expect(cfg.method).toBe("GET");
    expect(cfg.params).toEqual({ countryId: "NP", limit: 10, search: "kath" });
    expect(cfg.data).toBeUndefined();
  });

  it("GET without payload: just dynamicParams", () => {
    const cfg = buildAxiosConfigForAsyncApi(
      { ...baseGet, _watchValue: "X" },
      { p: 1 },
    );
    expect(cfg.params).toEqual({ p: 1 });
  });

  it("POST: payload becomes JSON body with dynamicParams merged", () => {
    const cfg = buildAxiosConfigForAsyncApi(
      {
        ...baseGet,
        method: "POST",
        url: "https://x",
        payload: { country: "{value}", limit: 10 },
        _watchValue: "NP",
      },
      { page: 1 },
    );
    expect(cfg.data).toEqual({ country: "NP", limit: 10, page: 1 });
    expect(cfg.params).toBeUndefined();
  });

  it("POST without user payload: injects { value: <watch> }", () => {
    const cfg = buildAxiosConfigForAsyncApi(
      { ...baseGet, method: "POST", url: "https://x", _watchValue: "NP" },
      { page: 1 },
    );
    expect(cfg.data).toEqual({ value: "NP", page: 1 });
  });

  it("POST without user payload AND empty watch: no injected value", () => {
    const cfg = buildAxiosConfigForAsyncApi(
      { ...baseGet, method: "POST", url: "https://x" },
      { page: 1 },
    );
    expect(cfg.data).toEqual({ page: 1 });
  });

  it("POST with array payload: passes through verbatim", () => {
    const cfg = buildAxiosConfigForAsyncApi(
      {
        ...baseGet,
        method: "POST",
        url: "https://x",
        payload: ["{value}", "x"] as unknown as Record<string, unknown>,
        _watchValue: "NP",
      },
      { ignored: 1 },
    );
    expect(cfg.data).toEqual(["NP", "x"]);
  });

  it("DELETE without payload: behaves like GET (params)", () => {
    const cfg = buildAxiosConfigForAsyncApi({
      ...baseGet,
      method: "DELETE",
      url: "https://x",
      _watchValue: "NP",
    });
    expect(cfg.method).toBe("DELETE");
    expect(cfg.params).toEqual({});
    expect(cfg.data).toBeUndefined();
  });

  it("DELETE WITH meaningful payload: JSON body", () => {
    const cfg = buildAxiosConfigForAsyncApi({
      ...baseGet,
      method: "DELETE",
      url: "https://x",
      payload: { id: "{value}" },
      _watchValue: "NP",
    });
    expect(cfg.data).toEqual({ id: "NP" });
    expect(cfg.params).toBeUndefined();
  });

  it("PUT: same as POST", () => {
    const cfg = buildAxiosConfigForAsyncApi({
      ...baseGet,
      method: "PUT",
      url: "https://x",
      payload: { x: "{value}" },
      _watchValue: "NP",
    });
    expect(cfg.data).toEqual({ x: "NP" });
  });

  it("PATCH: same as POST", () => {
    const cfg = buildAxiosConfigForAsyncApi({
      ...baseGet,
      method: "PATCH",
      url: "https://x",
      payload: { x: "{value}" },
      _watchValue: "NP",
    });
    expect(cfg.data).toEqual({ x: "NP" });
  });

  it("propagates substituted headers", () => {
    const cfg = buildAxiosConfigForAsyncApi({
      ...baseGet,
      headers: { "X-Country": "{value}" },
      _watchValue: "NP",
    });
    expect(cfg.headers).toEqual({ "X-Country": "NP" });
  });

  it("substitutes /:id segment in url + keeps query untouched", () => {
    const cfg = buildAxiosConfigForAsyncApi({
      ...baseGet,
      url: "https://x/:id/cities?stable=1",
      _watchValue: "NP",
    });
    expect(cfg.url).toBe("https://x/NP/cities?stable=1");
  });
});
