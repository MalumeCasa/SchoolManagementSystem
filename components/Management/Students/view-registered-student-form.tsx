"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  User, Users, Phone, Stethoscope, ShieldCheck, Banknote,
  CheckCircle2, XCircle, MinusCircle, Pencil, ArrowLeft,
  GraduationCap, MapPin, Mail, PhoneCall, Calendar, Hash,
  HeartPulse, AlertTriangle, Pill, Activity, FileSignature,
  CreditCard, Building2, Baby, Truck, Globe, Award,
  Clock, UserCheck, UserPlus, FileText, Home, Shield,
  Sparkles, BadgeCheck, Medal, Star, Heart, BookOpen,
  DollarSign, CalendarDays, ClipboardList, Ambulance,
  CreditCard as CreditCardIcon, Users2, HeartHandshake,
  Brain, Eye, Droplet, Thermometer, Syringe, Scissors,
  Info, Briefcase, Smartphone, Wind,
} from "lucide-react";
import type { InferSelectModel } from "drizzle-orm";
import type { registeredStudents } from "@lib/db/schema";
import { motion, AnimatePresence } from "framer-motion";

// ─── Types ────────────────────────────────────────────────────────────────────

type RegStudent = InferSelectModel<typeof registeredStudents>;

type LiveStudent = {
  id: number;
  studentId: string | null;
  className: string | null;
  classSection: string | null;
  status: string | null;
  enrollmentDate: string | null;
  attendance: string | null;
  classId: number | null;
} | null;

export type Student = RegStudent & { liveStudent?: LiveStudent };
export interface ViewRegisteredStudentFormProps { student: Student; }

// ─── Formatters ───────────────────────────────────────────────────────────────

