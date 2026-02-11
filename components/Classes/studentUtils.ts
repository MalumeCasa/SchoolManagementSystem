// Helper function to generate unique IDs
export const generateUniqueId = (): number => {
  return Math.floor(Math.random() * 1000000) + Date.now();
};

// Helper function to remove duplicates by ID
export const removeDuplicatesById = <T extends { id: number }>(array: T[]): T[] => {
  const seen = new Set();
  return array.filter(item => {
    if (seen.has(item.id)) {
      console.warn(`Duplicate ID found: ${item.id}`);
      return false;
    }
    seen.add(item.id);
    return true;
  });
};

// Updated transformStudentData with duplicate prevention
export const transformStudentData = (students: any[]): Record<string, any[]> => {
  const transformed: Record<string, any[]> = {};
  
  // First remove duplicates from the input
  const uniqueStudents = removeDuplicatesById(students);
  
  uniqueStudents.forEach(student => {
    const className = student.class || 'Unassigned';
    
    if (!transformed[className]) {
      transformed[className] = [];
    }
    
    // Ensure each student has a unique ID
    const studentWithId = {
      ...student,
      id: student.id || generateUniqueId()
    };
    
    transformed[className].push(studentWithId);
  });
  
  return transformed;
};

// Updated fallbackStudentsData with unique IDs
export const fallbackStudentsData: Record<string, any[]> = {
  "Primary 1": [
    { id: generateUniqueId(), name: "John", surname: "Doe", email: "john.doe@school.com", phone: "123-456-7890" },
    { id: generateUniqueId(), name: "Jane", surname: "Smith", email: "jane.smith@school.com", phone: "123-456-7891" }
  ],
  "Primary 2": [
    { id: generateUniqueId(), name: "Mike", surname: "Johnson", email: "mike.johnson@school.com", phone: "123-456-7892" },
    { id: generateUniqueId(), name: "Sarah", surname: "Williams", email: "sarah.williams@school.com", phone: "123-456-7893" }
  ],
  "Unassigned Students": [
    { id: generateUniqueId(), name: "Unassigned", surname: "Student", email: "unassigned@school.com", phone: "000-000-0000" }
  ]
};

// Keep the existing findMatchingClass function
export const findMatchingClass = (studentClass: string, availableClasses: string[]): string | null => {
  // ... existing implementation ...
  const classMapping: Record<string, string> = {
    'p1': 'Primary 1',
    'p2': 'Primary 2',
    'p3': 'Primary 3',
    'p4': 'Primary 4',
    'p5': 'Primary 5',
    'p6': 'Primary 6',
    'jss1': 'JSS 1',
    'jss2': 'JSS 2',
    'jss3': 'JSS 3',
    'ss1': 'SS 1',
    'ss2': 'SS 2',
    'ss3': 'SS 3',
    'nursery1': 'Nursery 1',
    'nursery2': 'Nursery 2'
  };

  const normalizedStudentClass = studentClass.toLowerCase().replace(/\s+/g, '');
  
  // Direct mapping
  if (classMapping[normalizedStudentClass]) {
    const mappedClass = classMapping[normalizedStudentClass];
    if (availableClasses.includes(mappedClass)) {
      return mappedClass;
    }
  }

  // Fuzzy matching
  for (const availableClass of availableClasses) {
    const normalizedAvailable = availableClass.toLowerCase().replace(/\s+/g, '');
    if (normalizedStudentClass.includes(normalizedAvailable) || normalizedAvailable.includes(normalizedStudentClass)) {
      return availableClass;
    }
  }

  return null;
};