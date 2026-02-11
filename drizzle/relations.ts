import { relations } from "drizzle-orm/relations";
import { assignments, assignmentSubmissions, students, teachers, attendanceSummary, classes, chatRooms, chatRoomMembers, events, staff, studentFees, feePayments, exams, subjects, notices, studentAttendance, feeStructure, grades, chatMessages, classPeriods, feeDiscounts, users, notifications, userSessions, curriculum, examResults, subjectClasses, teacherClasses, curriculumProgress, reportCards, reportCardSubjects, academicYears, academicTerms, curriculumChapters, curriculumTopics, studentCurriculumProgress } from "./schema";

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

export const assignmentsRelations = relations(assignments, ({one, many}) => ({
	assignmentSubmissions: many(assignmentSubmissions),
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
}));

export const studentsRelations = relations(students, ({many}) => ({
	assignmentSubmissions: many(assignmentSubmissions),
	attendanceSummaries: many(attendanceSummary),
	studentAttendances: many(studentAttendance),
	grades: many(grades),
	studentFees: many(studentFees),
	feeDiscounts: many(feeDiscounts),
	examResults: many(examResults),
	reportCards: many(reportCards),
	studentCurriculumProgresses: many(studentCurriculumProgress),
}));

export const teachersRelations = relations(teachers, ({many}) => ({
	assignmentSubmissions: many(assignmentSubmissions),
	teacherClasses: many(teacherClasses),
	assignments: many(assignments),
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

export const classesRelations = relations(classes, ({many}) => ({
	attendanceSummaries: many(attendanceSummary),
	events: many(events),
	exams: many(exams),
	chatRooms: many(chatRooms),
	studentAttendances: many(studentAttendance),
	feeStructures: many(feeStructure),
	classPeriods: many(classPeriods),
	curricula: many(curriculum),
	subjectClasses: many(subjectClasses),
	teacherClasses: many(teacherClasses),
	assignments: many(assignments),
	curriculumProgresses: many(curriculumProgress),
	reportCards: many(reportCards),
}));

export const chatRoomMembersRelations = relations(chatRoomMembers, ({one}) => ({
	chatRoom: one(chatRooms, {
		fields: [chatRoomMembers.roomId],
		references: [chatRooms.id]
	}),
}));

export const chatRoomsRelations = relations(chatRooms, ({one, many}) => ({
	chatRoomMembers: many(chatRoomMembers),
	class: one(classes, {
		fields: [chatRooms.classId],
		references: [classes.id]
	}),
	staff: one(staff, {
		fields: [chatRooms.createdBy],
		references: [staff.id]
	}),
	chatMessages: many(chatMessages),
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

export const staffRelations = relations(staff, ({many}) => ({
	events: many(events),
	feePayments: many(feePayments),
	chatRooms: many(chatRooms),
	notices: many(notices),
	studentAttendances: many(studentAttendance),
	grades: many(grades),
	reportCards: many(reportCards),
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

export const studentFeesRelations = relations(studentFees, ({one, many}) => ({
	feePayments: many(feePayments),
	student: one(students, {
		fields: [studentFees.studentId],
		references: [students.id]
	}),
	feeStructure: one(feeStructure, {
		fields: [studentFees.feeStructureId],
		references: [feeStructure.id]
	}),
}));

export const examsRelations = relations(exams, ({one, many}) => ({
	class: one(classes, {
		fields: [exams.classId],
		references: [classes.id]
	}),
	subject: one(subjects, {
		fields: [exams.subjectId],
		references: [subjects.id]
	}),
	grades: many(grades),
	examResults: many(examResults),
}));

export const subjectsRelations = relations(subjects, ({many}) => ({
	exams: many(exams),
	studentAttendances: many(studentAttendance),
	classPeriods: many(classPeriods),
	curricula: many(curriculum),
	subjectClasses: many(subjectClasses),
	assignments: many(assignments),
	reportCardSubjects: many(reportCardSubjects),
}));

export const noticesRelations = relations(notices, ({one}) => ({
	staff: one(staff, {
		fields: [notices.createdBy],
		references: [staff.id]
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

export const feeStructureRelations = relations(feeStructure, ({one, many}) => ({
	class: one(classes, {
		fields: [feeStructure.classId],
		references: [classes.id]
	}),
	studentFees: many(studentFees),
	feeDiscounts: many(feeDiscounts),
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

export const chatMessagesRelations = relations(chatMessages, ({one}) => ({
	chatRoom: one(chatRooms, {
		fields: [chatMessages.roomId],
		references: [chatRooms.id]
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

export const notificationsRelations = relations(notifications, ({one}) => ({
	user: one(users, {
		fields: [notifications.userId],
		references: [users.id]
	}),
}));

export const usersRelations = relations(users, ({many}) => ({
	notifications: many(notifications),
	userSessions: many(userSessions),
}));

export const userSessionsRelations = relations(userSessions, ({one}) => ({
	user: one(users, {
		fields: [userSessions.userId],
		references: [users.id]
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
	curriculumProgresses: many(curriculumProgress),
	curriculumChapters: many(curriculumChapters),
	studentCurriculumProgresses: many(studentCurriculumProgress),
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

export const reportCardsRelations = relations(reportCards, ({one, many}) => ({
	reportCardSubjects: many(reportCardSubjects),
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
	student: one(students, {
		fields: [reportCards.studentId],
		references: [students.id]
	}),
}));

export const academicYearsRelations = relations(academicYears, ({many}) => ({
	reportCards: many(reportCards),
	academicTerms: many(academicTerms),
}));

export const academicTermsRelations = relations(academicTerms, ({one, many}) => ({
	reportCards: many(reportCards),
	academicYear: one(academicYears, {
		fields: [academicTerms.academicYearId],
		references: [academicYears.id]
	}),
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