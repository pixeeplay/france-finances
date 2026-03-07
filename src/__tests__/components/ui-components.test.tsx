import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { Card, AuditResponse } from "@/types";

// ── Mocks ──────────────────────────────────────────────────────────────────

// Mock next/navigation
const pushMock = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: pushMock, back: vi.fn(), replace: vi.fn() }),
  useSearchParams: () => new URLSearchParams(),
}));

// Mock next/image (renders a plain <img>)
vi.mock("next/image", () => ({
  default: ({ src, alt, width, height, className }: {
    src: string; alt: string; width: number; height: number; className?: string;
  }) => <img src={src} alt={alt} width={width} height={height} className={className} />,
}));

// Mock next/dynamic to load components synchronously
vi.mock("next/dynamic", () => ({
  default: (loader: () => Promise<{ RadarChart: unknown }>) => {
    // Return a stub component — RadarChart is not the focus of these tests
    return function DynamicStub() {
      return <div data-testid="radar-chart-stub" />;
    };
  },
}));

// Mock framer-motion: render plain HTML elements, pass through style/className/children
vi.mock("framer-motion", async () => {
  const React = await import("react");

  // A simple component factory that renders a given HTML tag, filtering framer-specific props
  function makeMotionComponent(tag: string) {
    return React.forwardRef(function MotionComponent(
      props: Record<string, unknown>,
      ref: React.Ref<HTMLElement>,
    ) {
      const {
        initial, animate, exit, transition, drag, dragConstraints,
        dragElastic, dragControls, onDragEnd, onDragStart, onTap,
        whileTap, whileHover, whileDrag, layout, layoutId, variants,
        custom, inherit,
        ...domProps
      } = props;
      return React.createElement(tag, { ...domProps, ref });
    });
  }

  return {
    motion: {
      div: makeMotionComponent("div"),
      span: makeMotionComponent("span"),
      button: makeMotionComponent("button"),
      a: makeMotionComponent("a"),
      p: makeMotionComponent("p"),
      section: makeMotionComponent("section"),
      li: makeMotionComponent("li"),
      ul: makeMotionComponent("ul"),
    },
    AnimatePresence: ({ children }: { children: React.ReactNode }) =>
      React.createElement(React.Fragment, null, children),
    useMotionValue: (val: number) => ({
      get: () => val,
      set: vi.fn(),
      onChange: vi.fn(),
    }),
    useTransform: () => ({
      get: () => 0,
      set: vi.fn(),
      onChange: vi.fn(),
    }),
    animate: vi.fn(),
    useDragControls: () => ({ start: vi.fn() }),
    useReducedMotion: () => false,
  };
});

// Mock analytics
vi.mock("@/lib/analytics", () => ({
  track: vi.fn(),
}));

// Mock radarData
vi.mock("@/lib/radarData", () => ({
  computeRadarFromSession: () => [],
}));

// Mock AcronymText: render plain text (no portal/tooltip complexity)
vi.mock("@/components/AcronymText", () => ({
  AcronymText: ({ text, className }: { text: string; className?: string }) => (
    <span className={className}>{text}</span>
  ),
}));

// Mock useSwipeGesture
vi.mock("@/hooks/useSwipeGesture", () => ({
  useSwipeGesture: ({ onSwipe }: { onSwipe: (d: string) => void }) => ({
    x: { get: () => 0, set: vi.fn(), onChange: vi.fn() },
    y: { get: () => 0, set: vi.fn(), onChange: vi.fn() },
    rotate: { get: () => 0, set: vi.fn(), onChange: vi.fn() },
    keepOpacity: { get: () => 0, set: vi.fn(), onChange: vi.fn() },
    cutOpacity: { get: () => 0, set: vi.fn(), onChange: vi.fn() },
    reinforceOpacity: { get: () => 0, set: vi.fn(), onChange: vi.fn() },
    unjustifiedOpacity: { get: () => 0, set: vi.fn(), onChange: vi.fn() },
    greenTint: { get: () => "transparent", set: vi.fn(), onChange: vi.fn() },
    redTint: { get: () => "transparent", set: vi.fn(), onChange: vi.fn() },
    blueTint: { get: () => "transparent", set: vi.fn(), onChange: vi.fn() },
    redBottomTint: { get: () => "transparent", set: vi.fn(), onChange: vi.fn() },
    handleDragEnd: vi.fn(),
  }),
}));

// ── Helpers ─────────────────────────────────────────────────────────────────

function makeCard(overrides: Partial<Card> = {}): Card {
  return {
    id: "test-card-1",
    title: "Aide au logement",
    subtitle: "Aides personnelles au logement (APL, ALF, ALS)",
    description: "Les aides au logement representent un poste majeur du budget social.",
    amountBillions: 16.5,
    costPerCitizen: 243,
    deckId: "social",
    icon: "🏠",
    source: "PLF 2025",
    level: 1,
    ...overrides,
  };
}

// ── SwipeCard Tests ─────────────────────────────────────────────────────────

