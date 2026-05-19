import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AddRelease } from "../src/pages/AddRelease";
import { Discover } from "../src/pages/Discover";
import { buildBluRaySearchUrl } from "../src/providers/bluRayDotCom";
import { build4KFilmDbSearchUrl } from "../src/providers/fourKFilmDb";
import type { TitleSearchResult } from "../src/types";

const mocks = vi.hoisted(() => ({
  search4KTitle: vi.fn(),
  save: vi.fn()
}));

vi.mock("../src/lib/titleSearch", async (importOriginal) => {
  const actual = await importOriginal<typeof import("../src/lib/titleSearch")>();
  return {
    ...actual,
    search4KTitle: mocks.search4KTitle
  };
});

vi.mock("../src/hooks/useCollection", () => ({
  useCollection: () => ({
    items: [],
    loading: false,
    refresh: vi.fn(),
    save: mocks.save,
    remove: vi.fn(),
    replaceAll: vi.fn()
  })
}));

function manualResult(title: string): TitleSearchResult {
  return {
    kind: "manual-query",
    title,
    validation: {
      isPhysical4K: false,
      confidence: 0,
      reasons: [],
      warnings: ["Verify manually"],
      provider: "Manual search",
      status: "unverified"
    },
    requiresManualConfirmation: true,
    referenceUrls: {
      bluRayDotCom: buildBluRaySearchUrl(title),
      fourKFilmDb: build4KFilmDbSearchUrl(title)
    }
  };
}

describe("title search UI", () => {
  beforeEach(() => {
    mocks.search4KTitle.mockReset();
    mocks.save.mockReset();
  });

  it("shows manual title search results with Blu-ray.com and 4KFilmDb links inside Add Release", async () => {
    mocks.search4KTitle.mockResolvedValue([manualResult("The Thing")]);
    render(
      <MemoryRouter>
        <AddRelease />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByRole("button", { name: "title" }));
    fireEvent.change(screen.getByPlaceholderText("Movie title"), { target: { value: "The Thing" } });
    fireEvent.click(screen.getByRole("button", { name: /search/i }));

    await waitFor(() => expect(screen.getByText("The Thing")).toBeInTheDocument());
    expect(screen.getByRole("link", { name: /search blu-ray.com/i })).toHaveAttribute("href", buildBluRaySearchUrl("The Thing"));
    expect(screen.getByRole("link", { name: /search 4kfilmdb/i })).toHaveAttribute("href", build4KFilmDbSearchUrl("The Thing"));
    expect(screen.getByRole("button", { name: /add owned manual/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /add to wishlist/i })).toBeInTheDocument();
  });

  it("renders the Discover screen empty state and title search results", async () => {
    mocks.search4KTitle.mockResolvedValue([manualResult("The Matrix")]);
    render(
      <MemoryRouter>
        <Discover />
      </MemoryRouter>
    );

    expect(screen.getByRole("heading", { name: "Discover" })).toBeInTheDocument();
    fireEvent.change(screen.getByPlaceholderText("Search title, director, actor, label, or disc"), { target: { value: "The Matrix" } });
    fireEvent.click(screen.getByRole("button", { name: /search/i }));

    await waitFor(() => expect(screen.getByText("The Matrix")).toBeInTheDocument());
    expect(screen.getByRole("link", { name: /search 4kfilmdb/i })).toBeInTheDocument();
  });
});
