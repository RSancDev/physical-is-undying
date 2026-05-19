import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ProviderSetupDialog } from "../src/components/ProviderSetupDialog";
import { getProviderSetupState } from "../src/lib/settings";

describe("ProviderSetupDialog", () => {
  beforeEach(() => {
    const store = new Map<string, string>();
    vi.stubGlobal("localStorage", {
      getItem: (key: string) => store.get(key) ?? null,
      setItem: (key: string, value: string) => store.set(key, value),
      removeItem: (key: string) => store.delete(key),
      clear: () => store.clear()
    });
  });

  it("shows the three hybrid setup choices on first run", () => {
    render(<ProviderSetupDialog onComplete={() => undefined} />);

    expect(screen.getByText("Use a protected proxy")).toBeInTheDocument();
    expect(screen.getByText("Use my own browser keys")).toBeInTheDocument();
    expect(screen.getByText("Manual/offline only")).toBeInTheDocument();
  });

  it("can complete setup in manual/offline mode without keys", () => {
    const onComplete = vi.fn();
    render(<ProviderSetupDialog onComplete={onComplete} />);

    fireEvent.click(screen.getByRole("button", { name: /continue offline/i }));

    expect(onComplete).toHaveBeenCalledTimes(1);
    expect(getProviderSetupState()).toMatchObject({
      mode: "manual",
      requiresSetup: false
    });
  });
});
