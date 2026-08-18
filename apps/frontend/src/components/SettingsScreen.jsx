import React, { useState } from "react";
import {
  User,
  Mail,
  Calendar,
  LogOut,
  ChevronRight,
  Bell,
  Lock,
  Palette,
  HelpCircle,
} from "lucide-react";

const C = {
  bg: "#f7f8ef",
  card: "#FFFFFF",
  sand: "#F0E6D8",
  line: "#E9DCC5",
  charcoal: "#2B2B2B",
  muted: "#8A7F6D",
  faint: "#B9AD98",
  primary: "#ff3131",
  onPrimary: "#2B2B2B",
  green: "#154202",
};

const serif = { fontFamily: "Fraunces, serif" };
const sans = { fontFamily: "Inter, sans-serif" };

function InfoRow({ label, value }) {
  return (
    <div
      className="flex items-center justify-between py-3 px-4"
      style={{ borderBottom: `1px solid ${C.line}` }}
    >
      <span className="text-sm" style={{ ...sans, color: C.muted }}>
        {label}
      </span>
      <span
        className="text-sm font-medium"
        style={{ ...sans, color: C.charcoal }}
      >
        {value || "—"}
      </span>
    </div>
  );
}

function SettingsRow({ icon: Icon, label, sublabel, onClick, danger }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-3 w-full py-3 px-4 text-left transition-colors hover:bg-opacity-50 group"
      style={{ borderBottom: `1px solid ${C.line}` }}
    >
      <div
        className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ background: danger ? "#FFF0F0" : C.sand }}
      >
        <Icon size={15} color={danger ? C.primary : C.muted} />
      </div>
      <div className="flex-1">
        <p
          className="text-sm font-medium"
          style={{ ...sans, color: danger ? C.primary : C.charcoal }}
        >
          {label}
        </p>
        {sublabel && (
          <p className="text-xs mt-0.5" style={{ ...sans, color: C.faint }}>
            {sublabel}
          </p>
        )}
      </div>
      {!danger && <ChevronRight size={15} color={C.faint} />}
    </button>
  );
}

export default function SettingsScreen({ session, onLogout }) {
  const user = session?.user;
  const email = user?.email || "—";
  const createdAt = user?.created_at
    ? new Date(user.created_at).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : "—";

  // Derive initials from email or display name
  const displayName =
    user?.user_metadata?.full_name || user?.user_metadata?.name || null;
  const initials = displayName
    ? displayName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : email.slice(0, 2).toUpperCase();

  return (
    <div
      className="flex-1 overflow-y-auto px-8 py-7"
      style={{ background: C.bg }}
    >
      <div className="max-w-lg mx-auto">
        {/* Header */}
        <h1
          className="text-2xl mb-6"
          style={{ ...serif, fontWeight: 600, color: C.charcoal }}
        >
          Settings
        </h1>

        {/* Avatar + name */}
        <div
          className="flex items-center gap-4 p-5 rounded-2xl mb-6"
          style={{ background: C.card, border: `1px solid ${C.line}` }}
        >
          <div
            className="w-14 h-14 rounded-full flex items-center justify-center flex-shrink-0"
            style={{ background: C.primary }}
          >
            <span
              className="text-lg font-semibold"
              style={{ ...sans, color: C.onPrimary }}
            >
              {initials}
            </span>
          </div>
          <div>
            <p
              className="text-base font-semibold"
              style={{ ...serif, color: C.charcoal }}
            >
              {displayName || email}
            </p>
            <p className="text-xs mt-0.5" style={{ ...sans, color: C.muted }}>
              Member since {createdAt}
            </p>
          </div>
        </div>

        {/* Account info */}
        <p
          className="text-xs font-bold uppercase tracking-widest mb-2 px-1"
          style={{ ...sans, color: C.faint }}
        >
          Account
        </p>
        <div
          className="rounded-2xl overflow-hidden mb-6"
          style={{ background: C.card, border: `1px solid ${C.line}` }}
        >
          <InfoRow label="Email" value={email} />
          <InfoRow
            label="User ID"
            value={user?.id ? `${user.id.slice(0, 8)}...` : "—"}
          />
          <InfoRow label="Member since" value={createdAt} />
          <div
            className="py-3 px-4 flex items-center justify-between"
            style={{ borderBottom: `1px solid ${C.line}` }}
          >
            <span className="text-sm" style={{ ...sans, color: C.muted }}>
              Email verified
            </span>
            <span
              className="text-xs font-semibold px-2.5 py-1 rounded-full"
              style={{
                ...sans,
                background: user?.email_confirmed_at ? "#E8F5E0" : C.sand,
                color: user?.email_confirmed_at ? C.green : C.muted,
              }}
            >
              {user?.email_confirmed_at ? "Verified" : "Unverified"}
            </span>
          </div>
          <InfoRow
            label="Last sign in"
            value={
              user?.last_sign_in_at
                ? new Date(user.last_sign_in_at).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })
                : "—"
            }
          />
        </div>

        {/* Preferences — coming soon placeholders */}
        <p
          className="text-xs font-bold uppercase tracking-widest mb-2 px-1"
          style={{ ...sans, color: C.faint }}
        >
          Preferences
        </p>
        <div
          className="rounded-2xl overflow-hidden mb-6"
          style={{ background: C.card, border: `1px solid ${C.line}` }}
        >
          <SettingsRow
            icon={User}
            label="Diet preferences"
            sublabel="Coming soon — set dietary restrictions and goals"
          />
          <SettingsRow
            icon={Bell}
            label="Notifications"
            sublabel="Coming soon — meal planning reminders"
          />
          <SettingsRow
            icon={Palette}
            label="Appearance"
            sublabel="Coming soon — theme and display options"
          />
        </div>

        {/* Security */}
        <p
          className="text-xs font-bold uppercase tracking-widest mb-2 px-1"
          style={{ ...sans, color: C.faint }}
        >
          Security
        </p>
        <div
          className="rounded-2xl overflow-hidden mb-6"
          style={{ background: C.card, border: `1px solid ${C.line}` }}
        >
          <SettingsRow
            icon={Lock}
            label="Change password"
            sublabel="Coming soon"
          />
          <SettingsRow
            icon={HelpCircle}
            label="Help & support"
            sublabel="Coming soon"
          />
        </div>

        {/* Sign out */}
        <div
          className="rounded-2xl overflow-hidden"
          style={{ background: C.card, border: `1px solid ${C.line}` }}
        >
          <SettingsRow
            icon={LogOut}
            label="Sign out"
            onClick={onLogout}
            danger
          />
        </div>

        <p
          className="text-center text-xs mt-6"
          style={{ ...sans, color: C.faint }}
        >
          Party of One · v0.1.0
        </p>
      </div>
    </div>
  );
}
