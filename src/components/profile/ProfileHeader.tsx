"use client";

import { useSession, signIn, signOut } from "next-auth/react";
import Image from "next/image";
import { updatePlayerAvatar, type PlayerProfile } from "@/lib/stats";
import { ArchetypeIcon } from "@/components/icons/ArchetypeIcon";

const AVATAR_EMOJIS: { emoji: string; label: string }[] = [
  { emoji: "\uD83D\uDC64", label: "Silhouette" },
  { emoji: "\uD83E\uDD8A", label: "Renard" },
  { emoji: "\uD83E\uDD85", label: "Aigle" },
  { emoji: "\uD83D\uDC3A", label: "Loup" },
  { emoji: "\uD83E\uDD81", label: "Lion" },
  { emoji: "\uD83D\uDC2F", label: "Tigre" },
  { emoji: "\uD83D\uDC3B", label: "Ours" },
  { emoji: "\uD83E\uDD8C", label: "Cerf" },
  { emoji: "\uD83E\uDD88", label: "Requin" },
  { emoji: "\uD83D\uDC09", label: "Dragon" },
  { emoji: "\uD83E\uDD89", label: "Hibou" },
  { emoji: "\uD83E\uDD87", label: "Chauve-souris" },
  { emoji: "\uD83D\uDC0D", label: "Serpent" },
  { emoji: "\uD83E\uDD85", label: "Aigle royal" },
  { emoji: "\uD83D\uDC3C", label: "Panda" },
  { emoji: "\uD83D\uDE80", label: "Fusée" },
  { emoji: "\u2694\uFE0F", label: "Épées" },
  { emoji: "\uD83D\uDEE1\uFE0F", label: "Bouclier" },
  { emoji: "\uD83C\uDFAF", label: "Cible" },
  { emoji: "\uD83D\uDD25", label: "Feu" },
  { emoji: "\u2702\uFE0F", label: "Ciseaux" },
  { emoji: "\uD83D\uDCCA", label: "Graphique" },
  { emoji: "\uD83D\uDCB0", label: "Sac d'argent" },
  { emoji: "\uD83C\uDFF4\u200D\u2620\uFE0F", label: "Drapeau pirate" },
];

const tabs = ["Vue d'ensemble", "Mesures Détaillées", "Journal"] as const;
export type ProfileTab = (typeof tabs)[number];

interface ProfileHeaderProps {
  profile: PlayerProfile | null;
  playerLevel: number;
  xp: number;
  totalSessions: number;
  activeTab: ProfileTab;
  setActiveTab: (tab: ProfileTab) => void;
  showAvatarPicker: boolean;
  setShowAvatarPicker: (show: boolean) => void;
  setProfile: (updater: (p: PlayerProfile | null) => PlayerProfile | null) => void;
}