const fmtNull  = (v: string | null | undefined) => (v && v.trim() !== "" ? v : null);
const fmtDate  = (v: string | null | undefined): string | null => {
  if (!v || !v.trim()) return null;
  const d = new Date(v);
  return isNaN(d.getTime()) ? v : d.toLocaleDateString("en-ZA", { 
    year: "numeric", 
    month: "long", 
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
};
const fmtArr   = (v: string[] | null | undefined) => (v ?? []).filter(Boolean);
const fmtMoney = (v: number | null | undefined) => (v != null ? `R\u202f${v.toLocaleString("en-ZA")}` : null);
const fmtInitials = (firstName?: string | null, lastName?: string | null) => {
  return `${firstName?.[0]?.toUpperCase() || ''}${lastName?.[0]?.toUpperCase() || ''}` || '?';
};

// ─── Completion ───────────────────────────────────────────────────────────────

function useCompletion(s: Student) {
  const ok = (v: unknown) => v != null && v !== "" && !(Array.isArray(v) && !v.filter(Boolean).length);
  const pct = (fs: unknown[]) => Math.round((fs.filter(ok).length / fs.length) * 100);
  return {
    student:   pct([s.surname, s.name, s.dateOfBirth, s.idNumber, s.phone, s.email, s.address, s.sex, s.dateOfEnrolment]),
    parents:   pct([s.motherFirstNames, s.motherSurname, s.motherCell, s.fatherFirstNames, s.fatherSurname, s.fatherCell]),
    emergency: pct([s.emergencyContactFriendName, s.emergencyContactFriendCell, s.emergencyContactKinName, s.emergencyContactKinCell]),
    medical:   pct([s.familyDoctor, s.doctorPhone, s.immunisationUpToDate]),
    financial: pct([s.financialAgreedTerms, s.financialAgreedLiability, s.financialAgreedCancellation, s.monthlyAmount, s.paymentDate]),
    consents:  pct([s.popiConsent, s.indemnityAgreement, s.signatory1FullName]),
  };
}

// ─── Primitives ───────────────────────────────────────────────────────────────

function StatusBadge({ status, size = "md" }: { status: string | null | undefined; size?: "sm" | "md" }) {
  const s = (status ?? "pending").toLowerCase();
  const sizes = {
    sm: "px-2 py-0.5 text-[10px]",
    md: "px-2.5 py-0.5 text-xs"
  };
  
  const styles: Record<string, string> = {
    pending:  "bg-amber-50 text-amber-700 ring-amber-200 dark:bg-amber-900/20 dark:text-amber-300 dark:ring-amber-700/40",
    active:   "bg-emerald-50 text-emerald-700 ring-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-300 dark:ring-emerald-700/40",
    approved: "bg-sky-50 text-sky-700 ring-sky-200 dark:bg-sky-900/20 dark:text-sky-300 dark:ring-sky-700/40",
    rejected: "bg-rose-50 text-rose-700 ring-rose-200 dark:bg-rose-900/20 dark:text-rose-300 dark:ring-rose-700/40",
    archived: "bg-slate-100 text-slate-600 ring-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:ring-slate-600/40",
  };
  
  const icons = {
    pending: Clock,
    active: BadgeCheck,
    approved: CheckCircle2,
    rejected: XCircle,
    archived: MinusCircle,
  };
  
  const Icon = icons[s as keyof typeof icons] || Clock;
  const cls = styles[s] ?? styles.pending;
  const label = (status ?? "Pending")[0].toUpperCase() + (status ?? "pending").slice(1);
  
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full font-medium ring-1 ${sizes[size]} ${cls}`}>
      <Icon className="h-3 w-3" />
      {label}
    </span>
  );
}

/** A single data row with improved visual hierarchy */
function DataRow({
  label, value, tags, icon: Icon, mono = false, empty = "Not provided", highlight = false,
}: {
  label: string;
  value?: string | null;
  tags?: string[];
  icon?: React.ElementType;
  mono?: boolean;
  empty?: string;
  highlight?: boolean;
}) {
  const isEmpty = !value && (!tags || !tags.length);
  return (
    <motion.div 
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      className={`group flex items-start gap-3 py-3 border-b border-gray-100 dark:border-white/5 last:border-0 transition-colors hover:bg-gray-50/50 dark:hover:bg-white/2 px-2 rounded-lg ${highlight ? 'bg-amber-50/50 dark:bg-amber-900/10' : ''}`}
    >
      {Icon && (
        <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-gray-100 dark:bg-white/5 group-hover:bg-white dark:group-hover:bg-white/10 transition-colors">
          <Icon className="h-3.5 w-3.5 text-gray-500 dark:text-gray-400" />
        </span>
      )}
      <div className="min-w-0 flex-1">
        <p className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500">{label}</p>
        {isEmpty ? (
          <p className="text-sm italic text-gray-300 dark:text-gray-600 flex items-center gap-1">
            <MinusCircle className="h-3.5 w-3.5" /> {empty}
          </p>
        ) : tags?.length ? (
          <div className="flex flex-wrap gap-1.5 pt-0.5">
            {tags.map((t, i) => (
              <span key={i} className="rounded-lg bg-gradient-to-r from-indigo-50 to-indigo-50/80 dark:from-indigo-900/20 dark:to-indigo-900/10 px-2.5 py-1 text-xs font-medium text-indigo-700 dark:text-indigo-300 ring-1 ring-indigo-200 dark:ring-indigo-700/40 shadow-sm">
                {t}
              </span>
            ))}
          </div>
        ) : (
          <p className={`text-sm text-gray-900 dark:text-gray-100 ${mono ? "font-mono text-xs tracking-wider" : ""}`}>{value}</p>
        )}
      </div>
    </motion.div>
  );
}

/** Boolean displayed with nicer styling */
function BoolRow({ label, value, icon: Icon }: { label: string; value: boolean | null | undefined; icon?: React.ElementType }) {
  return (
    <div className="flex items-center justify-between py-2.5 px-2 rounded-lg hover:bg-gray-50/50 dark:hover:bg-white/2 transition-colors">
      <span className="text-sm text-gray-600 dark:text-gray-300 flex items-center gap-2">
        {Icon && <Icon className="h-4 w-4 text-gray-400" />}
        {label}
      </span>
      {value === null || value === undefined ? (
        <span className="inline-flex items-center gap-1.5 rounded-lg bg-gray-100 dark:bg-white/5 px-2.5 py-1 text-xs text-gray-500">
          <MinusCircle className="h-3.5 w-3.5" /> Not specified
        </span>
      ) : value ? (
        <span className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 px-3 py-1 text-xs font-semibold text-emerald-700 dark:text-emerald-300 ring-1 ring-emerald-200 dark:ring-emerald-700/30">
          <CheckCircle2 className="h-3.5 w-3.5" /> Yes
        </span>
      ) : (
        <span className="inline-flex items-center gap-1.5 rounded-lg bg-rose-50 dark:bg-rose-900/20 px-3 py-1 text-xs font-semibold text-rose-600 dark:text-rose-400 ring-1 ring-rose-200 dark:ring-rose-700/30">
          <XCircle className="h-3.5 w-3.5" /> No
        </span>
      )}
    </div>
  );
}

/** Modern card panel with glass morphism effect */
function Panel({
  title, subtitle, accent = "blue", children, className = "", action,
}: {
  title: string; 
  subtitle?: string; 
  accent?: keyof typeof ACCENTS; 
  children: React.ReactNode; 
  className?: string;
  action?: React.ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`group rounded-xl bg-white dark:bg-gray-900/80 backdrop-blur-sm border border-gray-200 dark:border-white/10 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden ${className}`}
    >
      {/* Colored accent bar */}
      <div className={`h-1.5 w-full bg-gradient-to-r ${ACCENTS[accent].gradient}`} />
      
      <div className="p-5">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className={`text-sm font-bold uppercase tracking-wider ${ACCENTS[accent].text}`}>
              {title}
            </h3>
            {subtitle && (
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                <Info className="h-3 w-3" />
                {subtitle}
              </p>
            )}
          </div>
          {action && (
            <div className="opacity-0 group-hover:opacity-100 transition-opacity">
              {action}
            </div>
          )}
        </div>
        <div className="space-y-1">{children}</div>
      </div>
    </motion.div>
  );
}

const ACCENTS = {
  blue:    { 
    gradient: "from-blue-400 to-blue-500", 
    text: "text-blue-600 dark:text-blue-400",
    border: "border-blue-200 dark:border-blue-800",
    bg: "bg-blue-50 dark:bg-blue-900/20"
  },
  violet:  { 
    gradient: "from-violet-400 to-violet-500", 
    text: "text-violet-600 dark:text-violet-400",
    border: "border-violet-200 dark:border-violet-800",
    bg: "bg-violet-50 dark:bg-violet-900/20"
  },
  red:     { 
    gradient: "from-red-400 to-rose-500", 
    text: "text-red-600 dark:text-red-400",
    border: "border-red-200 dark:border-red-800",
    bg: "bg-red-50 dark:bg-red-900/20"
  },
  emerald: { 
    gradient: "from-emerald-400 to-teal-500", 
    text: "text-emerald-600 dark:text-emerald-400",
    border: "border-emerald-200 dark:border-emerald-800",
    bg: "bg-emerald-50 dark:bg-emerald-900/20"
  },
  amber:   { 
    gradient: "from-amber-400 to-orange-500", 
    text: "text-amber-600 dark:text-amber-400",
    border: "border-amber-200 dark:border-amber-800",
    bg: "bg-amber-50 dark:bg-amber-900/20"
  },
  slate:   { 
    gradient: "from-slate-400 to-slate-500", 
    text: "text-slate-600 dark:text-slate-400",
    border: "border-slate-200 dark:border-slate-800",
    bg: "bg-slate-50 dark:bg-slate-900/20"
  },
} as const;

function Grid({ cols = 2, children }: { cols?: 2 | 3; children: React.ReactNode }) {
  return (
    <div className={`grid grid-cols-1 gap-5 ${
      cols === 2 ? "md:grid-cols-2" : "md:grid-cols-3"
    }`}>
      {children}
    </div>
  );
}

// ─── Metric Card for quick stats ──────────────────────────────────────────────

function MetricCard({ icon: Icon, label, value, trend }: { icon: React.ElementType; label: string; value: string; trend?: { value: number; label: string } }) {
  return (
    <motion.div 
      whileHover={{ y: -2 }}
      className="relative overflow-hidden rounded-xl bg-white dark:bg-gray-900/80 border border-gray-200 dark:border-white/10 p-4 shadow-sm hover:shadow-md transition-all"
    >
      <div className="absolute right-0 top-0 h-20 w-20 translate-x-6 -translate-y-6 opacity-10">
        <Icon className="h-full w-full" />
      </div>
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">{label}</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
          {trend && (
            <p className={`text-xs flex items-center gap-1 ${
              trend.value > 0 ? 'text-emerald-600' : 'text-rose-600'
            }`}>
              {trend.value > 0 ? '↑' : '↓'} {Math.abs(trend.value)}% {trend.label}
            </p>
          )}
        </div>
        <div className="rounded-lg bg-gray-100 dark:bg-white/5 p-2.5">
          <Icon className="h-5 w-5 text-gray-600 dark:text-gray-300" />
        </div>
      </div>
    </motion.div>
  );
}

// ─── Parent / guardian block with improved design ────────────────────────────

function ParentPanel({
  title, accent,
  titleVal, firstNames, surname, idNumber,
  occupation, employer, cell, workPhone, homePhone, email,
  homeAddress, workAddress,
}: {
  title: string; accent: keyof typeof ACCENTS;
  titleVal?: string | null; firstNames?: string | null; surname?: string | null;
  idNumber?: string | null; occupation?: string | null; employer?: string | null;
  cell?: string | null; workPhone?: string | null; homePhone?: string | null;
  email?: string | null; homeAddress?: string | null; workAddress?: string | null;
}) {
  const hasData = [titleVal, firstNames, surname, idNumber, occupation, employer, cell, workPhone, homePhone, email, homeAddress, workAddress].some(v => v && v.trim());
  const initials = fmtInitials(firstNames, surname);
  
  return (
    <Panel title={title} accent={accent}>
      {!hasData ? (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <div className="mb-3 rounded-full bg-gray-100 dark:bg-white/5 p-3">
            <UserPlus className="h-6 w-6 text-gray-400" />
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400">No details recorded</p>
        </div>
      ) : (
        <>
          {/* Profile header */}
          <div className="mb-4 flex items-center gap-3 pb-3 border-b border-gray-100 dark:border-white/5">
            <div className={`relative flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-lg font-bold text-white bg-gradient-to-br ${ACCENTS[accent].gradient} shadow-lg`}>
              {initials}
              {idNumber && (
                <span className="absolute -bottom-1 -right-1 h-3 w-3 rounded-full bg-emerald-500 border-2 border-white dark:border-gray-900" />
              )}
            </div>
            <div>
              <p className="text-base font-semibold text-gray-900 dark:text-white">
                {titleVal && <span className="mr-1 text-sm text-gray-500">{titleVal}</span>}
                {firstNames} {surname}
              </p>
              {idNumber && (
                <p className="flex items-center gap-1 font-mono text-xs text-gray-500 dark:text-gray-400">
                  <Hash className="h-3 w-3" /> {idNumber}
                </p>
              )}
            </div>
          </div>
          
          <DataRow icon={Briefcase} label="Occupation" value={fmtNull(occupation)} />
          <DataRow icon={Building2} label="Employer" value={fmtNull(employer)} />
          <DataRow icon={Smartphone} label="Cell" value={fmtNull(cell)} />
          <DataRow icon={Phone} label="Work Phone" value={fmtNull(workPhone)} />
          <DataRow icon={Phone} label="Home Phone" value={fmtNull(homePhone)} />
          <DataRow icon={Mail} label="Email" value={fmtNull(email)} />
          <DataRow icon={Home} label="Home Address" value={fmtNull(homeAddress)} />
          <DataRow icon={Building2} label="Work Address" value={fmtNull(workAddress)} />
        </>
      )}
    </Panel>
  );
}

// ─── Tab panels with improved layouts ─────────────────────────────────────────

function TabStudent({ s }: { s: Student }) {
  const sid = s.liveStudent?.studentId ?? fmtNull(s.studentId);
  const cls = s.liveStudent?.className
    ? `${s.liveStudent.className}${s.liveStudent.classSection ? ` · ${s.liveStudent.classSection}` : ""}`
    : null;

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ staggerChildren: 0.1 }}
      className="space-y-5"
    >
      {/* Quick metrics row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <MetricCard 
          icon={Hash} 
          label="Student ID" 
          value={sid ?? "Not assigned"} 
        />
        <MetricCard 
          icon={GraduationCap} 
          label="Class" 
          value={cls ?? "Not placed"} 
        />
        <MetricCard 
          icon={Calendar} 
          label="Date of Birth" 
          value={fmtDate(s.dateOfBirth) ?? "—"} 
        />
        <MetricCard 
          icon={Activity} 
          label="Status" 
          value={s.status ?? "Pending"} 
        />
      </div>

      <Grid>
        <Panel title="Identity" accent="blue" action={<Pencil className="h-3.5 w-3.5 text-gray-400" />}>
          <DataRow icon={User} label="Surname" value={fmtNull(s.surname)} />
          <DataRow icon={User} label="First Name/s" value={fmtNull(s.name)} />
          <DataRow icon={Sparkles} label="Preferred Name" value={fmtNull(s.preferredName)} />
          <DataRow icon={Hash} label="ID / Passport No." value={fmtNull(s.idNumber)} mono />
          <DataRow icon={Calendar} label="Date of Birth" value={fmtDate(s.dateOfBirth)} />
          <DataRow icon={Users} label="Sex" value={fmtNull(s.sex)} />
          <DataRow icon={Globe} label="Religion" value={fmtNull(s.religion)} />
        </Panel>

        <Panel title="Contact & Home" accent="blue">
          <DataRow icon={Smartphone} label="Phone" value={fmtNull(s.phone)} />
          <DataRow icon={Mail} label="Email" value={fmtNull(s.email)} />
          <DataRow icon={Home} label="Address" value={fmtNull(s.address)} />
          <DataRow icon={Globe} label="Home Language/s" tags={fmtArr(s.homeLanguage)} />
          <DataRow icon={HeartHandshake} label="Lives With" tags={fmtArr(s.livesWith)} />
          <DataRow icon={Users} label="Children in Family" value={s.numberOfChildrenInFamily?.toString() ?? null} />
          <DataRow icon={Medal} label="Position in Family" value={s.positionInFamily?.toString() ?? null} />
        </Panel>

        <Panel title="Enrolment" accent="blue">
          <DataRow icon={Calendar} label="Date of Enrolment" value={fmtDate(s.liveStudent?.enrollmentDate ?? s.dateOfEnrolment)} />
          <DataRow icon={Clock} label="Age at Enrolment" value={s.ageAtEnrolment?.toString() ?? null} />
          <DataRow icon={BookOpen} label="Previous School" value={fmtNull(s.previousSchool)} />
          <DataRow icon={Award} label="Intended Primary School" value={fmtNull(s.intendedPrimarySchool)} />
          <DataRow icon={HeartHandshake} label="Care Required" value={fmtNull(s.careRequired)} />
          {s.liveStudent && <DataRow icon={Activity} label="Enrolment Status" value={fmtNull(s.liveStudent.status)} />}
          {s.liveStudent && <DataRow icon={CalendarDays} label="Attendance" value={fmtNull(s.liveStudent.attendance)} />}
        </Panel>

        <Panel title="Authorisations & Instructions" accent="blue">
          <DataRow icon={UserCheck} label="Authorised to Bring" tags={fmtArr(s.authorizedToBring)} />
          <DataRow icon={UserPlus} label="Authorised to Collect" tags={fmtArr(s.authorizedToCollect)} />
          <DataRow icon={FileText} label="Special Instructions" value={fmtNull(s.specialInstructions)} />
        </Panel>
      </Grid>
    </motion.div>
  );
}

function TabParents({ s }: { s: Student }) {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-5"
    >
      <Grid cols={3}>
        <ParentPanel title="Mother" accent="violet"
          titleVal={s.motherTitle}    firstNames={s.motherFirstNames}   surname={s.motherSurname}
          idNumber={s.motherIdNumber} occupation={s.motherOccupation}   employer={s.motherEmployer}
          cell={s.motherCell}         workPhone={s.motherWorkPhone}      homePhone={s.motherHomePhone}
          email={s.motherEmail}       homeAddress={s.motherHomeAddress}  workAddress={s.motherWorkAddress}
        />
        <ParentPanel title="Father" accent="violet"
          titleVal={s.fatherTitle}    firstNames={s.fatherFirstNames}   surname={s.fatherSurname}
          idNumber={s.fatherIdNumber} occupation={s.fatherOccupation}   employer={s.fatherEmployer}
          cell={s.fatherCell}         workPhone={s.fatherWorkPhone}      homePhone={s.fatherHomePhone}
          email={s.fatherEmail}       homeAddress={s.fatherHomeAddress}  workAddress={s.fatherWorkAddress}
        />
        <ParentPanel title="Guardian" accent="violet"
          titleVal={s.guardianTitle}    firstNames={s.guardianFirstNames}   surname={s.guardianSurname}
          idNumber={s.guardianIdNumber} occupation={s.guardianOccupation}   employer={s.guardianEmployer}
          cell={s.guardianCell}         workPhone={s.guardianWorkPhone}      homePhone={s.guardianHomePhone}
          email={s.guardianEmail}       homeAddress={s.guardianHomeAddress}  workAddress={s.guardianWorkAddress}
        />
      </Grid>
      
      <Grid>
        <Panel title="Family Details" accent="slate">
          <DataRow icon={HeartHandshake} label="Marital Status" value={fmtNull(s.maritalStatus)} />
        </Panel>
      </Grid>
    </motion.div>
  );
}

function TabEmergencyTransport({ s }: { s: Student }) {
  const transports = [
    { name: fmtNull(s.transportContact1Name), phone: fmtNull(s.transportContact1Phone) },
    { name: fmtNull(s.transportContact2Name), phone: fmtNull(s.transportContact2Phone) },
    { name: fmtNull(s.transportContact3Name), phone: fmtNull(s.transportContact3Phone) },
  ];
  const hasTransport = transports.some(t => t.name || t.phone);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-5"
    >
      <Grid>
        <Panel title="Emergency Contact — Friend" accent="red">
          <DataRow icon={User} label="Full Name" value={fmtNull(s.emergencyContactFriendName)} />
          <DataRow icon={HeartHandshake} label="Relationship" value={fmtNull(s.emergencyContactFriendRelationship)} />
          <DataRow icon={Smartphone} label="Cell" value={fmtNull(s.emergencyContactFriendCell)} />
          <DataRow icon={Phone} label="Work Phone" value={fmtNull(s.emergencyContactFriendWorkPhone)} />
          <DataRow icon={Phone} label="Home Phone" value={fmtNull(s.emergencyContactFriendHomePhone)} />
          <DataRow icon={Home} label="Address" value={fmtNull(s.emergencyContactFriendAddress)} />
        </Panel>

        <Panel title="Emergency Contact — Next of Kin" accent="red">
          <DataRow icon={User} label="Full Name" value={fmtNull(s.emergencyContactKinName)} />
          <DataRow icon={HeartHandshake} label="Relationship" value={fmtNull(s.emergencyContactKinRelationship)} />
          <DataRow icon={Smartphone} label="Cell" value={fmtNull(s.emergencyContactKinCell)} />
          <DataRow icon={Phone} label="Work Phone" value={fmtNull(s.emergencyContactKinWorkPhone)} />
          <DataRow icon={Phone} label="Home Phone" value={fmtNull(s.emergencyContactKinHomePhone)} />
          <DataRow icon={Home} label="Address" value={fmtNull(s.emergencyContactKinAddress)} />
        </Panel>
      </Grid>

      {/* Transport contacts with modern card design */}
      <Panel title="Transport Contacts" subtitle="Persons authorised to transport this student" accent="red">
        {!hasTransport ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="mb-3 rounded-full bg-gray-100 dark:bg-white/5 p-3">
              <Truck className="h-6 w-6 text-gray-400" />
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">No transport contacts recorded</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {transports.map((t, i) => (
              <motion.div
                key={i}
                whileHover={{ y: -2 }}
                className={`relative overflow-hidden rounded-xl border p-4 transition-all ${
                  t.name || t.phone 
                    ? 'border-red-200 bg-gradient-to-br from-red-50 to-white dark:from-red-950/30 dark:to-gray-900/80 dark:border-red-800/50 shadow-sm hover:shadow-md' 
                    : 'border-dashed border-gray-200 dark:border-white/10 bg-gray-50/50 dark:bg-gray-900/40'
                }`}
              >
                {t.name || t.phone && (
                  <div className="absolute right-0 top-0 h-20 w-20 translate-x-6 -translate-y-6 opacity-5">
                    <Truck className="h-full w-full" />
                  </div>
                )}
                <p className="mb-3 text-xs font-bold uppercase tracking-wider text-red-500 dark:text-red-400 flex items-center gap-1">
                  <Truck className="h-3.5 w-3.5" /> Contact {i + 1}
                </p>
                {t.name || t.phone ? (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-red-400" />
                      <span className="text-sm font-medium text-gray-800 dark:text-gray-200">{t.name ?? "—"}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Smartphone className="h-4 w-4 text-red-400" />
                      <span className="text-sm text-gray-600 dark:text-gray-400">{t.phone ?? "—"}</span>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm italic text-gray-400 dark:text-gray-500">No contact recorded</p>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </Panel>
    </motion.div>
  );
}

function TabMedical({ s }: { s: Student }) {
  const conditions = s.medicalConditions ?? [];
  const has = (n: string) => conditions.some(c => c.toLowerCase().includes(n.toLowerCase()));

  const conditionItems = [
    { label: "Diabetes", icon: Droplet, active: has("diabetes") },
    { label: "Asthma", icon: Wind, active: has("asthma") },
    { label: "Epilepsy", icon: Brain, active: has("epilepsy") },
    { label: "Cardiac", icon: Heart, active: has("cardiac") },
    { label: "Allergies", icon: AlertTriangle, active: has("allergy") },
    { label: "Visual", icon: Eye, active: has("vision") || has("visual") || has("eye") },
  ];
  
  const activeConditions = conditionItems.filter(c => c.active);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-5"
    >
      <Grid>
        <Panel title="Family Doctor" accent="emerald">
          <DataRow icon={Stethoscope} label="Doctor Name" value={fmtNull(s.familyDoctor)} />
          <DataRow icon={Smartphone} label="Doctor Phone" value={fmtNull(s.doctorPhone)} />
        </Panel>

        <Panel title="Medical Conditions" subtitle="Active conditions requiring attention" accent="emerald">
          {activeConditions.length ? (
            <div className="grid grid-cols-2 gap-2">
              {activeConditions.map(c => {
                const Icon = c.icon;
                return (
                  <div key={c.label} className="flex items-center gap-2 rounded-lg bg-red-50 dark:bg-red-900/20 p-2 ring-1 ring-red-200 dark:ring-red-700/40">
                    <Icon className="h-4 w-4 text-red-500" />
                    <span className="text-xs font-medium text-red-700 dark:text-red-300">{c.label}</span>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-4 text-center">
              <div className="mb-2 rounded-full bg-emerald-100 dark:bg-emerald-900/30 p-2">
                <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400">No conditions recorded</p>
            </div>
          )}
          {s.medicalConditionsDetails && (
            <div className="mt-3 rounded-lg bg-gray-50 dark:bg-white/5 p-3">
              <p className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">Additional Details</p>
              <p className="text-sm text-gray-700 dark:text-gray-300">{s.medicalConditionsDetails}</p>
            </div>
          )}
        </Panel>
      </Grid>

      <Grid>
        <Panel title="Medical History" accent="emerald">
          <DataRow icon={Baby} label="Childhood Sicknesses" value={fmtNull(s.childhoodSicknesses)} />
          <DataRow icon={AlertTriangle} label="Life-threatening Allergies" value={fmtNull(s.lifeThreateningAllergies)} />
          <DataRow icon={AlertTriangle} label="Other Allergies" value={fmtNull(s.otherAllergies)} />
          <DataRow icon={Scissors} label="Major Operations" value={fmtNull(s.majorOperations)} />
          <DataRow icon={Baby} label="Birth Complications" value={fmtNull(s.birthComplications)} />
          <DataRow icon={Heart} label="Family Medical History" value={fmtNull(s.familyMedicalHistory)} />
        </Panel>

        <Panel title="Development & Medications" accent="emerald">
          <DataRow icon={Brain} label="Behaviour Problems" value={fmtNull(s.behaviorProblems)} />
          <DataRow icon={Eye} label="Speech / Hearing" value={fmtNull(s.speechHearingProblems)} />
          <DataRow icon={Pill} label="Medication Details" value={fmtNull(s.regularMedicationsDetails)} />
          <div className="mt-3 space-y-1 border-t border-gray-100 dark:border-white/5 pt-3">
            <BoolRow icon={Pill} value={s.regularMedications} label="On Regular Medications?" />
            <BoolRow icon={Syringe} value={s.immunisationUpToDate} label="Immunisation Up to Date?" />
          </div>
        </Panel>
      </Grid>

      <Panel title="Medical Consent Signatures" accent="emerald">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <p className="text-xs font-bold uppercase tracking-wider text-gray-500 flex items-center gap-1">
              <FileSignature className="h-3.5 w-3.5" /> Consent 1
            </p>
            <div className="rounded-lg bg-gray-50 dark:bg-white/5 p-3 space-y-1">
              <BoolRow value={s.medicalConsent1Father} label="Father" />
              <BoolRow value={s.medicalConsent1Mother} label="Mother" />
              <BoolRow value={s.medicalConsent1Guardian} label="Guardian" />
            </div>
          </div>
          <div className="space-y-2">
            <p className="text-xs font-bold uppercase tracking-wider text-gray-500 flex items-center gap-1">
              <FileSignature className="h-3.5 w-3.5" /> Consent 2
            </p>
            <div className="rounded-lg bg-gray-50 dark:bg-white/5 p-3 space-y-1">
              <BoolRow value={s.medicalConsent2Father} label="Father" />
              <BoolRow value={s.medicalConsent2Mother} label="Mother" />
              <BoolRow value={s.medicalConsent2Guardian} label="Guardian" />
            </div>
          </div>
        </div>
      </Panel>
    </motion.div>
  );
}

function TabFinancial({ s }: { s: Student }) {
  const allAgreed = s.financialAgreedTerms && s.financialAgreedLiability && s.financialAgreedCancellation;
  
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-5"
    >
      {/* Financial summary banner */}
      <motion.div 
        whileHover={{ scale: 1.01 }}
        className={`relative overflow-hidden rounded-xl border p-5 ${
          allAgreed 
            ? 'border-emerald-200 bg-gradient-to-r from-emerald-50 to-emerald-50/50 dark:from-emerald-950/30 dark:to-emerald-900/20 dark:border-emerald-800/50' 
            : 'border-amber-200 bg-gradient-to-r from-amber-50 to-amber-50/50 dark:from-amber-950/30 dark:to-amber-900/20 dark:border-amber-800/50'
        }`}
      >
        <div className="absolute right-0 top-0 h-32 w-32 translate-x-8 -translate-y-8 opacity-10">
          {allAgreed ? <BadgeCheck className="h-full w-full" /> : <AlertTriangle className="h-full w-full" />}
        </div>
        <div className="relative flex items-start gap-4">
          <div className={`rounded-full p-3 ${
            allAgreed ? 'bg-emerald-100 dark:bg-emerald-900/50' : 'bg-amber-100 dark:bg-amber-900/50'
          }`}>
            {allAgreed 
              ? <BadgeCheck className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
              : <AlertTriangle className="h-6 w-6 text-amber-600 dark:text-amber-400" />}
          </div>
          <div>
            <h3 className={`text-lg font-semibold ${
              allAgreed ? 'text-emerald-800 dark:text-emerald-300' : 'text-amber-800 dark:text-amber-300'
            }`}>
              {allAgreed ? "All financial terms agreed" : "Financial agreement incomplete"}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {allAgreed 
                ? "Parent/guardian has confirmed all three agreement clauses." 
                : "One or more clauses have not been agreed to."}
            </p>
          </div>
        </div>
      </motion.div>

      <Grid>
        <Panel title="Agreement Clauses" accent="amber">
          <BoolRow icon={CheckCircle2} value={s.financialAgreedTerms} label="Terms & Conditions" />
          <BoolRow icon={Shield} value={s.financialAgreedLiability} label="Liability Clause" />
          <BoolRow icon={FileText} value={s.financialAgreedCancellation} label="Cancellation Policy" />
        </Panel>

        <Panel title="Payment Details" accent="amber">
          <DataRow icon={CreditCard} label="Monthly Amount" value={fmtMoney(s.monthlyAmount)} highlight={!!s.monthlyAmount} />
          <DataRow icon={Calendar} label="Payment Date" value={s.paymentDate ? `${s.paymentDate}th of each month` : null} />
        </Panel>
      </Grid>

      <Grid>
        <Panel title="Mother's Declaration" accent="amber">
          <DataRow icon={User} label="Surname" value={fmtNull(s.motherSurname)} />
          <DataRow icon={User} label="First Names" value={fmtNull(s.motherFirstNames)} />
          <DataRow icon={FileSignature} label="Signature" value={fmtNull(s.motherFinancialSignature)} />
          <DataRow icon={Calendar} label="Date Signed" value={fmtDate(s.motherFinancialDate)} />
        </Panel>

        <Panel title="Father's Declaration" accent="amber">
          <DataRow icon={User} label="Surname" value={fmtNull(s.fatherSurname)} />
          <DataRow icon={User} label="First Names" value={fmtNull(s.fatherFirstNames)} />
          <DataRow icon={FileSignature} label="Signature" value={fmtNull(s.fatherFinancialSignature)} />
          <DataRow icon={Calendar} label="Date Signed" value={fmtDate(s.fatherFinancialDate)} />
        </Panel>
      </Grid>
    </motion.div>
  );
}

function TabConsents({ s }: { s: Student }) {
  const signatories = [
    {
      n: 1, name: s.signatory1FullName, id: s.signatory1IdNumber, rel: s.signatory1Relation,
      cell: s.signatory1CellNumber, email: s.signatory1Email, addr: s.signatory1PhysicalAddress,
      sig: s.signatory1Signature, date: s.signatory1DateSigned,
    },
    {
      n: 2, name: s.signatory2FullName, id: s.signatory2IdNumber, rel: s.signatory2Relation,
      cell: s.signatory2CellNumber, email: s.signatory2Email, addr: s.signatory2PhysicalAddress,
      sig: s.signatory2Signature, date: s.signatory2DateSigned,
    },
  ];

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-5"
    >
      <Grid>
        <Panel title="POPI Consent" subtitle="Protection of Personal Information Act" accent="slate">
          <div className="mb-4">
            <BoolRow icon={Shield} value={s.popiConsent} label="POPI Consent Given" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="rounded-lg bg-gray-50 dark:bg-white/5 p-3">
              <p className="mb-2 text-xs font-bold uppercase tracking-wider text-gray-500">Mother</p>
              <DataRow icon={FileSignature} label="Signature" value={fmtNull(s.motherPopiSignature)} />
              <DataRow icon={Calendar} label="Date Signed" value={fmtDate(s.motherPopiDate)} />
            </div>
            <div className="rounded-lg bg-gray-50 dark:bg-white/5 p-3">
              <p className="mb-2 text-xs font-bold uppercase tracking-wider text-gray-500">Father</p>
              <DataRow icon={FileSignature} label="Signature" value={fmtNull(s.fatherPopiSignature)} />
              <DataRow icon={Calendar} label="Date Signed" value={fmtDate(s.fatherPopiDate)} />
            </div>
          </div>
        </Panel>

        <Panel title="Indemnity & Agreement" accent="slate">
          <BoolRow icon={Shield} value={s.indemnityAgreement} label="Indemnity Agreement Signed" />
          <div className="mt-3 space-y-1">
            <DataRow icon={Calendar} label="Agreement Date" value={fmtDate(s.agreementDate)} />
            <DataRow icon={MapPin} label="Signed At" value={fmtNull(s.signedAt)} />
            <DataRow icon={User} label="Witness Name" value={fmtNull(s.witnessName)} />
            <DataRow icon={FileSignature} label="Witness Signature" value={fmtNull(s.witnessSignature)} />
          </div>
        </Panel>
      </Grid>

      <Grid>
        {signatories.map(({ n, name, id, rel, cell, email, addr, sig, date }) => (
          <Panel key={n} title={`Signatory ${n}`} accent="slate">
            {!name && !id ? (
              <div className="flex flex-col items-center justify-center py-6 text-center">
                <div className="mb-2 rounded-full bg-gray-100 dark:bg-white/5 p-2">
                  <UserPlus className="h-5 w-5 text-gray-400" />
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400">No signatory recorded</p>
              </div>
            ) : (
              <div className="space-y-1">
                <DataRow icon={User} label="Full Name" value={fmtNull(name)} />
                <DataRow icon={Hash} label="ID Number" value={fmtNull(id)} mono />
                <DataRow icon={HeartHandshake} label="Relation" value={fmtNull(rel)} />
                <DataRow icon={Smartphone} label="Cell" value={fmtNull(cell)} />
                <DataRow icon={Mail} label="Email" value={fmtNull(email)} />
                <DataRow icon={Home} label="Physical Address" value={fmtNull(addr)} />
                <DataRow icon={FileSignature} label="Signature" value={fmtNull(sig)} />
                <DataRow icon={Calendar} label="Date Signed" value={fmtDate(date)} />
              </div>
            )}
          </Panel>
        ))}
      </Grid>
    </motion.div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function ViewRegisteredStudentForm({ student: s }: ViewRegisteredStudentFormProps) {
  const [activeTab, setActiveTab] = useState("student");
  const pct = useCompletion(s);

  const sid = s.liveStudent?.studentId ?? fmtNull(s.studentId);
  const classLabel = s.liveStudent?.className
    ? `${s.liveStudent.className}${s.liveStudent.classSection ? ` · ${s.liveStudent.classSection}` : ""}`
    : null;
  
  const initials = fmtInitials(s.name, s.surname);

  const TABS = [
    { id: "student",   label: "Student",   icon: User,        p: pct.student,   accent: "blue" },
    { id: "parents",   label: "Parents",   icon: Users,       p: pct.parents,   accent: "violet" },
    { id: "emergency", label: "Emergency", icon: Ambulance,   p: pct.emergency, accent: "red" },
    { id: "medical",   label: "Medical",   icon: Stethoscope, p: pct.medical,   accent: "emerald" },
    { id: "financial", label: "Financial", icon: DollarSign,  p: pct.financial, accent: "amber" },
    { id: "consents",  label: "Consents",  icon: Shield,      p: pct.consents,  accent: "slate" },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Hero header with glass morphism */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl bg-white dark:bg-gray-900/90 backdrop-blur-xl border border-gray-200 dark:border-white/10 shadow-xl"
      >
        {/* Animated gradient background */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-violet-500/5 to-emerald-500/5 dark:from-blue-400/5 dark:via-violet-400/5 dark:to-emerald-400/5 animate-gradient" />
        
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 h-32 w-32 translate-x-16 -translate-y-8 opacity-10">
          <Sparkles className="h-full w-full" />
        </div>
        
        <div className="relative p-6 sm:p-8">
          {/* Top row with actions */}
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-3">
              <Link href="/dashboard/users/students/registered">
                <motion.span 
                  whileHover={{ x: -2 }}
                  className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-gray-200 dark:border-white/10 bg-white/80 dark:bg-white/5 px-3 py-2 text-xs font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/8 transition-all backdrop-blur-sm"
                >
                  <ArrowLeft className="h-3.5 w-3.5" /> Back
                </motion.span>
              </Link>
              <StatusBadge status={s.status} size="sm" />
            </div>
            
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Link href={`/dashboard/users/students/registered/${s.id}/edit`}>
                <span className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-gradient-to-r from-blue-600 to-violet-600 px-4 py-2 text-sm font-semibold text-white hover:from-blue-700 hover:to-violet-700 transition-all shadow-md hover:shadow-lg">
                  <Pencil className="h-4 w-4" /> Edit Record
                </span>
              </Link>
            </motion.div>
          </div>

          {/* Profile section */}
          <div className="flex flex-col sm:flex-row items-start gap-6">
            {/* Avatar with animated ring */}
            <div className="relative group">
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-500 to-violet-600 opacity-75 group-hover:opacity-100 blur-lg transition-opacity" />
              <div className="relative flex h-24 w-24 sm:h-28 sm:w-28 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-violet-600 text-3xl font-bold text-white shadow-2xl">
                {initials}
              </div>
            </div>

            {/* Identity details */}
            <div className="flex-1 space-y-3">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2 flex-wrap">
                  {s.surname}, {s.name}
                  {s.preferredName && (
                    <span className="text-base font-normal text-gray-500 dark:text-gray-400 flex items-center gap-1">
                      <Sparkles className="h-4 w-4" /> “{s.preferredName}”
                    </span>
                  )}
                </h1>
                
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  {sid && (
                    <span className="inline-flex items-center gap-1.5 rounded-lg bg-blue-50 dark:bg-blue-900/20 px-3 py-1.5 font-mono text-xs font-semibold text-blue-700 dark:text-blue-300 ring-1 ring-blue-200 dark:ring-blue-700/40">
                      <Hash className="h-3.5 w-3.5" /> {sid}
                    </span>
                  )}
                  {s.idNumber && (
                    <span className="inline-flex items-center gap-1.5 rounded-lg bg-gray-100 dark:bg-white/10 px-3 py-1.5 font-mono text-xs text-gray-600 dark:text-gray-400">
                      ID: {s.idNumber}
                    </span>
                  )}
                  {classLabel && (
                    <span className="inline-flex items-center gap-1.5 rounded-lg bg-violet-50 dark:bg-violet-900/20 px-3 py-1.5 text-xs font-semibold text-violet-700 dark:text-violet-300 ring-1 ring-violet-200 dark:ring-violet-700/40">
                      <GraduationCap className="h-3.5 w-3.5" /> {classLabel}
                    </span>
                  )}
                </div>
              </div>

              {/* Timeline */}
              <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                <span className="flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5" /> Registered {fmtDate(s.createdAt) ?? "—"}
                </span>
                {s.updatedAt && s.updatedAt !== s.createdAt && (
                  <span className="flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" /> Updated {fmtDate(s.updatedAt)}
                  </span>
                )}
                {s.dateOfEnrolment && (
                  <span className="flex items-center gap-1">
                    <GraduationCap className="h-3.5 w-3.5" /> Enrolled {fmtDate(s.dateOfEnrolment)}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Fixed Tabs - Now properly sized without scrollbar */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="w-full">
          <TabsList className="grid w-full grid-cols-6 h-auto p-1 bg-gray-100/50 dark:bg-gray-900/60 rounded-xl border border-gray-200 dark:border-white/10">
            {TABS.map(({ id, label, icon: Icon, p, accent }) => (
              <TabsTrigger
                key={id}
                value={id}
                className={`
                  flex flex-col items-center justify-center gap-1 px-2 py-3 text-xs font-medium
                  data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800
                  data-[state=active]:shadow-md rounded-lg
                  data-[state=active]:border-t-2 data-[state=active]:border-t-${accent}-500
                `}
              >
                <Icon className="h-4 w-4" />
                <span className="text-[10px] sm:text-xs">{label}</span>
                
                {/* Simple percentage indicator - clean and compact */}
                <div className="flex items-center gap-1 mt-0.5">
                  <div className={`h-1.5 w-12 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden`}>
                    <div 
                      className={`h-full rounded-full ${
                        p >= 80 ? 'bg-emerald-500' : 
                        p >= 40 ? 'bg-amber-500' : 
                        'bg-rose-500'
                      }`}
                      style={{ width: `${p}%` }}
                    />
                  </div>
                  <span className={`text-[8px] font-semibold ${
                    p >= 80 ? 'text-emerald-600 dark:text-emerald-400' : 
                    p >= 40 ? 'text-amber-600 dark:text-amber-400' : 
                    'text-rose-600 dark:text-rose-400'
                  }`}>
                    {p}%
                  </span>
                </div>
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        <div className="mt-6 focus-visible:outline-none">
          <AnimatePresence mode="wait">
            <TabsContent key={activeTab} value={activeTab} className="mt-0 focus-visible:outline-none">
              {activeTab === "student" && <TabStudent s={s} />}
              {activeTab === "parents" && <TabParents s={s} />}
              {activeTab === "emergency" && <TabEmergencyTransport s={s} />}
              {activeTab === "medical" && <TabMedical s={s} />}
              {activeTab === "financial" && <TabFinancial s={s} />}
              {activeTab === "consents" && <TabConsents s={s} />}
            </TabsContent>
          </AnimatePresence>
        </div>
      </Tabs>
    </div>
  );
}