import { relations } from "drizzle-orm/relations";
import { staff, teachers, students, studentMedicalInfo, parents, parentStudentRelations, academicYears, academicTerms, registeredStudents, teacherClasses, classes, subjects, subjectClasses, subjectTeachers, classPeriods, curriculum, curriculumChapters, curriculumTopics, curriculumProgress, studentCurriculumProgress, assignments, grades, exams, assignmentSubmissions, examResults, feeStructure, studentFees, staffLeave, feePayments, feeDiscounts, studentAttendance, attendanceSummary, staffAttendance, staffSalary, events, reportCards, chatRooms, chatRoomMembers, users, userSessions, chatMessages, notifications, notices, reportCardSubjects, studentMigrationLog } from "./schema";

export const teachersRelations = relations(teachers, ({one, many}) => ({
	staff: one(staff, {
		fields: [teachers.staffId],
		references: [staff.id]
	}),
	teacherClasses: many(teacherClasses),
	subjectTeachers: many(subjectTeachers),
	assignments: many(assignments),
	assignmentSubmissions: many(assignmentSubmissions),
}));

export const staffRelations = relations(staff, ({many}) => ({
	teachers: many(teachers),
	grades: many(grades),
	staffLeaves_staffId: many(staffLeave, {
		relationName: "staffLeave_staffId_staff_id"
	}),
	staffLeaves_approvedBy: many(staffLeave, {
		relationName: "staffLeave_approvedBy_staff_id"
	}),
	feePayments: many(feePayments),
	studentAttendances: many(studentAttendance),
	staffAttendances: many(staffAttendance),
	staffSalaries: many(staffSalary),
	events: many(events),
	reportCards: many(reportCards),
	chatRooms: many(chatRooms),
	notices: many(notices),
}));

export const studentMedicalInfoRelations = relations(studentMedicalInfo, ({one}) => ({
	student: one(students, {
		fields: [studentMedicalInfo.id],
		references: [students.id]
	}),
}));

export const studentsRelations = relations(students, ({one, many}) => ({
	studentMedicalInfos: many(studentMedicalInfo),
	parentStudentRelations: many(parentStudentRelations),
	registeredStudent: one(registeredStudents, {
		fields: [students.registeredStudentId],
		references: [registeredStudents.id]
	}),
	studentCurriculumProgresses: many(studentCurriculumProgress),
	grades: many(grades),
	assignmentSubmissions: many(assignmentSubmissions),
	examResults: many(examResults),
	studentFees: many(studentFees),
	feeDiscounts: many(feeDiscounts),
	studentAttendances: many(studentAttendance),
	attendanceSummaries: many(attendanceSummary),
	reportCards: many(reportCards),
}));

export const parentStudentRelationsRelations = relations(parentStudentRelations, ({one}) => ({
	parent: one(parents, {
		fields: [parentStudentRelations.parentId],
		references: [parents.id]
	}),
	student: one(students, {
		fields: [parentStudentRelations.studentId],
		references: [students.id]
	}),
}));

export const parentsRelations = relations(parents, ({many}) => ({
	parentStudentRelations: many(parentStudentRelations),
}));

export const academicTermsRelations = relations(academicTerms, ({one, many}) => ({
	academicYear: one(academicYears, {
		fields: [academicTerms.academicYearId],
		references: [academicYears.id]
	}),
	reportCards: many(reportCards),
}));

export const academicYearsRelations = relations(academicYears, ({many}) => ({
	academicTerms: many(academicTerms),
	reportCards: many(reportCards),
}));

export const registeredStudentsRelations = relations(registeredStudents, ({many}) => ({
	students: many(students),
	studentMigrationLogs: many(studentMigrationLog),
}));

export const teacherClassesRelations = relations(teacherClasses, ({one}) => ({
	teacher: one(teachers, {
		fields: [teacherClasses.teacherId],
		references: [teachers.id]
	}),
	class: one(classes, {
		fields: [teacherClasses.classId],
		references: [classes.id]
	}),
}));

export const classesRelations = relations(classes, ({many}) => ({
	teacherClasses: many(teacherClasses),
	subjectClasses: many(subjectClasses),
	classPeriods: many(classPeriods),
	curricula: many(curriculum),
	curriculumProgresses: many(curriculumProgress),
	assignments: many(assignments),
	exams: many(exams),
	feeStructures: many(feeStructure),
	studentAttendances: many(studentAttendance),
	attendanceSummaries: many(attendanceSummary),
	events: many(events),
	reportCards: many(reportCards),
	chatRooms: many(chatRooms),
}));

export const subjectClassesRelations = relations(subjectClasses, ({one}) => ({
	subject: one(subjects, {
		fields: [subjectClasses.subjectId],
		references: [subjects.id]
	}),
	class: one(classes, {
		fields: [subjectClasses.classId],
		references: [classes.id]
	}),
}));

export const subjectsRelations = relations(subjects, ({many}) => ({
	subjectClasses: many(subjectClasses),
	subjectTeachers: many(subjectTeachers),
	classPeriods: many(classPeriods),
	curricula: many(curriculum),
	assignments: many(assignments),
	exams: many(exams),
	studentAttendances: many(studentAttendance),
	reportCardSubjects: many(reportCardSubjects),
}));

