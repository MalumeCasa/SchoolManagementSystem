"use client"
import type React from "react"
import { useState, useEffect, useCallback, useMemo, useRef } from "react"
import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb"
import { ShowcaseSection } from "@/components/Layouts/showcase-section"
import ClassSidebar from "@components/Classes/ClassSidebar"
import ClassContent from "@components/Classes/ClassContent"
import { ClassSection, ActiveView, EditingClass, Student, Teacher, Subject, ClassData } from "@api/types"
import { fallbackStudentsData } from "@components/Classes/studentUtils"
import { getStudents, getAllClasses, getAllTeachers, getAllSubjects } from "@api/actions"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import {
  FiPlus, FiRefreshCw, FiSearch, FiDownload, FiFilter, FiCalendar,
  FiPieChart, FiUsers, FiBookOpen, FiUser, FiTrendingUp,
  FiAlertCircle, FiInfo, FiX, FiCheck, FiClock, FiStar, FiAward,
  FiBarChart2, FiGrid, FiList, FiChevronRight, FiChevronDown
} from "react-icons/fi"

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────
interface StatCardProps {
  label: string
  value: number
  loading: boolean
  gradient: string
  icon: React.ReactNode
  trend?: number
}

interface QuickAction {
  label: string
  icon: React.ReactNode
  href: string
  color: string
  description: string
}

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Normalise a string the same way every DB join in this schema does:
 *   LOWER(TRIM(value))
 * Used for ALL cross-table name comparisons so whitespace and capitalisation
 * can never cause a mismatch.
 */
const normalise = (s?: string | null): string => (s ?? "").trim().toLowerCase()

const removeDuplicatesById = <T extends { id: string | number }>(arr: T[]): T[] => {
  const seen = new Set<string | number>()
  return arr.filter(item => {
    if (seen.has(item.id)) return false
    seen.add(item.id)
    return true
  })
}

/**
 * Remove duplicate strings from an array with case-insensitive comparison.
 */
const removeDuplicateStrings = (arr: string[]): string[] => {
  const seen = new Set<string>()
  const result: string[] = []
  
  for (const item of arr) {
    const normalized = normalise(item)
    if (!seen.has(normalized)) {
      seen.add(normalized)
      result.push(item)
    }
  }
  
  return result
}

/**
 * Deduplicate class objects by class name (case-insensitive).
 */
const deduplicateClasses = (classes: any[]): any[] => {
  const seen = new Set<string>()
  const unique: any[] = []
  
  for (const cls of classes) {
    const className = (cls.className || "").trim()
    const normalized = normalise(className)
    
    if (!className) continue
    
    if (!seen.has(normalized)) {
      seen.add(normalized)
      unique.push(cls)
    } else {
      console.warn(`Duplicate class found and removed: "${className}"`)
    }
  }
  
  return unique
}

const generateUniqueId = () => Math.floor(Math.random() * 1_000_000) + Date.now()

const formatNumber = (num: number): string => {
  if (num >= 1_000_000) return (num / 1_000_000).toFixed(1) + "M"
  if (num >= 1_000)     return (num / 1_000).toFixed(1) + "K"
  return num.toString()
}

// ─────────────────────────────────────────────────────────────────────────────
// Defaults
// ─────────────────────────────────────────────────────────────────────────────
const DEFAULT_CLASS_SECTIONS: ClassSection[] = [
  { name: "Nursery",         classes: [] },
  { name: "Primary",         classes: [] },
  { name: "Secondary",       classes: [] },
  { name: "Unassigned Data", classes: ["Unassigned Students", "Unassigned Teachers", "Unassigned Subjects"] },
]

const BLANK_CLASS_DATA: ClassData = { students: 0, subjects: 0, teacher: "N/A", activities: [] }

// ─────────────────────────────────────────────────────────────────────────────
// UI Components
// ─────────────────────────────────────────────────────────────────────────────

