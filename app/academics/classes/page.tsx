"use client"
import type React from "react"
import { useState, useEffect } from "react"
import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import { ShowcaseSection } from "@/components/Layouts/showcase-section";
import ClassSidebar from "@components/Classes/ClassSidebar";
import ClassContent from "@components/Classes/ClassContent";
import { ClassSection, ActiveView, EditingClass, Student, Teacher, Subject, ClassData } from "@/app/api/types";
import { transformStudentData, findMatchingClass, fallbackStudentsData } from '@components/Classes/studentUtils';

import { 
  getStudents, 
  getAllClasses, 
  getAllTeachers, 
  getAllSubjects 
} from '@/app/api/actions';

// Add useRouter import
import { useRouter } from 'next/navigation';
import Link from 'next/link';

// Update the removeDuplicatesById function to handle both string and number IDs
const removeDuplicatesById = <T extends { id: string | number }>(array: T[]): T[] => {
  const seen = new Set<string | number>();
  return array.filter(item => {
    if (seen.has(item.id)) {
      return false;
    }
    seen.add(item.id);
    return true;
  });
};

// Helper function to generate unique IDs for fallback data
const generateUniqueId = () => Math.floor(Math.random() * 1000000) + Date.now();

// Default class sections
const DEFAULT_CLASS_SECTIONS: ClassSection[] = [
  {
    name: "Nursery",
    classes: [],
  },
  {
    name: "Primary",
    classes: [],
  },
  {
    name: "Secondary",
    classes: [],
  },
  {
    name: "Unassigned Data",
    classes: ["Unassigned Students", "Unassigned Teachers", "Unassigned Subjects"],
  },
];

