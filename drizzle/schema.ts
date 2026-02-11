import { pgTable, index, unique, check, serial, varchar, timestamp, text, date, foreignKey, integer, time, numeric, boolean } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"



export const users = pgTable("users", {
	id: serial().primaryKey().notNull(),
	email: varchar({ length: 255 }).notNull(),
	passwordHash: varchar("password_hash", { length: 255 }).notNull(),
	fullName: varchar("full_name", { length: 255 }).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
	updatedAt: timestamp("updated_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
	role: varchar({ length: 50 }).default('user').notNull(),
	studentId: varchar("student_id", { length: 50 }),
	teacherId: varchar("teacher_id", { length: 50 }),
	phone: varchar({ length: 20 }),
	address: text(),
	dateOfBirth: date("date_of_birth"),
	gender: varchar({ length: 20 }),
	profileImageUrl: text("profile_image_url"),
	idDocumentUrl: text("id_document_url"),
	idNumber: varchar("id_number", { length: 100 }),
	guardianName: varchar("guardian_name", { length: 255 }),
	guardianPhone: varchar("guardian_phone", { length: 20 }),
	guardianEmail: varchar("guardian_email", { length: 255 }),
	enrollmentDate: date("enrollment_date").default(sql`CURRENT_DATE`),
	status: varchar({ length: 50 }).default('active'),
}, (table) => [
	index("idx_users_email").using("btree", table.email.asc().nullsLast().op("text_ops")),
	index("idx_users_role").using("btree", table.role.asc().nullsLast().op("text_ops")),
	index("idx_users_student_id").using("btree", table.studentId.asc().nullsLast().op("text_ops")),
	unique("users_email_key").on(table.email),
	check("check_user_role", sql`(role)::text = ANY ((ARRAY['student'::character varying, 'teacher'::character varying, 'admin'::character varying, 'parent'::character varying, 'moderator'::character varying, 'user'::character varying])::text[])`),
]);

export const classes = pgTable("classes", {
	id: serial().primaryKey().notNull(),
	name: varchar({ length: 100 }).notNull(),
	gradeLevel: varchar("grade_level", { length: 50 }).notNull(),
	section: varchar({ length: 20 }),
	academicYear: varchar("academic_year", { length: 20 }).notNull(),
	teacherId: integer("teacher_id"),
	roomNumber: varchar("room_number", { length: 50 }),
	capacity: integer().default(30),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
	foreignKey({
			columns: [table.teacherId],
			foreignColumns: [users.id],
			name: "classes_teacher_id_fkey"
		}),
]);

export const classEnrollments = pgTable("class_enrollments", {
	id: serial().primaryKey().notNull(),
	studentId: integer("student_id"),
	classId: integer("class_id"),
	enrolledAt: timestamp("enrolled_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
	status: varchar({ length: 50 }).default('active'),
}, (table) => [
	index("idx_class_enrollments_class").using("btree", table.classId.asc().nullsLast().op("int4_ops")),
	index("idx_class_enrollments_student").using("btree", table.studentId.asc().nullsLast().op("int4_ops")),
	foreignKey({
			columns: [table.studentId],
			foreignColumns: [users.id],
			name: "class_enrollments_student_id_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.classId],
			foreignColumns: [classes.id],
			name: "class_enrollments_class_id_fkey"
		}).onDelete("cascade"),
	unique("class_enrollments_student_id_class_id_key").on(table.studentId, table.classId),
]);

export const classSubjects = pgTable("class_subjects", {
	id: serial().primaryKey().notNull(),
	classId: integer("class_id"),
	subjectId: integer("subject_id"),
	teacherId: integer("teacher_id"),
	scheduleDay: varchar("schedule_day", { length: 20 }),
	scheduleTime: time("schedule_time"),
}, (table) => [
	foreignKey({
			columns: [table.classId],
			foreignColumns: [classes.id],
			name: "class_subjects_class_id_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.subjectId],
			foreignColumns: [subjects.id],
			name: "class_subjects_subject_id_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.teacherId],
			foreignColumns: [users.id],
			name: "class_subjects_teacher_id_fkey"
		}),
	unique("class_subjects_class_id_subject_id_key").on(table.classId, table.subjectId),
]);

export const subjects = pgTable("subjects", {
	id: serial().primaryKey().notNull(),
	name: varchar({ length: 100 }).notNull(),
	code: varchar({ length: 20 }).notNull(),
	description: text(),
	creditHours: integer("credit_hours").default(3),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
	unique("subjects_code_key").on(table.code),
]);

export const attendance = pgTable("attendance", {
	id: serial().primaryKey().notNull(),
	studentId: integer("student_id"),
	classId: integer("class_id"),
	date: date().default(sql`CURRENT_DATE`).notNull(),
	status: varchar({ length: 20 }).notNull(),
	markedBy: integer("marked_by"),
	notes: text(),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
	index("idx_attendance_class").using("btree", table.classId.asc().nullsLast().op("int4_ops")),
	index("idx_attendance_date").using("btree", table.date.asc().nullsLast().op("date_ops")),
	index("idx_attendance_student").using("btree", table.studentId.asc().nullsLast().op("int4_ops")),
	foreignKey({
			columns: [table.studentId],
			foreignColumns: [users.id],
			name: "attendance_student_id_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.classId],
			foreignColumns: [classes.id],
			name: "attendance_class_id_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.markedBy],
			foreignColumns: [users.id],
			name: "attendance_marked_by_fkey"
		}),
	unique("attendance_student_id_class_id_date_key").on(table.studentId, table.classId, table.date),
	check("attendance_status_check", sql`(status)::text = ANY ((ARRAY['present'::character varying, 'absent'::character varying, 'late'::character varying, 'excused'::character varying])::text[])`),
]);

export const grades = pgTable("grades", {
	id: serial().primaryKey().notNull(),
	studentId: integer("student_id"),
	subjectId: integer("subject_id"),
	classId: integer("class_id"),
	gradeType: varchar("grade_type", { length: 50 }).notNull(),
	title: varchar({ length: 255 }).notNull(),
	score: numeric({ precision: 5, scale:  2 }),
	maxScore: numeric("max_score", { precision: 5, scale:  2 }).default('100'),
	weight: numeric({ precision: 5, scale:  2 }).default('1'),
	gradedBy: integer("graded_by"),
	gradedAt: timestamp("graded_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
	comments: text(),
}, (table) => [
	index("idx_grades_student").using("btree", table.studentId.asc().nullsLast().op("int4_ops")),
	index("idx_grades_subject").using("btree", table.subjectId.asc().nullsLast().op("int4_ops")),
	foreignKey({
			columns: [table.studentId],
			foreignColumns: [users.id],
			name: "grades_student_id_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.subjectId],
			foreignColumns: [subjects.id],
			name: "grades_subject_id_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.classId],
			foreignColumns: [classes.id],
			name: "grades_class_id_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.gradedBy],
			foreignColumns: [users.id],
			name: "grades_graded_by_fkey"
		}),
	check("grades_grade_type_check", sql`(grade_type)::text = ANY ((ARRAY['assignment'::character varying, 'quiz'::character varying, 'exam'::character varying, 'midterm'::character varying, 'final'::character varying, 'project'::character varying])::text[])`),
]);

export const announcements = pgTable("announcements", {
	id: serial().primaryKey().notNull(),
	title: varchar({ length: 255 }).notNull(),
	content: text().notNull(),
	authorId: integer("author_id"),
	targetAudience: varchar("target_audience", { length: 50 }).default('all'),
	priority: varchar({ length: 20 }).default('normal'),
	isPinned: boolean("is_pinned").default(false),
	expiresAt: timestamp("expires_at", { mode: 'string' }),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
	updatedAt: timestamp("updated_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
	foreignKey({
			columns: [table.authorId],
			foreignColumns: [users.id],
			name: "announcements_author_id_fkey"
		}),
	check("announcements_target_audience_check", sql`(target_audience)::text = ANY ((ARRAY['all'::character varying, 'students'::character varying, 'teachers'::character varying, 'admin'::character varying, 'parents'::character varying])::text[])`),
	check("announcements_priority_check", sql`(priority)::text = ANY ((ARRAY['low'::character varying, 'normal'::character varying, 'high'::character varying, 'urgent'::character varying])::text[])`),
]);

export const schedules = pgTable("schedules", {
	id: serial().primaryKey().notNull(),
	classId: integer("class_id"),
	subjectId: integer("subject_id"),
	teacherId: integer("teacher_id"),
	dayOfWeek: integer("day_of_week").notNull(),
	startTime: time("start_time").notNull(),
	endTime: time("end_time").notNull(),
	room: varchar({ length: 50 }),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
	index("idx_schedules_class").using("btree", table.classId.asc().nullsLast().op("int4_ops")),
	index("idx_schedules_teacher").using("btree", table.teacherId.asc().nullsLast().op("int4_ops")),
	foreignKey({
			columns: [table.classId],
			foreignColumns: [classes.id],
			name: "schedules_class_id_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.subjectId],
			foreignColumns: [subjects.id],
			name: "schedules_subject_id_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.teacherId],
			foreignColumns: [users.id],
			name: "schedules_teacher_id_fkey"
		}),
	check("schedules_day_of_week_check", sql`(day_of_week >= 0) AND (day_of_week <= 6)`),
]);

export const events = pgTable("events", {
	id: serial().primaryKey().notNull(),
	title: varchar({ length: 255 }).notNull(),
	description: text(),
	eventType: varchar("event_type", { length: 50 }).default('general'),
	startDate: timestamp("start_date", { mode: 'string' }).notNull(),
	endDate: timestamp("end_date", { mode: 'string' }),
	location: varchar({ length: 255 }),
	organizerId: integer("organizer_id"),
	isAllDay: boolean("is_all_day").default(false),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
	foreignKey({
			columns: [table.organizerId],
			foreignColumns: [users.id],
			name: "events_organizer_id_fkey"
		}),
]);