const StatCard: React.FC<StatCardProps> = ({ label, value, loading, gradient, icon, trend }) => (
  <motion.div
    whileHover={{ y: -4 }}
    className={`relative overflow-hidden rounded-xl bg-gradient-to-br ${gradient} p-6 text-white shadow-lg`}
  >
    <div className="absolute right-0 top-0 h-20 w-20 translate-x-6 -translate-y-6 rounded-full bg-white/10" />
    <div className="relative">
      <div className="flex items-center justify-between">
        <div className="rounded-lg bg-white/20 p-3 backdrop-blur-sm">{icon}</div>
        {trend !== undefined && (
          <span className={`text-sm font-medium ${trend >= 0 ? "text-green-300" : "text-red-300"}`}>
            {trend >= 0 ? "↑" : "↓"} {Math.abs(trend)}%
          </span>
        )}
      </div>
      <div className="mt-4">
        <p className="text-sm font-medium text-white/80">{label}</p>
        {loading ? (
          <div className="mt-1 h-8 w-16 animate-pulse rounded bg-white/20" />
        ) : (
          <p className="text-2xl font-bold">{formatNumber(value)}</p>
        )}
      </div>
    </div>
  </motion.div>
)

const QuickActionCard: React.FC<QuickAction> = ({ label, icon, href, color, description }) => (
  <Link href={href}>
    <motion.div
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.98 }}
      className="group relative overflow-hidden rounded-xl border border-border bg-card p-4 shadow-sm transition-all hover:shadow-md"
    >
      <div className={`absolute inset-0 opacity-0 transition-opacity group-hover:opacity-10 bg-gradient-to-r ${color}`} />
      <div className="relative flex items-start gap-3">
        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br ${color} text-white`}>
          {icon}
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="font-semibold text-foreground">{label}</h3>
          <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{description}</p>
        </div>
      </div>
    </motion.div>
  </Link>
)

// ─────────────────────────────────────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────────────────────────────────────
const ClassesPage: React.FC = () => {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState("")

  // ── State ────────────────────────────────────────────────────────────────
  const [expandedSections,  setExpandedSections]  = useState<string[]>(["Nursery", "Primary", "Secondary"])
  const [selectedClass,     setSelectedClass]     = useState<string | null>(null)
  const [activeView,        setActiveView]        = useState<ActiveView>("overview")
  const [classSections,     setClassSections]     = useState<ClassSection[]>(DEFAULT_CLASS_SECTIONS)
  const [editingClass,      setEditingClass]      = useState<EditingClass | null>(null)
  const [editValue,         setEditValue]         = useState("")
  const [editingSection,    setEditingSection]    = useState<string | null>(null)
  const [sectionEditValue,  setSectionEditValue]  = useState("")

  const [classDataState,    setClassDataState]    = useState<Record<string, ClassData>>({})
  const [studentsDataState, setStudentsDataState] = useState<Record<string, Student[]>>({})
  const [teachersDataState, setTeachersDataState] = useState<Record<string, Teacher[]>>({})
  const [subjectsDataState, setSubjectsDataState] = useState<Record<string, Subject[]>>({})

  const [loading,         setLoading]         = useState(true)
  const [error,           setError]           = useState<string | null>(null)
  const [unmappedWarning, setUnmappedWarning] = useState<string[]>([])
  const [lastUpdated,     setLastUpdated]     = useState<Date | null>(null)
  const [showUnassigned,  setShowUnassigned]  = useState(false)
  const [duplicateWarning, setDuplicateWarning] = useState<string | null>(null)

  const searchInputRef = useRef<HTMLInputElement>(null)

  // ── organizeClassesBySection ─────────────────────────────────────────────
  const organizeClassesBySection = useCallback((classesFromDB: any[]): ClassSection[] => {
    const sections: ClassSection[] = [
      { name: "Nursery",         classes: [] },
      { name: "Primary",         classes: [] },
      { name: "Secondary",       classes: [] },
      { name: "Unassigned Data", classes: ["Unassigned Students", "Unassigned Teachers", "Unassigned Subjects"] },
    ]

    // Track assigned classes to prevent duplicates across sections
    const assignedClasses = new Set<string>()
    
    classesFromDB.forEach(ci => {
      const name    = (ci.className || "").trim()
      const section = (ci.classSection || "").toLowerCase()
      if (!name) return
      
      // Skip if this class has already been assigned
      const normalizedName = normalise(name)
      if (assignedClasses.has(normalizedName)) {
        console.warn(`Skipping duplicate class: "${name}"`)
        return
      }
      
      assignedClasses.add(normalizedName)
      const lower = name.toLowerCase()

      if      (section.includes("nursery")   || lower.includes("nursery")   || lower.includes("kg"))                                sections[0].classes.push(name)
      else if (section.includes("secondary") || lower.includes("secondary") || lower.includes("jss") || /ss\s*\d+/.test(lower))    sections[2].classes.push(name)
      else                                                                                                                           sections[1].classes.push(name)
    })

    // Remove duplicates within each section and sort
    sections.forEach(s => {
      s.classes = removeDuplicateStrings(s.classes)
      s.classes.sort((a, b) => a.localeCompare(b, undefined, { numeric: true }))
    })
    
    return sections
  }, [])

  // ── organizeTeachersByClass ──────────────────────────────────────────────
  const organizeTeachersByClass = useCallback((teachersFromDB: any[], classesFromDB: any[]) => {
    const byClass:    Record<string, Teacher[]> = {}
    const unassigned: Teacher[]                 = []
    const unique = removeDuplicatesById(teachersFromDB ?? [])

    classesFromDB.forEach(ci => {
      const cn = (ci.className || "").trim()
      if (!cn) return
      byClass[cn] = []

      const teacherNames: string[] = ci.teachers ?? []
      const assignedTeacherIds = new Set<string | number>()
      
      teacherNames.forEach((tName: string) => {
        const normSearch = normalise(tName)
        const found = unique.find((t: Teacher) => {
          const full = normalise(`${t.name ?? ""} ${t.surname ?? ""}`.trim())
          return full.includes(normSearch) || normSearch.includes(normalise(t.name))
        })
        if (found && !assignedTeacherIds.has(found.id)) {
          assignedTeacherIds.add(found.id)
          byClass[cn].push(found)
        }
      })
      byClass[cn] = removeDuplicatesById(byClass[cn])
    })

    unique.forEach((t: Teacher) => {
      const assigned = Object.values(byClass).some(arr => arr.some(x => x.id === t.id))
      if (!assigned) unassigned.push(t)
    })
    if (unassigned.length) byClass["Unassigned Teachers"] = removeDuplicatesById(unassigned)
    return byClass
  }, [])

  // ── organizeSubjectsByClass ──────────────────────────────────────────────
  const organizeSubjectsByClass = useCallback((subjectsFromDB: any[], classesFromDB: any[]) => {
    const canonicalMap = new Map<string, string>()
    classesFromDB.forEach(ci => {
      const canonical = (ci.className || "").trim()
      if (canonical) canonicalMap.set(normalise(canonical), canonical)
    })

    const byClass:    Record<string, Subject[]> = {}
    const unassigned: Subject[]                 = []

    canonicalMap.forEach(canonical => { byClass[canonical] = [] })
    byClass["Unassigned Subjects"] = []

    const unique = removeDuplicatesById(subjectsFromDB ?? [])
    const assignedSubjectIds = new Set<string | number>()

    unique.forEach((s: any) => {
      if (assignedSubjectIds.has(s.id)) return
      
      const rawClassName = (s.className ?? s.class_name ?? "").trim()
      const canonical    = canonicalMap.get(normalise(rawClassName))

      if (canonical) {
        assignedSubjectIds.add(s.id)
        byClass[canonical].push(s as Subject)
      } else {
        const sName = normalise(s.name ?? "")
        let fallbackMatch: string | undefined

        if (sName) {
          for (const ci of classesFromDB) {
            const cn        = (ci.className || "").trim()
            const normCn    = normalise(cn)
            const inArray   = (ci.subjects ?? []).some((n: string) =>
              normalise(n) === sName || sName.includes(normalise(n)) || normalise(n).includes(sName)
            )
            if (inArray && canonicalMap.has(normCn)) {
              fallbackMatch = canonicalMap.get(normCn)
              break
            }
          }
        }

        if (fallbackMatch) {
          assignedSubjectIds.add(s.id)
          byClass[fallbackMatch].push(s as Subject)
        } else {
          unassigned.push(s as Subject)
        }
      }
    })

    Object.keys(byClass).forEach(cn => { byClass[cn] = removeDuplicatesById(byClass[cn]) })

    Object.keys(byClass).forEach(cn => {
      if (!byClass[cn].length && !cn.includes("Unassigned")) delete byClass[cn]
    })

    return byClass
  }, [])

  // ── mapStudentsToClasses ─────────────────────────────────────────────────
  const mapStudentsToClasses = useCallback((studentsFromDB: any[], classesFromDB: any[]) => {
    const canonicalMap = new Map<string, string>()
    classesFromDB.forEach(ci => {
      const canonical = (ci.className || "").trim()
      if (canonical) canonicalMap.set(normalise(canonical), canonical)
    })

    const byClass:    Record<string, Student[]> = {}
    const unassigned: Student[]                 = []

    canonicalMap.forEach(canonical => { byClass[canonical] = [] })
    byClass["Unassigned Students"] = []

    const uniqueStudents = removeDuplicatesById(studentsFromDB)
    const assignedStudentIds = new Set<string | number>()

    uniqueStudents.forEach(raw => {
      if (assignedStudentIds.has(raw.id)) return
      
      const rawClassName = raw.className ?? raw.class_name ?? raw.class ?? ""
      const canonical    = canonicalMap.get(normalise(rawClassName))
      if (canonical) {
        assignedStudentIds.add(raw.id)
        byClass[canonical].push(raw as Student)
      } else {
        unassigned.push(raw as Student)
      }
    })

    Object.keys(byClass).forEach(cn => { byClass[cn] = removeDuplicatesById(byClass[cn]) })

    const unmatchedClassNames = Array.from(
      new Set(
        uniqueStudents
          .map(r => (r.className ?? r.class_name ?? r.class ?? "").trim())
          .filter(cn => cn && !canonicalMap.has(normalise(cn)))
      )
    )

    Object.keys(byClass).forEach(cn => {
      if (!byClass[cn].length && !cn.includes("Unassigned")) delete byClass[cn]
    })

    return { mappedData: byClass, unmatchedClassNames }
  }, [])

  // ── applyFallback ────────────────────────────────────────────────────────
  const applyFallback = useCallback(() => {
    setStudentsDataState(
      Object.fromEntries(
        Object.entries(fallbackStudentsData).map(([cn, ss]) => [
          cn, ss.map(s => ({ ...s, id: generateUniqueId() }))
        ])
      )
    )
  }, [])

  // ── loadData ─────────────────────────────────────────────────────────────
  const loadData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      setUnmappedWarning([])
      setDuplicateWarning(null)

      setClassDataState(prev => ({
        ...prev,
        "Unassigned Students": BLANK_CLASS_DATA,
        "Unassigned Teachers": BLANK_CLASS_DATA,
        "Unassigned Subjects": BLANK_CLASS_DATA,
      }))

      // Fetch everything in parallel
      const [classesResult, teachersResult, subjectsResult, studentsList] = await Promise.all([
        getAllClasses(),
        getAllTeachers(),
        getAllSubjects(),
        getStudents(),
      ])

      if (!classesResult?.success || !Array.isArray(classesResult.data)) {
        throw new Error("Failed to load classes")
      }

      // Deduplicate classes before processing
      const originalCount = classesResult.data.length
      const classesDB = deduplicateClasses(classesResult.data)
      
      if (classesDB.length < originalCount) {
        setDuplicateWarning(`Found and removed ${originalCount - classesDB.length} duplicate class(es)`)
      }

      // Organise sidebar sections
      const organizedSections = organizeClassesBySection(classesDB)
      setClassSections(organizedSections)

      // Seed classDataState with deduplicated classes
      const seedClassData: Record<string, ClassData> = {}
      const seenClassNames = new Set<string>()
      
      classesDB.forEach(ci => {
        const cn = (ci.className || "").trim()
        if (!cn) return
        
        const normalizedName = normalise(cn)
        if (seenClassNames.has(normalizedName)) return
        seenClassNames.add(normalizedName)
        
        seedClassData[cn] = {
          students:   0,
          subjects:   ci.subjects?.length ?? 0,
          teacher:    ci.teachers?.[0]    ?? "Not assigned",
          activities: [],
        }
      })
      setClassDataState(prev => ({ ...prev, ...seedClassData }))

      // Teachers
      if (teachersResult?.success && Array.isArray(teachersResult.data)) {
        setTeachersDataState(organizeTeachersByClass(teachersResult.data, classesDB))
      }

      // Subjects
      if (subjectsResult?.success && Array.isArray(subjectsResult.data)) {
        const subjectsByClass = organizeSubjectsByClass(subjectsResult.data, classesDB)
        setSubjectsDataState(subjectsByClass)

        setClassDataState(prev => {
          const updated = { ...prev }
          Object.keys(subjectsByClass).forEach(cn => {
            if (updated[cn]) {
              updated[cn] = { ...updated[cn], subjects: subjectsByClass[cn].length }
            }
          })
          return updated
        })
      }

      // Students
      if (studentsList && Array.isArray(studentsList)) {
        const { mappedData, unmatchedClassNames } = mapStudentsToClasses(studentsList, classesDB)
        if (unmatchedClassNames.length) setUnmappedWarning(unmatchedClassNames)
        setStudentsDataState(mappedData)

        setClassDataState(prev => {
          const updated = { ...prev }
          Object.keys(mappedData).forEach(cn => {
            if (updated[cn]) {
              updated[cn] = { ...updated[cn], students: mappedData[cn].length }
            }
          })
          return updated
        })
      } else {
        applyFallback()
      }

      setLastUpdated(new Date())

    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load data")
      applyFallback()
    } finally {
      setLoading(false)
    }
  }, [organizeClassesBySection, organizeTeachersByClass, organizeSubjectsByClass, mapStudentsToClasses, applyFallback])

  useEffect(() => { loadData() }, [loadData])

  // ── Quick actions ────────────────────────────────────────────────────────
  const quickActions: QuickAction[] = useMemo(() => [
    { label: "New Class",    icon: <FiPlus className="h-4 w-4" />,      href: "/academics/classes/new",      color: "from-emerald-500 to-teal-500",   description: "Create a new class" },
    { label: "Bulk Import",  icon: <FiDownload className="h-4 w-4" />,  href: "/academics/classes/import",   color: "from-blue-500 to-indigo-500",    description: "Import from CSV" },
    { label: "Reports",      icon: <FiBarChart2 className="h-4 w-4" />, href: "/academics/classes/reports",  color: "from-violet-500 to-purple-500",  description: "View analytics" },
    { label: "Schedule",     icon: <FiCalendar className="h-4 w-4" />,  href: "/academics/classes/schedule", color: "from-amber-500 to-orange-500",   description: "Manage timetable" },
  ], [])

  // ── CRUD ─────────────────────────────────────────────────────────────────
  const guardUnassigned = (sn: string, what: string): boolean => {
    if (sn === "Unassigned Data") { alert(`${what} cannot be modified.`); return true }
    return false
  }

  const handleDeleteSection = (sectionName: string) => {
    if (guardUnassigned(sectionName, "The Unassigned Data section")) return
    const section = classSections.find(s => s.name === sectionName)
    if (!section) return
    if (window.confirm(`Delete "${sectionName}" and all its classes?`)) {
      section.classes.forEach(cn => { if (selectedClass === cn) setSelectedClass(null) })
      setClassSections(prev => prev.filter(s => s.name !== sectionName))
      setExpandedSections(prev => prev.filter(s => s !== sectionName))
    }
  }

  const handleDeleteClass = (sectionName: string, classIndex: number, className: string) => {
    if (guardUnassigned(sectionName, "Classes in the Unassigned Data section")) return
    if (!window.confirm(`Delete "${className}"?`)) return
    setClassSections(prev =>
      prev.map(s => s.name === sectionName ? { ...s, classes: s.classes.filter((_, i) => i !== classIndex) } : s)
    )
    if (selectedClass === className) setSelectedClass(null)
  }

  const handleStartEditingSection = (sectionName: string) => {
    if (guardUnassigned(sectionName, "The Unassigned Data section")) return
    setEditingSection(sectionName)
    setSectionEditValue(sectionName)
  }

  const toggleSection = (section: string) =>
    setExpandedSections(prev =>
      prev.includes(section) ? prev.filter(s => s !== section) : [...prev, section]
    )

  const startEditing = (sectionName: string, classIndex: number, currentName: string) => {
    if (guardUnassigned(sectionName, "Classes in the Unassigned Data section")) return
    setEditingClass({ section: sectionName, index: classIndex })
    setEditValue(currentName)
  }

  const renameKey = <T,>(
    setter: React.Dispatch<React.SetStateAction<Record<string, T>>>,
    oldName: string,
    newName: string
  ) => setter(prev => {
    if (!prev[oldName]) return prev
    const next = { ...prev, [newName]: prev[oldName] }
    delete next[oldName]
    return next
  })

  const saveEdit = () => {
    if (!editingClass || !editValue.trim()) return
    const oldName = classSections.find(s => s.name === editingClass.section)?.classes[editingClass.index]
    const newName = editValue.trim()
    if (!oldName || oldName === newName) { setEditingClass(null); setEditValue(""); return }
    
    // Check for duplicate class name
    const allClasses = classSections.flatMap(s => s.classes)
    if (allClasses.some(c => normalise(c) === normalise(newName) && c !== oldName)) {
      alert("A class with this name already exists!")
      return
    }
    
    setClassSections(prev =>
      prev.map(s => {
        if (s.name !== editingClass.section) return s
        const nc = [...s.classes]; nc[editingClass.index] = newName; return { ...s, classes: nc }
      })
    )
    if (selectedClass === oldName) setSelectedClass(newName)
    renameKey(setClassDataState,    oldName, newName)
    renameKey(setStudentsDataState, oldName, newName)
    renameKey(setTeachersDataState, oldName, newName)
    renameKey(setSubjectsDataState, oldName, newName)
    setEditingClass(null); setEditValue("")
  }

  const cancelEdit = () => { setEditingClass(null); setEditValue("") }

  const saveSectionEdit = () => {
    if (!editingSection || !sectionEditValue.trim()) return
    const newName = sectionEditValue.trim()
    if (editingSection === newName) { setEditingSection(null); setSectionEditValue(""); return }
    
    // Check for duplicate section name
    if (classSections.some(s => s.name === newName)) {
      alert("A section with this name already exists!")
      return
    }
    
    setClassSections(prev => prev.map(s => s.name === editingSection ? { ...s, name: newName } : s))
    setExpandedSections(prev => prev.map(s => s === editingSection ? newName : s))
    setEditingSection(null); setSectionEditValue("")
  }

  const cancelSectionEdit = () => { setEditingSection(null); setSectionEditValue("") }

  const addClassToSection = (sectionName: string) => {
    if (guardUnassigned(sectionName, "The Unassigned Data section")) return
    const section = classSections.find(s => s.name === sectionName)
    if (!section) return
    const raw = window.prompt(`Enter name for new class in ${sectionName}:`)
    if (!raw?.trim()) return
    const trimmed = raw.trim()
    
    // Check for duplicate class name across all sections
    const allClasses = classSections.flatMap(s => s.classes)
    if (allClasses.some(c => normalise(c) === normalise(trimmed))) {
      alert("A class with this name already exists!")
      return
    }
    
    setClassSections(prev => prev.map(s => s.name === sectionName ? { ...s, classes: [...s.classes, trimmed] } : s))
    setClassDataState(prev => ({ ...prev, [trimmed]: { students: 0, subjects: 0, teacher: "Not assigned", activities: [] } }))
  }

  const addNewSection = () => {
    const name = window.prompt("Enter name for new section:")
    if (!name?.trim()) return
    const trimmed = name.trim()
    if (classSections.some(s => s.name === trimmed)) { alert("A section with this name already exists!"); return }
    setClassSections(prev => [...prev, { name: trimmed, classes: [] }])
    setExpandedSections(prev => [...prev, trimmed])
  }

  // Keyboard shortcut: ⌘F / Ctrl+F → focus search
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "f") {
        e.preventDefault()
        searchInputRef.current?.focus()
      }
      // ESC to cancel editing
      if (e.key === "Escape") {
        if (editingClass) cancelEdit()
        if (editingSection) cancelSectionEdit()
      }
    }
    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [editingClass, editingSection])

  // ── Derived stats ─────────────────────────────────────────────────────────
  const stats = useMemo(() => {
    const allStudents = Object.values(studentsDataState).flat()
    const allTeachers = Object.values(teachersDataState).flat()
    const allSubjects = Object.values(subjectsDataState).flat()
    
    // Count unique classes across all sections
    const uniqueClasses = new Set(
      classSections.flatMap(s => s.classes.map(c => normalise(c)))
    )
    
    return {
      classes:            uniqueClasses.size,
      students:           new Set(allStudents.map(s => s.id)).size,
      teachers:           new Set(allTeachers.map(t => t.id)).size,
      subjects:           new Set(allSubjects.map(s => s.id)).size,
      unassignedStudents: studentsDataState["Unassigned Students"]?.length || 0,
      unassignedTeachers: teachersDataState["Unassigned Teachers"]?.length || 0,
      unassignedSubjects: subjectsDataState["Unassigned Subjects"]?.length || 0,
    }
  }, [classSections, studentsDataState, teachersDataState, subjectsDataState])

  // ── Search filter ────────────────────────────────────────────────────────
  const filteredClassSections = useMemo(() => {
    if (!searchTerm) return classSections
    return classSections.map(section => ({
      ...section,
      classes: section.classes.filter(c => c.toLowerCase().includes(searchTerm.toLowerCase())),
    }))
  }, [classSections, searchTerm])

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <>
      <Breadcrumb pageName="Classes Management" />

      <div className="mx-auto max-w-7xl space-y-6 px-4 sm:px-6 lg:px-8">

        {/* ── Header ── */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground sm:text-3xl">Classes</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Manage classes, sections, teachers, and students
            </p>
            {lastUpdated && (
              <p className="mt-1 text-xs text-muted-foreground">
                Last updated: {lastUpdated.toLocaleTimeString()}
              </p>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Search */}
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search classes… (⌘F)"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="h-10 w-64 rounded-lg border border-border bg-background pl-10 pr-4 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            {/* Refresh */}
            <button
              onClick={loadData}
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-lg border border-border bg-background px-4 py-2 text-sm font-medium hover:bg-muted disabled:opacity-50"
            >
              <FiRefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
              {loading ? "Loading…" : "Refresh"}
            </button>

            {/* New Class */}
            <Link
              href="/academics/classes/new"
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              <FiPlus className="h-4 w-4" />
              New Class
            </Link>
          </div>
        </div>

        {/* ── Stats ── */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <StatCard label="Total Classes"   value={stats.classes}   loading={loading} gradient="from-blue-500 to-indigo-600"  icon={<FiBookOpen className="h-5 w-5" />} trend={12} />
          <StatCard label="Total Students"  value={stats.students}  loading={loading} gradient="from-emerald-500 to-teal-600" icon={<FiUsers className="h-5 w-5" />}    trend={8}  />
          <StatCard label="Total Teachers"  value={stats.teachers}  loading={loading} gradient="from-violet-500 to-purple-700"icon={<FiUser className="h-5 w-5" />}     trend={5}  />
          <StatCard label="Total Subjects"  value={stats.subjects}  loading={loading} gradient="from-amber-500 to-orange-600" icon={<FiStar className="h-5 w-5" />}     trend={3}  />
        </div>

        {/* ── Quick Actions ── */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {quickActions.map((action, idx) => <QuickActionCard key={idx} {...action} />)}
        </div>

        {/* ── Duplicate Warning Banner ── */}
        <AnimatePresence>
          {duplicateWarning && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex items-start gap-3 rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-950/50"
            >
              <FiInfo className="mt-0.5 h-5 w-5 text-blue-600 dark:text-blue-400" />
              <div className="flex-1">
                <p className="font-semibold text-blue-800 dark:text-blue-300">Duplicate Classes Detected</p>
                <p className="text-sm text-blue-700 dark:text-blue-400">{duplicateWarning}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Error Banner ── */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-950/50"
            >
              <FiAlertCircle className="mt-0.5 h-5 w-5 text-red-600 dark:text-red-400" />
              <div className="flex-1">
                <p className="font-semibold text-red-800 dark:text-red-300">Error</p>
                <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
              </div>
              <button onClick={loadData} className="rounded-lg bg-red-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-red-700">
                Retry
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Unassigned Items Warning ── */}
        {(stats.unassignedStudents > 0 || stats.unassignedTeachers > 0 || stats.unassignedSubjects > 0) && (
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-800 dark:bg-amber-950/50">
            <button
              onClick={() => setShowUnassigned(!showUnassigned)}
              className="flex w-full items-center justify-between"
            >
              <div className="flex items-center gap-2">
                <FiAlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                <span className="font-medium text-amber-800 dark:text-amber-300">
                  Unassigned Items ({stats.unassignedStudents + stats.unassignedTeachers + stats.unassignedSubjects})
                </span>
              </div>
              {showUnassigned ? <FiChevronDown /> : <FiChevronRight />}
            </button>

            <AnimatePresence>
              {showUnassigned && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="mt-3 space-y-2 overflow-hidden"
                >
                  {stats.unassignedStudents > 0 && (
                    <div className="flex items-center gap-2 text-sm">
                      <span className="h-2 w-2 rounded-full bg-amber-500" />
                      <span>{stats.unassignedStudents} students need class assignment</span>
                    </div>
                  )}
                  {stats.unassignedTeachers > 0 && (
                    <div className="flex items-center gap-2 text-sm">
                      <span className="h-2 w-2 rounded-full bg-amber-500" />
                      <span>{stats.unassignedTeachers} teachers not assigned to any class</span>
                    </div>
                  )}
                  {stats.unassignedSubjects > 0 && (
                    <div className="flex items-center gap-2 text-sm">
                      <span className="h-2 w-2 rounded-full bg-amber-500" />
                      <span>
                        {stats.unassignedSubjects} subjects have no matching{" "}
                        <code className="rounded bg-amber-100 px-1 font-mono text-xs dark:bg-amber-900">class_name</code>{" "}
                        — check the subjects table
                      </span>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* ── Student Class Mapping Warning ── */}
        {unmappedWarning.length > 0 && (
          <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4 dark:border-yellow-800 dark:bg-yellow-950/50">
            <div className="flex items-start gap-2">
              <FiInfo className="mt-0.5 h-5 w-5 text-yellow-600 dark:text-yellow-400" />
              <div>
                <p className="font-medium text-yellow-800 dark:text-yellow-300">Student Class Mapping Issues</p>
                <p className="mt-1 text-sm text-yellow-700 dark:text-yellow-400">
                  These values in{" "}
                  <code className="rounded bg-yellow-100 px-1 font-mono text-xs dark:bg-yellow-900">students.class_name</code>{" "}
                  don't match any{" "}
                  <code className="rounded bg-yellow-100 px-1 font-mono text-xs dark:bg-yellow-900">classes.class_name</code>:
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {unmappedWarning.map(cn => (
                    <span key={cn} className="rounded-full border border-yellow-300 bg-yellow-100 px-2 py-0.5 font-mono text-xs font-medium text-yellow-800 dark:border-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300">
                      {cn}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── Main Two-Column Layout ── */}
        <div className="flex flex-col gap-6 lg:flex-row">
          {/* Sidebar */}
          <div className="lg:w-80">
            <ClassSidebar
              classSections={filteredClassSections}
              expandedSections={expandedSections}
              selectedClass={selectedClass}
              editingClass={editingClass}
              editValue={editValue}
              editingSection={editingSection}
              sectionEditValue={sectionEditValue}
              studentsDataState={studentsDataState}
              onToggleSection={toggleSection}
              onSelectClass={setSelectedClass}
              onStartEditing={startEditing}
              onSaveEdit={saveEdit}
              onCancelEdit={cancelEdit}
              onDeleteClass={handleDeleteClass}
              onStartEditingSection={handleStartEditingSection}
              onSaveSectionEdit={saveSectionEdit}
              onCancelSectionEdit={cancelSectionEdit}
              onDeleteSection={handleDeleteSection}
              onAddClassToSection={addClassToSection}
              onAddNewSection={addNewSection}
              onSetEditValue={setEditValue}
              onSetSectionEditValue={setSectionEditValue}
            />
          </div>

          {/* Content */}
          <main className="flex-1">
            {loading && !selectedClass ? (
              <div className="flex h-96 items-center justify-center rounded-lg border border-border bg-card">
                <div className="text-center">
                  <FiRefreshCw className="mx-auto h-8 w-8 animate-spin text-primary" />
                  <p className="mt-4 text-muted-foreground">Loading class data…</p>
                </div>
              </div>
            ) : (
              <ClassContent
                selectedClass={selectedClass}
                activeView={activeView}
                classDataState={classDataState}
                studentsDataState={studentsDataState}
                teachersDataState={teachersDataState}
                subjectsDataState={subjectsDataState}
                loading={loading}
                onSetActiveView={setActiveView}
                onRefreshStudentsData={loadData}
              />
            )}
          </main>
        </div>

      </div>
    </>
  )
}

export default ClassesPage