const ClassesPage: React.FC = () => {
  const router = useRouter();
  const [expandedSections, setExpandedSections] = useState<string[]>(["Nursery", "Primary", "Secondary", "Unassigned Data"])
  const [selectedClass, setSelectedClass] = useState<string | null>(null)
  const [activeView, setActiveView] = useState<ActiveView>("overview")
  const [classSections, setClassSections] = useState<ClassSection[]>(DEFAULT_CLASS_SECTIONS)
  const [editingClass, setEditingClass] = useState<EditingClass | null>(null)
  const [editValue, setEditValue] = useState("")
  const [editingSection, setEditingSection] = useState<string | null>(null)
  const [sectionEditValue, setSectionEditValue] = useState("")

  const [classDataState, setClassDataState] = useState<Record<string, ClassData>>({})
  const [studentsDataState, setStudentsDataState] = useState<Record<string, Student[]>>({})
  const [teachersDataState, setTeachersDataState] = useState<Record<string, Teacher[]>>({})
  const [subjectsDataState, setSubjectsDataState] = useState<Record<string, Subject[]>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [debugInfo, setDebugInfo] = useState<string>('')

  // Function to organize classes by section from database
  const organizeClassesBySection = (classesFromDB: any[]): ClassSection[] => {
    const sections: ClassSection[] = [
      { name: "Nursery", classes: [] },
      { name: "Primary", classes: [] },
      { name: "Secondary", classes: [] },
      { name: "Unassigned Data", classes: ["Unassigned Students", "Unassigned Teachers", "Unassigned Subjects"] }
    ];

    classesFromDB.forEach(classItem => {
      const className = classItem.className || classItem.name || '';
      const classSection = classItem.classSection?.toLowerCase() || '';

      if (!className) return; // Skip if no class name

      // Case-insensitive matching for sections
      if (classSection.includes('nursery')) {
        sections[0].classes.push(className);
      } else if (classSection.includes('primary')) {
        sections[1].classes.push(className);
      } else if (classSection.includes('secondary')) {
        sections[2].classes.push(className);
      } else {
        // If no section specified, try to determine from class name
        const lowerClassName = className.toLowerCase();
        if (lowerClassName.includes('nursery')) {
          sections[0].classes.push(className);
        } else if (lowerClassName.includes('primary') || lowerClassName.match(/p\s*\d+/)) {
          sections[1].classes.push(className);
        } else if (lowerClassName.includes('secondary') || lowerClassName.includes('jss') || lowerClassName.includes('ss')) {
          sections[2].classes.push(className);
        } else {
          // Default to Primary if cannot determine
          sections[1].classes.push(className);
        }
      }
    });

    // Remove empty sections (except Unassigned Data which should always be there)
    return sections.filter(section => section.classes.length > 0 || section.name === "Unassigned Data");
  };

  // Function to organize teachers by class
  const organizeTeachersByClass = (teachersFromDB: any[], classesFromDB: any[]) => {
    const teachersByClass: Record<string, Teacher[]> = {};
    const unassignedTeachers: Teacher[] = [];
    
    // Remove duplicates from teachersFromDB first
    const uniqueTeachersFromDB = removeDuplicatesById(teachersFromDB || []);
    
    // Initialize teachers for each class
    classesFromDB.forEach(classItem => {
      const className = classItem.className || classItem.name;
      if (!className) return;
      
      const classTeacherNames = classItem.teachers || [];
      teachersByClass[className] = [];
      
      if (classTeacherNames.length > 0) {
        classTeacherNames.forEach((teacherName: string) => {
          // Find the full teacher details from teachersFromDB
          const teacherDetails = uniqueTeachersFromDB.find((t: Teacher) => {
            const fullName = `${t.name || ''} ${t.surname || ''}`.trim().toLowerCase();
            const searchName = teacherName.trim().toLowerCase();
            return fullName.includes(searchName) || searchName.includes(t.name?.toLowerCase() || '');
          });
          
          if (teacherDetails) {
            teachersByClass[className].push(teacherDetails);
          }
        });
        
        // Remove duplicates from this class's teachers
        teachersByClass[className] = removeDuplicatesById(teachersByClass[className]);
      }
    });
    
    // Find unassigned teachers (teachers not assigned to any class)
    uniqueTeachersFromDB.forEach((teacher: Teacher) => {
      const isAssigned = Object.values(teachersByClass).some(classTeachers => 
        classTeachers.some(t => t.id === teacher.id)
      );
      
      if (!isAssigned) {
        unassignedTeachers.push(teacher);
      }
    });
    
    // Add unassigned teachers to the special class
    if (unassignedTeachers.length > 0) {
      teachersByClass["Unassigned Teachers"] = removeDuplicatesById(unassignedTeachers);
    }
    
    return teachersByClass;
  };

  // Function to organize subjects by class
  const organizeSubjectsByClass = (subjectsFromDB: any[], classesFromDB: any[]) => {
    const subjectsByClass: Record<string, Subject[]> = {};
    const unassignedSubjects: Subject[] = [];
    
    // Remove duplicates from subjectsFromDB first
    const uniqueSubjectsFromDB = removeDuplicatesById(subjectsFromDB || []);
    
    // Initialize subjects for each class
    classesFromDB.forEach(classItem => {
      const className = classItem.className || classItem.name;
      if (!className) return;
      
      const classSubjectNames = classItem.subjects || [];
      subjectsByClass[className] = [];
      
      if (classSubjectNames.length > 0) {
        classSubjectNames.forEach((subjectName: string) => {
          // Find the full subject details from subjectsFromDB
          const subjectDetails = uniqueSubjectsFromDB.find((s: Subject) => 
            s.name?.toLowerCase().includes(subjectName.toLowerCase()) ||
            subjectName.toLowerCase().includes(s.name?.toLowerCase() || '')
          );
          
          if (subjectDetails) {
            subjectsByClass[className].push(subjectDetails);
          }
        });
        
        // Remove duplicates from this class's subjects
        subjectsByClass[className] = removeDuplicatesById(subjectsByClass[className]);
      }
    });
    
    // Find unassigned subjects (subjects not assigned to any class)
    uniqueSubjectsFromDB.forEach((subject: Subject) => {
      const isAssigned = Object.values(subjectsByClass).some(classSubjects => 
        classSubjects.some(s => s.id === subject.id)
      );
      
      if (!isAssigned) {
        unassignedSubjects.push(subject);
      }
    });
    
    // Add unassigned subjects to the special class
    if (unassignedSubjects.length > 0) {
      subjectsByClass["Unassigned Subjects"] = removeDuplicatesById(unassignedSubjects);
    }
    
    return subjectsByClass;
  };

  // Function to map student data to available classes
  const mapStudentsToClasses = (transformedData: Record<string, Student[]>, availableClasses: string[]) => {
    const mappedData: Record<string, Student[]> = {};
    const unassignedStudents: Student[] = [];
    
    // Initialize all available classes with empty arrays
    availableClasses.forEach(className => {
      mappedData[className] = [];
    });
    
    Object.keys(transformedData).forEach(studentClass => {
      // Case-insensitive matching for class names
      const matchingClass = availableClasses.find(availableClass => 
        availableClass.toLowerCase() === studentClass.toLowerCase()
      ) || findMatchingClass(studentClass, availableClasses);
      
      if (matchingClass) {
        console.log(`✅ MAPPED: "${studentClass}" -> "${matchingClass}"`);
        // Remove duplicate students before adding
        const uniqueStudents = removeDuplicatesById(transformedData[studentClass]);
        mappedData[matchingClass].push(...uniqueStudents);
      } else {
        console.warn(`❌ UNMAPPED: No match found for "${studentClass}"`);
        // Add to unassigned students (remove duplicates first)
        const uniqueStudents = removeDuplicatesById(transformedData[studentClass]);
        unassignedStudents.push(...uniqueStudents);
      }
    });
    
    // Add unassigned students to the special class (remove duplicates)
    if (unassignedStudents.length > 0) {
      mappedData["Unassigned Students"] = removeDuplicatesById(unassignedStudents);
    }
    
    // Remove empty classes
    Object.keys(mappedData).forEach(className => {
      if (mappedData[className].length === 0 && !className.includes('Unassigned')) {
        delete mappedData[className];
      }
    });
    
    return { mappedData, unmatchedClasses: Object.keys(transformedData).filter(cls => !availableClasses.some(ac => ac.toLowerCase() === cls.toLowerCase())) };
  };

  // Initialize unassigned data in classDataState
  const initializeUnassignedData = () => {
    setClassDataState(prev => ({
      ...prev,
      "Unassigned Students": {
        students: 0,
        subjects: 0,
        teacher: "Not applicable",
        activities: []
      },
      "Unassigned Teachers": {
        students: 0,
        subjects: 0,
        teacher: "Not applicable",
        activities: []
      },
      "Unassigned Subjects": {
        students: 0,
        subjects: 0,
        teacher: "Not applicable",
        activities: []
      }
    }));
  };

  // Fetch all data from database
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        setDebugInfo('Starting data fetch...');
        
        console.log('🔄 FETCHING ALL DATA FROM DATABASE...');
        
        // Initialize unassigned data
        initializeUnassignedData();
        
        // Fetch classes, teachers, and subjects in parallel
        const [classesResult, teachersResult, subjectsResult] = await Promise.all([
          getAllClasses(),
          getAllTeachers(),
          getAllSubjects()
        ]);
        
        console.log('📊 CLASSES API RESPONSE:', classesResult);
        console.log('📊 TEACHERS API RESPONSE:', teachersResult);
        console.log('📊 SUBJECTS API RESPONSE:', subjectsResult);
        
        if (classesResult?.success && Array.isArray(classesResult.data)) {
          console.log(`✅ CLASSES SUCCESS: Received ${classesResult.data.length} classes`);
          
          // Organize classes by section
          const organizedSections = organizeClassesBySection(classesResult.data);
          setClassSections(organizedSections);
          
          // Get all available classes from the organized sections
          const allAvailableClasses = organizedSections.flatMap(section => section.classes);
          console.log('🎯 AVAILABLE CLASSES FOR MAPPING:', allAvailableClasses);
          
          // Update class data with database classes
          const updatedClassData: Record<string, ClassData> = {};
          classesResult.data.forEach(classItem => {
            const className = classItem.className;
            if (className) {
              updatedClassData[className] = {
                students: 0, // Will be updated when students are loaded
                subjects: classItem.subjects?.length || 0,
                teacher: classItem.teachers?.[0] || "Not assigned",
                activities: []
              };
            }
          });
          
          setClassDataState(prev => ({ ...prev, ...updatedClassData }));
          
          // Organize teachers by class
          if (teachersResult?.success && Array.isArray(teachersResult.data)) {
            const teachersByClass = organizeTeachersByClass(teachersResult.data, classesResult.data);
            setTeachersDataState(teachersByClass);
            console.log('🎯 TEACHERS ORGANIZED BY CLASS:', teachersByClass);
          }
          
          // Organize subjects by class
          if (subjectsResult?.success && Array.isArray(subjectsResult.data)) {
            const subjectsByClass = organizeSubjectsByClass(subjectsResult.data, classesResult.data);
            setSubjectsDataState(subjectsByClass);
            console.log('🎯 SUBJECTS ORGANIZED BY CLASS:', subjectsByClass);
          }
          
          console.log('🔄 FETCHING STUDENTS FROM DATABASE...');
          const studentsList = await getStudents();
          console.log('📊 STUDENTS API RESPONSE:', studentsList);
          
          if (studentsList && Array.isArray(studentsList)) {
            console.log(`✅ STUDENTS SUCCESS: Received ${studentsList.length} students`);
            
            const transformedData = transformStudentData(studentsList);
            console.log('🔄 TRANSFORMED STUDENT DATA:', transformedData);
            
            // Map student classes to available classes from database
            const { mappedData, unmatchedClasses } = mapStudentsToClasses(transformedData, allAvailableClasses);
            
            if (unmatchedClasses.length > 0) {
              setDebugInfo(prev => prev + `\nUnmapped student classes: ${unmatchedClasses.join(', ')}`);
            }
            
            console.log('🎯 FINAL MAPPED STUDENT DATA:', mappedData);
            setStudentsDataState(mappedData);
            
            // Update class data with actual student counts
            setClassDataState(prev => {
              const updated = { ...prev };
              Object.keys(mappedData).forEach(className => {
                if (updated[className]) {
                  updated[className] = {
                    ...updated[className],
                    students: mappedData[className].length
                  };
                } else {
                  // Create entry for classes that exist in student data but not in classData
                  updated[className] = {
                    students: mappedData[className].length,
                    subjects: 0,
                    teacher: "Not assigned",
                    activities: []
                  };
                }
              });
              console.log('📈 UPDATED CLASS DATA WITH STUDENT COUNTS:', updated);
              return updated;
            });
            
            setDebugInfo(`Organized ${classesResult.data.length} classes, ${teachersResult?.data?.length || 0} teachers, ${subjectsResult?.data?.length || 0} subjects, and ${studentsList.length} students. Classes with student data: ${Object.keys(mappedData).join(', ')}`);
          } else {
            console.warn('⚠️ STUDENTS WARNING: No student data received or data is not an array');
            setError('No student data received from the server');
            setDebugInfo(prev => prev + '\nNo student data received from API');
            // Use fallback data with unique IDs
            const fallbackWithUniqueIds = Object.fromEntries(
              Object.entries(fallbackStudentsData).map(([className, students]) => [
                className,
                students.map(student => ({
                  ...student,
                  id: generateUniqueId()
                }))
              ])
            );
            setStudentsDataState(fallbackWithUniqueIds);
          }
        } else {
          console.warn('⚠️ CLASSES WARNING: No class data received from database');
          setError('No class data received from the server');
          setDebugInfo('No class data received from database');
          // Fallback to default sections
          setClassSections(DEFAULT_CLASS_SECTIONS);
          
          // Use fallback data with unique IDs
          const fallbackWithUniqueIds = Object.fromEntries(
            Object.entries(fallbackStudentsData).map(([className, students]) => [
              className,
              students.map(student => ({
                ...student,
                id: generateUniqueId()
              }))
            ])
          );
          setStudentsDataState(fallbackWithUniqueIds);
        }
      } catch (err) {
        console.error('❌ DATA FETCH ERROR:', err);
        const errorMessage = `Failed to load data: ${err instanceof Error ? err.message : 'Unknown error'}`;
        setError(errorMessage);
        setDebugInfo(`Error: ${errorMessage}`);
        // Use fallback data with unique IDs
        const fallbackWithUniqueIds = Object.fromEntries(
          Object.entries(fallbackStudentsData).map(([className, students]) => [
            className,
            students.map(student => ({
              ...student,
              id: generateUniqueId()
            }))
          ])
        );
        setStudentsDataState(fallbackWithUniqueIds);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Refresh all data function
  const refreshData = async () => {
    try {
      setLoading(true);
      setError(null);
      setDebugInfo('Refreshing all data...');
      
      console.log('🔄 REFRESHING ALL DATA FROM DATABASE...');
      
      // Fetch classes, teachers, subjects, and students in parallel
      const [classesResult, teachersResult, subjectsResult, studentsList] = await Promise.all([
        getAllClasses(),
        getAllTeachers(),
        getAllSubjects(),
        getStudents()
      ]);
      
      if (classesResult?.success && Array.isArray(classesResult.data)) {
        // Organize classes by section
        const organizedSections = organizeClassesBySection(classesResult.data);
        setClassSections(organizedSections);
        
        // Get current available classes for mapping
        const currentAvailableClasses = organizedSections.flatMap(section => section.classes);
        
        // Update class data with database classes
        const updatedClassData: Record<string, ClassData> = {};
        classesResult.data.forEach(classItem => {
          const className = classItem.className ;
          if (className) {
            updatedClassData[className] = {
              students: 0,
              subjects: classItem.subjects?.length || 0,
              teacher: classItem.teachers?.[0] || "Not assigned",
              activities: []
            };
          }
        });
        
        setClassDataState(prev => ({ ...prev, ...updatedClassData }));
        
        // Organize teachers by class
        if (teachersResult?.success && Array.isArray(teachersResult.data)) {
          const teachersByClass = organizeTeachersByClass(teachersResult.data, classesResult.data);
          setTeachersDataState(teachersByClass);
        }
        
        // Organize subjects by class
        if (subjectsResult?.success && Array.isArray(subjectsResult.data)) {
          const subjectsByClass = organizeSubjectsByClass(subjectsResult.data, classesResult.data);
          setSubjectsDataState(subjectsByClass);
        }
        
        if (studentsList && Array.isArray(studentsList)) {
          const transformedData = transformStudentData(studentsList);
          
          // Map student classes to available classes
          const { mappedData, unmatchedClasses } = mapStudentsToClasses(transformedData, currentAvailableClasses);
          
          setStudentsDataState(mappedData);
          
          // Update class data with actual student counts
          setClassDataState(prev => {
            const updated = { ...prev };
            Object.keys(mappedData).forEach(className => {
              if (updated[className]) {
                updated[className] = {
                  ...updated[className],
                  students: mappedData[className].length
                };
              } else {
                updated[className] = {
                  students: mappedData[className].length,
                  subjects: 0,
                  teacher: "Not assigned",
                  activities: []
                };
              }
            });
            return updated;
          });
          
          setDebugInfo(`Refresh complete. Classes: ${organizedSections.flatMap(s => s.classes).length}, Teachers: ${teachersResult?.data?.length || 0}, Subjects: ${subjectsResult?.data?.length || 0}, Students: ${Object.values(mappedData).flat().length}`);
        } else {
          // Use fallback data with unique IDs
          const fallbackWithUniqueIds = Object.fromEntries(
            Object.entries(fallbackStudentsData).map(([className, students]) => [
              className,
              students.map(student => ({
                ...student,
                id: generateUniqueId()
              }))
            ])
          );
          setStudentsDataState(fallbackWithUniqueIds);
        }
      } else {
        // Use fallback data with unique IDs
        const fallbackWithUniqueIds = Object.fromEntries(
          Object.entries(fallbackStudentsData).map(([className, students]) => [
            className,
            students.map(student => ({
              ...student,
              id: generateUniqueId()
            }))
          ])
        );
        setStudentsDataState(fallbackWithUniqueIds);
      }
    } catch (err) {
      console.error('❌ REFRESH ERROR:', err);
      setError(`Failed to refresh data: ${err instanceof Error ? err.message : 'Unknown error'}`);
      // Use fallback data with unique IDs
      const fallbackWithUniqueIds = Object.fromEntries(
        Object.entries(fallbackStudentsData).map(([className, students]) => [
          className,
          students.map(student => ({
            ...student,
            id: generateUniqueId()
          }))
        ])
      );
      setStudentsDataState(fallbackWithUniqueIds);
    } finally {
      setLoading(false);
    }
  };

  // Prevent editing or deleting the Unassigned Data section and its classes
  const handleDeleteSection = (sectionName: string) => {
    if (sectionName === "Unassigned Data") {
      alert("The Unassigned Data section cannot be deleted.");
      return;
    }
    
    const section = classSections.find((s) => s.name === sectionName)
    if (!section) return

    if (!confirm(`Are you sure you want to delete the "${sectionName}" section and all its classes?`)) return

    // Remove all classes in this section from data
    section.classes.forEach((className) => {
      if (selectedClass === className) {
        setSelectedClass(null)
      }
    })

    setClassSections((prev) => prev.filter((s) => s.name !== sectionName))
    setExpandedSections((prev) => prev.filter((s) => s !== sectionName))
  }

  const handleDeleteClass = (sectionName: string, classIndex: number, className: string) => {
    if (sectionName === "Unassigned Data") {
      alert("Classes in the Unassigned Data section cannot be deleted.");
      return;
    }
    
    if (!confirm(`Are you sure you want to delete "${className}"?`)) return

    setClassSections((prev) =>
      prev.map((section) => {
        if (section.name === sectionName) {
          const newClasses = section.classes.filter((_, idx) => idx !== classIndex)
          return { ...section, classes: newClasses }
        }
        return section
      }),
    )

    if (selectedClass === className) {
      setSelectedClass(null)
    }
  }

  const handleStartEditingSection = (sectionName: string) => {
    if (sectionName === "Unassigned Data") {
      alert("The Unassigned Data section cannot be renamed.");
      return;
    }
    setEditingSection(sectionName)
    setSectionEditValue(sectionName)
  }

  // Keep all other event handlers the same
  const toggleSection = (section: string) => {
    setExpandedSections((prev) => (prev.includes(section) ? prev.filter((s) => s !== section) : [...prev, section]))
  }

  const startEditing = (sectionName: string, classIndex: number, currentName: string) => {
    if (sectionName === "Unassigned Data") {
      alert("Classes in the Unassigned Data section cannot be renamed.");
      return;
    }
    setEditingClass({ section: sectionName, index: classIndex })
    setEditValue(currentName)
  }

  const saveEdit = () => {
    if (!editingClass || !editValue.trim()) return

    const oldName = classSections.find((s) => s.name === editingClass.section)?.classes[editingClass.index]
    const newName = editValue.trim()

    if (!oldName || oldName === newName) {
      setEditingClass(null)
      setEditValue("")
      return
    }

    // Update class name in sections
    setClassSections((prev) =>
      prev.map((section) => {
        if (section.name === editingClass.section) {
          const newClasses = [...section.classes]
          newClasses[editingClass.index] = newName
          return { ...section, classes: newClasses }
        }
        return section
      }),
    )

    // Update selected class if it was renamed
    if (selectedClass === oldName) {
      setSelectedClass(newName)
    }

    // Update classData keys
    setClassDataState((prev) => {
      if (prev[oldName]) {
        const newData = { ...prev }
        newData[newName] = prev[oldName]
        delete newData[oldName]
        return newData
      }
      return prev
    })

    // Update studentsData keys
    setStudentsDataState((prev) => {
      if (prev[oldName]) {
        const newData = { ...prev }
        newData[newName] = prev[oldName]
        delete newData[oldName]
        return newData
      }
      return prev
    })

    // Update teachersData keys
    setTeachersDataState((prev) => {
      if (prev[oldName]) {
        const newData = { ...prev }
        newData[newName] = prev[oldName]
        delete newData[oldName]
        return newData
      }
      return prev
    })

    // Update subjectsData keys
    setSubjectsDataState((prev) => {
      if (prev[oldName]) {
        const newData = { ...prev }
        newData[newName] = prev[oldName]
        delete newData[oldName]
        return newData
      }
      return prev
    })

    setEditingClass(null)
    setEditValue("")
  }

  const cancelEdit = () => {
    setEditingClass(null)
    setEditValue("")
  }

  const saveSectionEdit = () => {
    if (!editingSection || !sectionEditValue.trim()) return

    const newName = sectionEditValue.trim()
    if (editingSection === newName) {
      setEditingSection(null)
      setSectionEditValue("")
      return
    }

    setClassSections((prev) =>
      prev.map((section) => (section.name === editingSection ? { ...section, name: newName } : section)),
    )

    // Update expanded sections
    setExpandedSections((prev) => prev.map((s) => (s === editingSection ? newName : s)))

    setEditingSection(null)
    setSectionEditValue("")
  }

  const cancelSectionEdit = () => {
    setEditingSection(null)
    setSectionEditValue("")
  }

  const addClassToSection = (sectionName: string) => {
    if (sectionName === "Unassigned Data") {
      alert("Cannot add classes to the Unassigned Data section.");
      return;
    }
    
    const section = classSections.find((s) => s.name === sectionName)
    if (!section) return

    const newClassName = prompt(`Enter name for new class in ${sectionName}:`)
    if (!newClassName || !newClassName.trim()) return

    const trimmedName = newClassName.trim()

    // Check if class name already exists in this section
    if (section.classes.includes(trimmedName)) {
      alert("A class with this name already exists in this section!")
      return
    }

    setClassSections((prev) =>
      prev.map((s) => (s.name === sectionName ? { ...s, classes: [...s.classes, trimmedName] } : s)),
    )

    // Initialize empty data for the new class
    setClassDataState((prev) => ({
      ...prev,
      [trimmedName]: {
        students: 0,
        subjects: 0,
        teacher: "Not assigned",
        activities: [],
      },
    }))
  }

  const addNewSection = () => {
    const newSectionName = prompt("Enter name for new section:")
    if (!newSectionName || !newSectionName.trim()) return

    const trimmedName = newSectionName.trim()

    // Check if section already exists
    if (classSections.some((s) => s.name === trimmedName)) {
      alert("A section with this name already exists!")
      return
    }

    setClassSections((prev) => [...prev, { name: trimmedName, classes: [] }])
    setExpandedSections((prev) => [...prev, trimmedName])
  }

  return (
    <>
      <Breadcrumb pageName="Classes Management" />
      <div className="grid grid-cols-1 gap-6 sm:gap-9 sm:grid-cols-1">
        <div className="flex flex-col gap-6 sm:gap-9">
          <ShowcaseSection title="Classes Management" className="space-y-5.5 !p-4 sm:!p-6.5">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Classes</h1>
                <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                  Classes: {classSections.flatMap(s => s.classes).length} | 
                  Teachers: {Object.values(teachersDataState).flat().length} |
                  Subjects: {Object.values(subjectsDataState).flat().length} |
                  Students: {Object.values(studentsDataState).flat().length}
                  {loading && " (Loading...)"}
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                <button
                  onClick={() => {
                    console.log('🔍 CURRENT CLASS SECTIONS:', classSections);
                    console.log('🔍 CURRENT STUDENT DATA:', studentsDataState);
                    console.log('🔍 CURRENT TEACHER DATA:', teachersDataState);
                    console.log('🔍 CURRENT SUBJECT DATA:', subjectsDataState);
                    console.log('🔍 CURRENT CLASS DATA:', classDataState);
                    alert('Check browser console for debug information');
                  }}
                  className="flex items-center justify-center gap-2 px-3 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors text-sm"
                >
                  Debug Info
                </button>
                <button
                  onClick={refreshData}
                  disabled={loading}
                  className="flex items-center justify-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50 transition-colors text-sm"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Refreshing...
                    </>
                  ) : (
                    "Refresh Data"
                  )}
                </button>
                {/* Replace button with Link for Create New Class */}
                <Link
                  href="/academics/classes/new"
                  className="flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors text-sm text-center"
                >
                  Create New Class
                </Link>
              </div>
            </div>

            {error && (
              <div className="p-4 mb-4 bg-red-50 border border-red-200 rounded-md">
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
                  <span className="text-red-700 font-medium">Error:</span>
                  <span className="text-red-600">{error}</span>
                </div>
                <button
                  onClick={refreshData}
                  className="mt-2 px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700 transition-colors w-full sm:w-auto"
                >
                  Try Again
                </button>
              </div>
            )}

            {debugInfo && (
              <details className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
                <summary className="cursor-pointer font-medium text-blue-700">Debug Information</summary>
                <pre className="mt-2 text-xs text-blue-600 whitespace-pre-wrap">{debugInfo}</pre>
              </details>
            )}

            <div className="flex flex-col lg:flex-row gap-4 sm:gap-6">
              <ClassSidebar
                classSections={classSections}
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

              <main className="flex-1 bg-card border border-border rounded-lg p-4 sm:p-6">
                <ClassContent
                  selectedClass={selectedClass}
                  activeView={activeView}
                  classDataState={classDataState}
                  studentsDataState={studentsDataState}
                  teachersDataState={teachersDataState}
                  subjectsDataState={subjectsDataState}
                  loading={loading}
                  onSetActiveView={setActiveView}
                  onRefreshStudentsData={refreshData}
                />
              </main>
            </div>
          </ShowcaseSection>
        </div>
      </div>
    </>
  )
}

export default ClassesPage;