export const subjectTeachersRelations = relations(subjectTeachers, ({one}) => ({
	subject: one(subjects, {
		fields: [subjectTeachers.subjectId],
		references: [subjects.id]
	}),
	teacher: one(teachers, {
		fields: [subjectTeachers.teacherId],
		references: [teachers.id]
	}),
}));

export const classPeriodsRelations = relations(classPeriods, ({one}) => ({
	class: one(classes, {
		fields: [classPeriods.classId],
		references: [classes.id]
	}),
	subject: one(subjects, {
		fields: [classPeriods.subjectId],
		references: [subjects.id]
	}),
}));

export const curriculumRelations = relations(curriculum, ({one, many}) => ({
	class: one(classes, {
		fields: [curriculum.classId],
		references: [classes.id]
	}),
	subject: one(subjects, {
		fields: [curriculum.subjectId],
		references: [subjects.id]
	}),
	curriculumChapters: many(curriculumChapters),
	curriculumProgresses: many(curriculumProgress),
	studentCurriculumProgresses: many(studentCurriculumProgress),
}));

export const curriculumChaptersRelations = relations(curriculumChapters, ({one, many}) => ({
	curriculum: one(curriculum, {
		fields: [curriculumChapters.curriculumId],
		references: [curriculum.id]
	}),
	curriculumTopics: many(curriculumTopics),
}));

export const curriculumTopicsRelations = relations(curriculumTopics, ({one}) => ({
	curriculumChapter: one(curriculumChapters, {
		fields: [curriculumTopics.chapterId],
		references: [curriculumChapters.id]
	}),
}));

export const curriculumProgressRelations = relations(curriculumProgress, ({one}) => ({
	curriculum: one(curriculum, {
		fields: [curriculumProgress.curriculumId],
		references: [curriculum.id]
	}),
	class: one(classes, {
		fields: [curriculumProgress.classId],
		references: [classes.id]
	}),
}));

export const studentCurriculumProgressRelations = relations(studentCurriculumProgress, ({one}) => ({
	student: one(students, {
		fields: [studentCurriculumProgress.studentId],
		references: [students.id]
	}),
	curriculum: one(curriculum, {
		fields: [studentCurriculumProgress.curriculumId],
		references: [curriculum.id]
	}),
}));

export const assignmentsRelations = relations(assignments, ({one, many}) => ({
	class: one(classes, {
		fields: [assignments.classId],
		references: [classes.id]
	}),
	subject: one(subjects, {
		fields: [assignments.subjectId],
		references: [subjects.id]
	}),
	teacher: one(teachers, {
		fields: [assignments.teacherId],
		references: [teachers.id]
	}),
	assignmentSubmissions: many(assignmentSubmissions),
}));

export const gradesRelations = relations(grades, ({one}) => ({
	student: one(students, {
		fields: [grades.studentId],
		references: [students.id]
	}),
	exam: one(exams, {
		fields: [grades.examId],
		references: [exams.id]
	}),
	staff: one(staff, {
		fields: [grades.recordedBy],
		references: [staff.id]
	}),
}));

export const examsRelations = relations(exams, ({one, many}) => ({
	grades: many(grades),
	class: one(classes, {
		fields: [exams.classId],
		references: [classes.id]
	}),
	subject: one(subjects, {
		fields: [exams.subjectId],
		references: [subjects.id]
	}),
	examResults: many(examResults),
}));

export const assignmentSubmissionsRelations = relations(assignmentSubmissions, ({one}) => ({
	assignment: one(assignments, {
		fields: [assignmentSubmissions.assignmentId],
		references: [assignments.id]
	}),
	student: one(students, {
		fields: [assignmentSubmissions.studentId],
		references: [students.id]
	}),
	teacher: one(teachers, {
		fields: [assignmentSubmissions.gradedBy],
		references: [teachers.id]
	}),
}));

export const examResultsRelations = relations(examResults, ({one}) => ({
	exam: one(exams, {
		fields: [examResults.examId],
		references: [exams.id]
	}),
	student: one(students, {
		fields: [examResults.studentId],
		references: [students.id]
	}),
}));

export const feeStructureRelations = relations(feeStructure, ({one, many}) => ({
	class: one(classes, {
		fields: [feeStructure.classId],
		references: [classes.id]
	}),
	studentFees: many(studentFees),
	feeDiscounts: many(feeDiscounts),
}));

export const studentFeesRelations = relations(studentFees, ({one, many}) => ({
	student: one(students, {
		fields: [studentFees.studentId],
		references: [students.id]
	}),
	feeStructure: one(feeStructure, {
		fields: [studentFees.feeStructureId],
		references: [feeStructure.id]
	}),
	feePayments: many(feePayments),
}));

