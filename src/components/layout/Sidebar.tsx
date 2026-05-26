"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  HomeIcon,
  AcademicCapIcon,
  ChartBarIcon,
  CalendarDaysIcon,
  BookOpenIcon,
  Cog6ToothIcon,
  ArrowRightStartOnRectangleIcon,
} from "@heroicons/react/24/outline";
import {
  HomeIcon as HomeIconSolid,
  AcademicCapIcon as AcademicCapIconSolid,
  ChartBarIcon as ChartBarIconSolid,
  CalendarDaysIcon as CalendarDaysIconSolid,
  BookOpenIcon as BookOpenIconSolid,
} from "@heroicons/react/24/solid";
import { signOut } from "next-auth/react";

const navigation = [
  {
    name: "Dashboard",
    href: "/dashboard",
    Icon: HomeIcon,
    IconActive: HomeIconSolid,
  },
  {
    name: "Exercitar",
    href: "/exercitar",
    Icon: AcademicCapIcon,
    IconActive: AcademicCapIconSolid,
  },
  {
    name: "Progresso",
    href: "/progresso",
    Icon: ChartBarIcon,
    IconActive: ChartBarIconSolid,
  },
  {
    name: "Agenda",
    href: "/agenda",
    Icon: CalendarDaysIcon,
    IconActive: CalendarDaysIconSolid,
  },
  {
    name: "Conteúdo",
    href: "/conteudo",
    Icon: BookOpenIcon,
    IconActive: BookOpenIconSolid,
  },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <>
      {/* ── Desktop Sidebar ── */}
      <aside className="hidden lg:flex flex-col w-64 bg-surface border-r border-primary-darker min-h-screen">
        {/* Logo */}
        <div className="flex items-center justify-center px-6 py-5 border-b border-primary-darker">
          <Link
            href="/dashboard"
            className="flex items-center justify-center rounded-xl transition-opacity duration-200 hover:opacity-90"
          >
            <Image
              src="/assets/logoDuma.png"
              alt="DUMA"
              width={132}
              height={66}
              priority
              className="h-auto w-[132px] object-contain"
            />
          </Link>
        </div>

        {/* Nav Links */}
        <nav className="flex-1 px-3 py-4 flex flex-col gap-1">
          {navigation.map((item) => {
            const active = pathname.startsWith(item.href);
            const Icon = active ? item.IconActive : item.Icon;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group ${
                  active
                    ? "bg-primary-darker/60 text-primary"
                    : "text-primary-darker hover:text-primary-dark hover:bg-primary-darker/20"
                }`}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                <span>{item.name}</span>
                {active && (
                  <span className="ml-auto w-1.5 h-1.5 rounded-full bg-primary" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Bottom actions */}
        <div className="px-3 pb-4 flex flex-col gap-1 border-t border-primary-darker pt-4">
          {/* <Link
            href="/configuracoes"
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
              pathname.startsWith("/configuracoes")
                ? "bg-primary-darker/60 text-primary"
                : "text-primary-darker hover:text-primary-dark hover:bg-primary-darker/20"
            }`}
          >
            <Cog6ToothIcon className="w-5 h-5" />
            <span>Configurações</span>
          </Link> */}
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-primary-darker hover:text-danger hover:bg-danger/10 transition-all duration-200 cursor-pointer"
          >
            <ArrowRightStartOnRectangleIcon className="w-5 h-5" />
            <span>Sair</span>
          </button>
        </div>
      </aside>

      {/* ── Mobile Bottom Nav ── */}
      <nav className="lg:hidden fixed bottom-0 inset-x-0 z-50 bg-surface border-t border-primary-darker">
        <div className="flex justify-around items-center h-16 px-2">
          {navigation.map((item) => {
            const active = pathname.startsWith(item.href);
            const Icon = active ? item.IconActive : item.Icon;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex flex-col items-center gap-0.5 text-[11px] font-semibold transition-colors duration-200 ${
                  active ? "text-primary" : "text-primary-darker"
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
