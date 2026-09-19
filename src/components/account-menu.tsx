"use client";

import Link from "next/link";
import { signOutAction } from "@/lib/actions";
import { Avatar } from "./ui/badge";
import { LogOut, Settings } from "lucide-react";

export function AccountMenu({
  name,
  roleLabel,
  settingsHref,
}: {
  name: string;
  roleLabel: string;
  settingsHref: string;
}) {
  return (
    <div className="border-t border-white/10 px-3 py-3">
      <div className="flex items-center gap-3 px-2 py-2">
        <Avatar name={name} className="size-10 shrink-0 bg-white/10 text-mint" />
        <div className="min-w-0">
          <p className="truncate text-base font-semibold">{name}</p>
          <p className="truncate text-sm text-white/50">{roleLabel}</p>
        </div>
      </div>
      <div className="mt-1 space-y-0.5">
        <Link
          href={settingsHref}
          className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-white/80 hover:bg-white/5 hover:text-white"
        >
          <Settings className="size-4" />
          Settings
        </Link>
        <form action={signOutAction}>
          <button
            type="submit"
            className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm font-semibold text-white/80 hover:bg-white/5 hover:text-white"
          >
            <LogOut className="size-4" />
            Log out
          </button>
        </form>
      </div>
    </div>
  );
}
