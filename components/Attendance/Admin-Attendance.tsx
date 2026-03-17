'use client';

import { useState } from 'react';
import Link from 'next/link';

// ── Types ────────────────────────────────────────────────────────────────────
interface RecentClass {
  class: string;
  teacher: string;
  date: string;
  present: number;
  absent: number;
  late: number;
}

// ── Static data (swap for real API calls) ───────────────────────────────────
const RECENT: RecentClass[] = [
  { class: 'Grade 8A', teacher: 'Mr. Joubert',    date: 'Today, 08:00',  present: 28, absent: 2, late: 1 },
  { class: 'Grade 9B', teacher: 'Ms. Patel',      date: 'Today, 09:15',  present: 30, absent: 0, late: 3 },
  { class: 'Grade 10A',teacher: 'Mr. Dlamini',    date: 'Today, 10:30',  present: 27, absent: 3, late: 1 },
  { class: 'Grade 11C',teacher: 'Mrs. van Wyk',   date: 'Today, 11:45',  present: 25, absent: 1, late: 0 },
];

const QUICK_LINKS = [
  {
    href: '/attendance/mark',
    title: 'Mark Attendance',
    desc: 'Take daily roll-call for any class',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    accent: 'blue',
  },
  {
    href: '/attendance/records',
    title: 'View Records',
    desc: 'Browse and search attendance history',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
    accent: 'emerald',
  },
  {
    href: '/attendance/reports',
    title: 'Reports & Analytics',
    desc: 'Generate detailed reports and trends',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
    accent: 'violet',
  },
  {
    href: '/attendance/alerts',
    title: 'Alerts & Notifications',
    desc: 'Manage low-attendance alerts',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
      </svg>
    ),
    accent: 'amber',
  },
  {
    href: '/attendance/export',
    title: 'Export Data',
    desc: 'Download CSV or PDF reports',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
      </svg>
    ),
    accent: 'sky',
  },
  {
    href: '/attendance/settings',
    title: 'Settings',
    desc: 'Configure rules and thresholds',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
    accent: 'slate',
  },
] as const;

// ── Accent colour maps (Tailwind safe-lists these via full class names) ──────
const ACCENT_ICON_BG: Record<string, string> = {
  blue:    'bg-blue-50 text-blue-600',
  emerald: 'bg-emerald-50 text-emerald-600',
  violet:  'bg-violet-50 text-violet-600',
  amber:   'bg-amber-50 text-amber-600',
  sky:     'bg-sky-50 text-sky-600',
  slate:   'bg-slate-100 text-slate-600',
};

const ACCENT_HOVER_BORDER: Record<string, string> = {
  blue:    'hover:border-blue-400 hover:shadow-blue-100',
  emerald: 'hover:border-emerald-400 hover:shadow-emerald-100',
  violet:  'hover:border-violet-400 hover:shadow-violet-100',
  amber:   'hover:border-amber-400 hover:shadow-amber-100',
  sky:     'hover:border-sky-400 hover:shadow-sky-100',
  slate:   'hover:border-slate-400 hover:shadow-slate-100',
};

const ACCENT_TOP_BAR: Record<string, string> = {
  blue:    'bg-blue-500',
  emerald: 'bg-emerald-500',
  violet:  'bg-violet-500',
  amber:   'bg-amber-500',
  sky:     'bg-sky-500',
  slate:   'bg-slate-400',
};