export const staffLeaveRelations = relations(staffLeave, ({one}) => ({
	staff_staffId: one(staff, {
		fields: [staffLeave.staffId],
		references: [staff.id],
		relationName: "staffLeave_staffId_staff_id"
	}),
	staff_approvedBy: one(staff, {
		fields: [staffLeave.approvedBy],
		references: [staff.id],
		relationName: "staffLeave_approvedBy_staff_id"
	}),
}));

export const feePaymentsRelations = relations(feePayments, ({one}) => ({
	studentFee: one(studentFees, {
		fields: [feePayments.studentFeeId],
		references: [studentFees.id]
	}),
	staff: one(staff, {
		fields: [feePayments.receivedBy],
		references: [staff.id]
	}),
}));

export const feeDiscountsRelations = relations(feeDiscounts, ({one}) => ({
	student: one(students, {
		fields: [feeDiscounts.studentId],
		references: [students.id]
	}),
	feeStructure: one(feeStructure, {
		fields: [feeDiscounts.feeStructureId],
		references: [feeStructure.id]
	}),
}));

export const studentAttendanceRelations = relations(studentAttendance, ({one}) => ({
	student: one(students, {
		fields: [studentAttendance.studentId],
		references: [students.id]
	}),
	class: one(classes, {
		fields: [studentAttendance.classId],
		references: [classes.id]
	}),
	subject: one(subjects, {
		fields: [studentAttendance.subjectId],
		references: [subjects.id]
	}),
	staff: one(staff, {
		fields: [studentAttendance.recordedBy],
		references: [staff.id]
	}),
}));

export const attendanceSummaryRelations = relations(attendanceSummary, ({one}) => ({
	student: one(students, {
		fields: [attendanceSummary.studentId],
		references: [students.id]
	}),
	class: one(classes, {
		fields: [attendanceSummary.classId],
		references: [classes.id]
	}),
}));

export const staffAttendanceRelations = relations(staffAttendance, ({one}) => ({
	staff: one(staff, {
		fields: [staffAttendance.staffId],
		references: [staff.id]
	}),
}));

export const staffSalaryRelations = relations(staffSalary, ({one}) => ({
	staff: one(staff, {
		fields: [staffSalary.staffId],
		references: [staff.id]
	}),
}));

export const eventsRelations = relations(events, ({one}) => ({
	class: one(classes, {
		fields: [events.classId],
		references: [classes.id]
	}),
	staff: one(staff, {
		fields: [events.createdBy],
		references: [staff.id]
	}),
}));

export const reportCardsRelations = relations(reportCards, ({one, many}) => ({
	student: one(students, {
		fields: [reportCards.studentId],
		references: [students.id]
	}),
	academicYear: one(academicYears, {
		fields: [reportCards.academicYearId],
		references: [academicYears.id]
	}),
	academicTerm: one(academicTerms, {
		fields: [reportCards.termId],
		references: [academicTerms.id]
	}),
	class: one(classes, {
		fields: [reportCards.classId],
		references: [classes.id]
	}),
	staff: one(staff, {
		fields: [reportCards.generatedBy],
		references: [staff.id]
	}),
	reportCardSubjects: many(reportCardSubjects),
}));

export const chatRoomsRelations = relations(chatRooms, ({one, many}) => ({
	class: one(classes, {
		fields: [chatRooms.classId],
		references: [classes.id]
	}),
	staff: one(staff, {
		fields: [chatRooms.createdBy],
		references: [staff.id]
	}),
	chatRoomMembers: many(chatRoomMembers),
	chatMessages: many(chatMessages),
}));

export const chatRoomMembersRelations = relations(chatRoomMembers, ({one}) => ({
	chatRoom: one(chatRooms, {
		fields: [chatRoomMembers.roomId],
		references: [chatRooms.id]
	}),
}));

export const userSessionsRelations = relations(userSessions, ({one}) => ({
	user: one(users, {
		fields: [userSessions.userId],
		references: [users.id]
	}),
}));

export const usersRelations = relations(users, ({many}) => ({
	userSessions: many(userSessions),
	notifications: many(notifications),
}));

export const chatMessagesRelations = relations(chatMessages, ({one}) => ({
	chatRoom: one(chatRooms, {
		fields: [chatMessages.roomId],
		references: [chatRooms.id]
	}),
}));

export const notificationsRelations = relations(notifications, ({one}) => ({
	user: one(users, {
		fields: [notifications.userId],
		references: [users.id]
	}),
}));

export const noticesRelations = relations(notices, ({one}) => ({
	staff: one(staff, {
		fields: [notices.createdBy],
		references: [staff.id]
	}),
}));

export const reportCardSubjectsRelations = relations(reportCardSubjects, ({one}) => ({
	reportCard: one(reportCards, {
		fields: [reportCardSubjects.reportCardId],
		references: [reportCards.id]
	}),
	subject: one(subjects, {
		fields: [reportCardSubjects.subjectId],
		references: [subjects.id]
	}),
}));

export const studentMigrationLogRelations = relations(studentMigrationLog, ({one}) => ({
	registeredStudent: one(registeredStudents, {
		fields: [studentMigrationLog.registeredStudentId],
		references: [registeredStudents.id]
	}),
}));