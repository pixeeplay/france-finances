"use client";

import { useRouter } from "next/navigation";
import { UiIcon } from "@/components/icons/UiIcon";

export function ReplayTutorialButton() {
  const router = useRouter();

  function handleReplay() {
    localStorage.removeItem("trnc:onboarded");
    router.push("/");
  }

  return (
    <button
      onClick={handleReplay}
      className="flex items-center gap-2 bg-info/10 text-info font-semibold text-sm px-4 py-3 rounded-xl border border-info/20 hover:bg-info/20 transition-colors w-full"
    >
      <UiIcon name="book" size={20} />
      Revoir le tutoriel
    </button>
  );
}
