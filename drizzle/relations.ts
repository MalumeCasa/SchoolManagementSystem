import { relations } from "drizzle-orm/relations";
import { users, classes, classEnrollments, classSubjects, subjects, attendance, grades, announcements, schedules, events } from "./schema";

export const classesRelations = relations(classes, ({one, many}) => ({
	user: one(users, {
		fields: [classes.teacherId],
		references: [users.id]
	}),
	classEnrollments: many(classEnrollments),
	classSubjects: many(classSubjects),
	attendances: many(attendance),
	grades: many(grades),
	schedules: many(schedules),
}));

export const usersRelations = relations(users, ({many}) => ({
	classes: many(classes),
	classEnrollments: many(classEnrollments),
	classSubjects: many(classSubjects),
	attendances_studentId: many(attendance, {
		relationName: "attendance_studentId_users_id"
	}),
	attendances_markedBy: many(attendance, {
		relationName: "attendance_markedBy_users_id"
	}),
	grades_studentId: many(grades, {
		relationName: "grades_studentId_users_id"
	}),
	grades_gradedBy: many(grades, {
		relationName: "grades_gradedBy_users_id"
	}),
	announcements: many(announcements),
	schedules: many(schedules),
	events: many(events),
}));

export const classEnrollmentsRelations = relations(classEnrollments, ({one}) => ({
	user: one(users, {
		fields: [classEnrollments.studentId],
		references: [users.id]
	}),
	class: one(classes, {
		fields: [classEnrollments.classId],
		references: [classes.id]
	}),
}));

export const classSubjectsRelations = relations(classSubjects, ({one}) => ({
	class: one(classes, {
		fields: [classSubjects.classId],
		references: [classes.id]
	}),
	subject: one(subjects, {
		fields: [classSubjects.subjectId],
		references: [subjects.id]
	}),
	user: one(users, {
		fields: [classSubjects.teacherId],
		references: [users.id]
	}),
}));

export const subjectsRelations = relations(subjects, ({many}) => ({
	classSubjects: many(classSubjects),
	grades: many(grades),
	schedules: many(schedules),
}));

export const attendanceRelations = relations(attendance, ({one}) => ({
	user_studentId: one(users, {
		fields: [attendance.studentId],
		references: [users.id],
		relationName: "attendance_studentId_users_id"
	}),
	class: one(classes, {
		fields: [attendance.classId],
		references: [classes.id]
	}),
	user_markedBy: one(users, {
		fields: [attendance.markedBy],
		references: [users.id],
		relationName: "attendance_markedBy_users_id"
	}),
}));

export const gradesRelations = relations(grades, ({one}) => ({
	user_studentId: one(users, {
		fields: [grades.studentId],
		references: [users.id],
		relationName: "grades_studentId_users_id"
	}),
	subject: one(subjects, {
		fields: [grades.subjectId],
		references: [subjects.id]
	}),
	class: one(classes, {
		fields: [grades.classId],
		references: [classes.id]
	}),
	user_gradedBy: one(users, {
		fields: [grades.gradedBy],
		references: [users.id],
		relationName: "grades_gradedBy_users_id"
	}),
}));

export const announcementsRelations = relations(announcements, ({one}) => ({
	user: one(users, {
		fields: [announcements.authorId],
		references: [users.id]
	}),
}));

export const schedulesRelations = relations(schedules, ({one}) => ({
	class: one(classes, {
		fields: [schedules.classId],
		references: [classes.id]
	}),
	subject: one(subjects, {
		fields: [schedules.subjectId],
		references: [subjects.id]
	}),
	user: one(users, {
		fields: [schedules.teacherId],
		references: [users.id]
	}),
}));

export const eventsRelations = relations(events, ({one}) => ({
	user: one(users, {
		fields: [events.organizerId],
		references: [users.id]
	}),
}));