describe("SwipeCard", () => {
  let SwipeCard: typeof import("@/components/SwipeCard").SwipeCard;

  beforeEach(async () => {
    vi.clearAllMocks();
    const mod = await import("@/components/SwipeCard");
    SwipeCard = mod.SwipeCard;
  });

  it("renders card title and amount", () => {
    const card = makeCard({ title: "Defense nationale", amountBillions: 47.2 });
    render(
      <SwipeCard card={card} isTop={true} onSwipe={vi.fn()} />,
    );

    expect(screen.getByText("Defense nationale")).toBeInTheDocument();
    expect(screen.getByText("47.2 Md€")).toBeInTheDocument();
  });

  it("renders the card icon", () => {
    const card = makeCard({ icon: "🛡️" });
    render(
      <SwipeCard card={card} isTop={true} onSwipe={vi.fn()} />,
    );

    expect(screen.getByText("🛡️")).toBeInTheDocument();
  });

  it("shows costPerCitizen value", () => {
    const card = makeCard({ costPerCitizen: 694 });
    render(
      <SwipeCard card={card} isTop={true} onSwipe={vi.fn()} />,
    );

    expect(screen.getByText("694€")).toBeInTheDocument();
  });

  it("renders the equivalence block when present", () => {
    const card = makeCard({ equivalence: "Equivalent a 3 porte-avions" });
    render(
      <SwipeCard card={card} isTop={true} onSwipe={vi.fn()} />,
    );

    expect(screen.getByText("Equivalent a 3 porte-avions")).toBeInTheDocument();
  });

  it("does not render the equivalence block when absent", () => {
    const card = makeCard({ equivalence: undefined });
    render(
      <SwipeCard card={card} isTop={true} onSwipe={vi.fn()} />,
    );

    expect(screen.queryByText("Équivalence")).not.toBeInTheDocument();
  });
});

// ── CardDetail Tests ────────────────────────────────────────────────────────

describe("CardDetail", () => {
  let CardDetail: typeof import("@/components/CardDetail").CardDetail;

  beforeEach(async () => {
    vi.clearAllMocks();
    const mod = await import("@/components/CardDetail");
    CardDetail = mod.CardDetail;
  });

  it("renders description and source when card is provided", () => {
    const card = makeCard({
      description: "Budget annuel de la recherche spatiale.",
      source: "Cour des comptes 2024",
    });
    render(
      <CardDetail card={card} onClose={vi.fn()} onVote={vi.fn()} />,
    );

    expect(screen.getByText("Budget annuel de la recherche spatiale.")).toBeInTheDocument();
    expect(screen.getByText("Cour des comptes 2024")).toBeInTheDocument();
  });

  it("renders the equivalence section when present", () => {
    const card = makeCard({ equivalence: "10 fois le budget de la culture" });
    render(
      <CardDetail card={card} onClose={vi.fn()} onVote={vi.fn()} />,
    );

    expect(screen.getByText("10 fois le budget de la culture")).toBeInTheDocument();
  });

  it("calls onVote and onClose when a vote button is clicked", async () => {
    const user = userEvent.setup();
    const onVote = vi.fn();
    const onClose = vi.fn();
    const card = makeCard();

    render(
      <CardDetail card={card} onClose={onClose} onVote={onVote} />,
    );

    // Level 1 shows "OK pour moi" and "A revoir" buttons
    const keepButton = screen.getByRole("button", { name: "Valider cette dépense" });
    await user.click(keepButton);

    expect(onVote).toHaveBeenCalledWith("keep");
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});

// ── StatBar Tests ───────────────────────────────────────────────────────────

describe("StatBar", () => {
  let StatBar: typeof import("@/components/StatBar").StatBar;

  beforeEach(async () => {
    vi.clearAllMocks();
    const mod = await import("@/components/StatBar");
    StatBar = mod.StatBar;
  });

  it("renders with correct label and count", () => {
    render(
      <StatBar
        icon={<span>✓</span>}
        label="OK"
        count={7}
        percent={70}
        colorClass="bg-primary"
        glowClass="shadow-sm"
      />,
    );

    expect(screen.getByText("OK")).toBeInTheDocument();
    expect(screen.getByText("7 cartes")).toBeInTheDocument();
  });

  it("uses singular 'carte' when count is 1", () => {
    render(
      <StatBar
        icon={<span>✓</span>}
        label="Renforcer"
        count={1}
        percent={10}
        colorClass="bg-info"
        glowClass="shadow-sm"
      />,
    );

    expect(screen.getByText("1 carte")).toBeInTheDocument();
  });
});

// ── AuditReport Tests ───────────────────────────────────────────────────────

describe("AuditReport", () => {
  let AuditReport: typeof import("@/components/AuditReport").AuditReport;

  beforeEach(async () => {
    vi.clearAllMocks();
    const mod = await import("@/components/AuditReport");
    AuditReport = mod.AuditReport;
  });

  it("renders the recommendation summary with correct counts", () => {
    const cards = [
      makeCard({ id: "c1", title: "Depense A", amountBillions: 10 }),
      makeCard({ id: "c2", title: "Depense B", amountBillions: 5 }),
      makeCard({ id: "c3", title: "Depense C", amountBillions: 3 }),
    ];
    const auditResponses: AuditResponse[] = [
      { cardId: "c1", diagnostics: { q1: true }, recommendation: "reduce" },
      { cardId: "c2", diagnostics: { q1: false }, recommendation: "delete" },
      { cardId: "c3", diagnostics: { q1: true }, recommendation: "keep" },
    ];

    render(<AuditReport cards={cards} auditResponses={auditResponses} />);

    // Header
    expect(screen.getByText(/Sur 3 dépenses auditées/)).toBeInTheDocument();

    // Summary items: 1 reduction, 1 suppression, 1 reinforced/kept
    expect(screen.getByText("1 réductions")).toBeInTheDocument();
    expect(screen.getByText("1 suppressions")).toBeInTheDocument();
    expect(screen.getByText("1 renforcées")).toBeInTheDocument();

    // Estimated savings: reduce(10*0.5) + delete(5*1.0) = 10.0 Md
    expect(screen.getByText(/-10\.0 Md€/)).toBeInTheDocument();
  });
});