// ── Rate bar helper ───────────────────────────────────────────────────────────
function rateBarColor(rate: number) {
  if (rate >= 90) return 'bg-emerald-500';
  if (rate >= 75) return 'bg-amber-400';
  return 'bg-red-500';
}
function rateTextColor(rate: number) {
  if (rate >= 90) return 'text-emerald-600';
  if (rate >= 75) return 'text-amber-600';
  return 'text-red-600';
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function AdminAttendancePage({ user }: { user?: any }) {
  const todayDate = new Date().toLocaleDateString('en-ZA', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  });

  const stats = [
    {
      label: 'Present Today',
      value: '142',
      sub: '+4 vs yesterday',
      positive: true,
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      iconBg: 'bg-emerald-50 text-emerald-600',
      bar: 'bg-emerald-500',
      barWidth: 'w-[92%]',
      accent: 'border-l-emerald-500',
    },
    {
      label: 'Absent Today',
      value: '8',
      sub: '–2 vs yesterday',
      positive: true,
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      ),
      iconBg: 'bg-red-50 text-red-500',
      bar: 'bg-red-400',
      barWidth: 'w-[5%]',
      accent: 'border-l-red-400',
    },
    {
      label: 'Late Arrivals',
      value: '5',
      sub: 'Same as yesterday',
      positive: null,
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      iconBg: 'bg-amber-50 text-amber-600',
      bar: 'bg-amber-400',
      barWidth: 'w-[3%]',
      accent: 'border-l-amber-400',
    },
    {
      label: 'Overall Rate',
      value: '94.2%',
      sub: 'This week avg',
      positive: true,
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
        </svg>
      ),
      iconBg: 'bg-blue-50 text-blue-600',
      bar: 'bg-blue-500',
      barWidth: 'w-[94%]',
      accent: 'border-l-blue-500',
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50">

      {/* ── Page Header ───────────────────────────────────────────────── */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-semibold uppercase tracking-widest text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-100">
                  Admin
                </span>
              </div>
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                Attendance Management
              </h1>
              <p className="text-sm text-slate-500 mt-1">{todayDate}</p>
            </div>

            <div className="flex items-center gap-3">
              <Link
                href="/attendance/mark"
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 active:scale-95 transition-all shadow-sm shadow-blue-200"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Mark Attendance
              </Link>
              <Link
                href="/attendance/export"
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-white text-slate-700 text-sm font-semibold rounded-lg border border-slate-200 hover:bg-slate-50 active:scale-95 transition-all"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Export
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">

        {/* ── Stat Cards ────────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {stats.map((s) => (
            <div
              key={s.label}
              className={`bg-white rounded-xl border border-slate-200 border-l-4 ${s.accent} p-5 shadow-sm hover:shadow-md transition-shadow`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className={`p-2 rounded-lg ${s.iconBg}`}>{s.icon}</div>
                {s.positive !== null && (
                  <span className={`text-xs font-medium ${s.positive ? 'text-emerald-600' : 'text-red-500'}`}>
                    {s.sub}
                  </span>
                )}
              </div>
              <div className="text-2xl font-bold text-slate-900 mb-0.5">{s.value}</div>
              <div className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-3">{s.label}</div>
              {/* Mini bar */}
              <div className="h-1 bg-slate-100 rounded-full overflow-hidden">
                <div className={`h-full rounded-full ${s.bar} ${s.barWidth} transition-all`} />
              </div>
            </div>
          ))}
        </div>

        {/* ── Quick Actions Grid ────────────────────────────────────────── */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-slate-800">Quick Actions</h2>
            <span className="text-xs text-slate-400">6 modules</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {QUICK_LINKS.map((item) => (
              <Link key={item.href} href={item.href} className="group block">
                <div
                  className={`
                    relative bg-white rounded-xl border border-slate-200 p-5
                    hover:shadow-lg hover:shadow-slate-100/80 transition-all duration-200
                    ${ACCENT_HOVER_BORDER[item.accent]}
                    overflow-hidden
                  `}
                >
                  {/* Coloured top accent bar */}
                  <div className={`absolute top-0 left-0 right-0 h-0.5 ${ACCENT_TOP_BAR[item.accent]} opacity-0 group-hover:opacity-100 transition-opacity`} />

                  <div className="flex items-start gap-4">
                    <div className={`p-2.5 rounded-xl ${ACCENT_ICON_BG[item.accent]} flex-shrink-0 transition-transform group-hover:scale-110`}>
                      {item.icon}
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-sm font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">
                        {item.title}
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{item.desc}</p>
                    </div>
                    <svg
                      className="w-4 h-4 text-slate-300 group-hover:text-slate-400 group-hover:translate-x-1 transition-all flex-shrink-0 mt-0.5 ml-auto"
                      fill="none" stroke="currentColor" viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* ── Bottom Split: Recent Activity + Weekly Summary ─────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Recent Activity — takes 2 cols */}
          <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <div>
                <h2 className="text-sm font-semibold text-slate-900">Recent Activity</h2>
                <p className="text-xs text-slate-400 mt-0.5">Today's submitted registers</p>
              </div>
              <Link
                href="/attendance/records"
                className="text-xs font-medium text-blue-600 hover:text-blue-700 hover:underline"
              >
                View all →
              </Link>
            </div>

            <div className="divide-y divide-slate-50">
              {RECENT.map((row, i) => {
                const total = row.present + row.absent + row.late;
                const rate  = Math.round((row.present / total) * 100);
                return (
                  <div key={i} className="flex items-center gap-4 px-6 py-4 hover:bg-slate-50 transition-colors group">
                    {/* Class avatar */}
                    <div className="w-9 h-9 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center flex-shrink-0">
                      <span className="text-xs font-bold text-blue-700">{row.class.replace('Grade ', 'G')}</span>
                    </div>

                    {/* Name + teacher */}
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-semibold text-slate-900">{row.class}</div>
                      <div className="text-xs text-slate-400">{row.teacher} · {row.date}</div>
                    </div>

                    {/* Status chips */}
                    <div className="hidden sm:flex items-center gap-1.5 flex-shrink-0">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        {row.present}
                      </span>
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-red-50 text-red-600 border border-red-100">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                        {row.absent}
                      </span>
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-100">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                        {row.late}
                      </span>
                    </div>

                    {/* Rate */}
                    <div className="flex-shrink-0 text-right">
                      <div className={`text-sm font-bold ${rateTextColor(rate)}`}>{rate}%</div>
                      <div className="w-16 h-1 bg-slate-100 rounded-full mt-1 overflow-hidden">
                        <div
                          className={`h-full rounded-full ${rateBarColor(rate)} transition-all`}
                          style={{ width: `${rate}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Weekly Summary — 1 col */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100">
              <h2 className="text-sm font-semibold text-slate-900">This Week</h2>
              <p className="text-xs text-slate-400 mt-0.5">Mon – Fri summary</p>
            </div>
            <div className="p-6 space-y-4">
              {[
                { day: 'Mon', rate: 96 },
                { day: 'Tue', rate: 93 },
                { day: 'Wed', rate: 91 },
                { day: 'Thu', rate: 95 },
                { day: 'Fri', rate: 94 },
              ].map(({ day, rate }) => (
                <div key={day} className="flex items-center gap-3">
                  <span className="w-8 text-xs font-semibold text-slate-500">{day}</span>
                  <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${rateBarColor(rate)} transition-all duration-500`}
                      style={{ width: `${rate}%` }}
                    />
                  </div>
                  <span className={`text-xs font-bold w-9 text-right ${rateTextColor(rate)}`}>{rate}%</span>
                </div>
              ))}
            </div>

            {/* Summary footer */}
            <div className="mx-6 mb-6 p-4 rounded-xl bg-blue-50 border border-blue-100">
              <div className="text-xs font-semibold text-blue-700 uppercase tracking-wide mb-1">Week Average</div>
              <div className="text-3xl font-bold text-blue-700">93.8%</div>
              <div className="text-xs text-blue-500 mt-1">↑ 1.2% from last week</div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}