export function ProfileHeader({
  profile,
  playerLevel,
  xp,
  totalSessions,
  activeTab,
  setActiveTab,
  showAvatarPicker,
  setShowAvatarPicker,
  setProfile,
}: ProfileHeaderProps) {
  const { data: authSession } = useSession();

  return (
    <header className="pt-4 px-4 flex flex-col border-b border-border bg-background sticky top-0 z-40">
      {/* Row 1: Avatar + Pseudo + Auth */}
      <div className="flex items-center gap-3 w-full mb-3">
        <div className="relative flex-shrink-0">
          <button
            onClick={() => setShowAvatarPicker(!showAvatarPicker)}
            aria-label="Choisir ton avatar"
            aria-expanded={showAvatarPicker}
            className="w-11 h-11 rounded-xl bg-card border border-primary/20 flex items-center justify-center text-xl hover:border-primary/50 transition-colors"
          >
            {authSession?.user?.image ? (
              <Image
                src={authSession.user.image}
                alt={authSession.user.name || "Avatar"}
                width={44}
                height={44}
                sizes="44px"
                className="w-full h-full rounded-xl object-cover"
              />
            ) : (
              profile?.customAvatar ? (
                <span aria-hidden="true">{profile.customAvatar}</span>
              ) : (
                <ArchetypeIcon archetypeId={profile?.archetypeId} size={24} />
              )
            )}
          </button>
          <div className="absolute -bottom-1 -right-1 bg-primary text-primary-foreground text-[8px] font-bold px-1 rounded ring-2 ring-background pointer-events-none">
            {playerLevel}
          </div>
          <div className="absolute -top-1 -left-1 bg-card border border-border text-[8px] w-4 h-4 rounded-full flex items-center justify-center pointer-events-none">
            &#9998;
          </div>
          {showAvatarPicker && (
            <div className="absolute top-full left-0 mt-2 z-50 bg-card border border-border rounded-xl p-3 shadow-2xl w-56 max-w-[90vw]">
              <p className="text-[10px] font-bold text-muted-foreground uppercase mb-2">
                Choisis ton avatar
              </p>
              <div className="grid grid-cols-6 gap-1.5">
                {AVATAR_EMOJIS.map(({ emoji, label }, i) => (
                  <button
                    key={i}
                    onClick={(e) => {
                      e.stopPropagation();
                      updatePlayerAvatar(emoji);
                      setProfile((p) => p ? { ...p, customAvatar: emoji } : p);
                      setShowAvatarPicker(false);
                    }}
                    aria-label={`Avatar ${label}`}
                    className="w-8 h-8 rounded-lg hover:bg-primary/20 flex items-center justify-center text-lg transition-colors"
                  >
                    <span aria-hidden="true">{emoji}</span>
                  </button>
                ))}
              </div>
              {authSession?.user?.image && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    updatePlayerAvatar("");
                    setProfile((p) => p ? { ...p, customAvatar: "" } : p);
                    setShowAvatarPicker(false);
                  }}
                  className="mt-2 w-full text-[10px] font-bold text-primary bg-primary/10 border border-primary/20 py-1.5 rounded-lg hover:bg-primary/20 transition-colors"
                >
                  Utiliser ma photo Google/GitHub
                </button>
              )}
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="text-sm font-bold leading-tight truncate">
            {authSession?.user?.name || profile?.username || "Chargement..."}
          </h2>
          <div className="flex items-center gap-2">
            <span className="text-[10px] tabular-nums text-primary">
              {totalSessions > 0 ? "Opérationnel" : "Recrue"}
            </span>
            <span className="w-1 h-1 rounded-full bg-border" />
            <span className="text-[10px] tabular-nums text-muted-foreground">
              {xp.toLocaleString("fr-FR")} XP
            </span>
          </div>
        </div>
        <div className="flex-shrink-0">
          {authSession ? (
            <button
              onClick={() => signOut()}
              className="text-[10px] font-bold text-muted-foreground bg-card border border-border px-2 py-1.5 rounded-lg hover:bg-muted transition-colors"
            >
              Déconnexion
            </button>
          ) : (
            <div className="flex gap-1.5">
              {process.env.NEXT_PUBLIC_AUTH_GOOGLE && (
                <button
                  onClick={() => signIn("google")}
                  className="flex items-center gap-1 text-[10px] font-bold text-foreground bg-card border border-border px-2 py-1.5 rounded-lg hover:bg-muted transition-colors"
                >
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Google
                </button>
              )}
              {process.env.NEXT_PUBLIC_AUTH_GITHUB && (
                <button
                  onClick={() => signIn("github")}
                  className="flex items-center gap-1 text-[10px] font-bold text-foreground bg-card border border-border px-2 py-1.5 rounded-lg hover:bg-muted transition-colors"
                >
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/>
                  </svg>
                  GitHub
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex w-full gap-1 p-1 bg-card/50 rounded-lg mb-3">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-2 px-1 text-[10px] font-bold uppercase tracking-tight rounded-xl transition-colors ${
              activeTab === tab
                ? "bg-primary text-primary-foreground shadow-lg"
                : "text-muted-foreground"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>
    </header>
  );
}
