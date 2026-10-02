import { describe, it, expect, afterEach } from "vitest";
import { render, screen, act, cleanup } from "@testing-library/react";
import { SwUpdateToast } from "@/components/SwUpdateToast";

function mockServiceWorker(controller: object | null) {
  const target = new EventTarget();
  const sw = Object.assign(target, { controller });
  Object.defineProperty(navigator, "serviceWorker", { value: sw, configurable: true });
  return sw;
}

describe("SwUpdateToast", () => {
  afterEach(() => {
    cleanup();
    // jsdom has no service worker by default
    Reflect.deleteProperty(navigator, "serviceWorker");
  });

  it("stays hidden when the service worker takes control on the first visit", () => {
    const sw = mockServiceWorker(null);
    render(<SwUpdateToast />);
    act(() => {
      sw.dispatchEvent(new Event("controllerchange"));
    });
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("shows the refresh prompt when an existing controller is replaced", () => {
    const sw = mockServiceWorker({});
    render(<SwUpdateToast />);
    act(() => {
      sw.dispatchEvent(new Event("controllerchange"));
    });
    expect(screen.getByRole("alert")).toHaveTextContent("Nouvelle version disponible");
  });

  it("shows the prompt on a later update after a first-visit takeover", () => {
    const sw = mockServiceWorker(null);
    render(<SwUpdateToast />);
    act(() => {
      sw.dispatchEvent(new Event("controllerchange"));
    });
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    act(() => {
      sw.dispatchEvent(new Event("controllerchange"));
    });
    expect(screen.getByRole("alert")).toBeInTheDocument();
  });
});
