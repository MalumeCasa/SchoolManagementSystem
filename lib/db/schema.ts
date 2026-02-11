import { pgTable, unique, serial, text, integer, timestamp, jsonb, index, check, foreignKey, varchar, numeric, date, time, boolean, pgView, bigint, pgEnum } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"

export const assignmentStatus = pgEnum("assignment_status", ['draft', 'published', 'closed', 'archived'])
export const userRole = pgEnum("user_role", ['super_admin', 'admin', 'principal', 'teacher', 'student', 'parent', 'accountant', 'moderator'])


export const teachers = pgTable("teachers", {
	id: serial().primaryKey().notNull(),
	name: text().notNull(),
	surname: text().notNull(),
	role: text().notNull(),
	email: text().notNull(),
	phone: text().notNull(),
	subjects: text().array().notNull(),
	experience: integer().notNull(),
	qualification: text().notNull(),
	staffId: integer("staff_id").notNull(),
	classRole: text("class_role"),
}, (table) => [
	unique("teachers_staff_id_unique").on(table.staffId),
]);

export const students = pgTable("students", {
	id: serial().primaryKey().notNull(),
	name: text().notNull(),
	surname: text().notNull(),
	phone: text(),
	address: text(),
	attendance: text(),
	class: text(),
	email: text(),
	idNumber: text("id_number"),
});

export const staffLeave = pgTable("staff_leave", {
	id: serial().primaryKey().notNull(),
	staffId: integer("staff_id").notNull(),
	leaveType: text("leave_type").notNull(),
	startDate: text("start_date").notNull(),
	endDate: text("end_date").notNull(),
	status: text().default('pending'),
	reason: text(),
	approvedBy: integer("approved_by"),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
});

export const staffSalary = pgTable("staff_salary", {
	id: serial().primaryKey().notNull(),
	staffId: integer("staff_id").notNull(),
	baseSalary: integer("base_salary").notNull(),
	allowances: jsonb().default({}),
	deductions: jsonb().default({}),
	effectiveDate: text("effective_date").notNull(),
	paymentFrequency: text("payment_frequency").default('monthly'),
});

export const subjects = pgTable("subjects", {
	id: serial().primaryKey().notNull(),
	name: text().notNull(),
	className: text("class_name").notNull(),
	teacher: text().notNull(),
	teacherIds: integer("teacher_ids").array().notNull(),
	teacherNames: text("teacher_names").array().notNull(),
	schedule: text().notNull(),
	duration: text().notNull(),
	topics: text().array().notNull(),
	assessments: jsonb().default([]).notNull(),
	classSection: text("class_section").default('primary').notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	index("idx_subjects_class_name_section").using("btree", table.className.asc().nullsLast().op("text_ops"), table.classSection.asc().nullsLast().op("text_ops")),
	index("idx_subjects_name").using("btree", table.name.asc().nullsLast().op("text_ops")),
	index("idx_subjects_teacher_names").using("gin", table.teacherNames.asc().nullsLast().op("array_ops")),
	index("idx_subjects_updated").using("btree", table.updatedAt.asc().nullsLast().op("timestamp_ops")),
	check("subjects_class_name_not_empty", sql`(class_name IS NOT NULL) AND (class_name <> ''::text)`),
	check("subjects_name_not_empty", sql`(name IS NOT NULL) AND (name <> ''::text)`),
	check("subjects_teacher_names_not_null", sql`teacher_names IS NOT NULL`),
]);

export const assignmentSubmissions = pgTable("assignment_submissions", {
	id: serial().primaryKey().notNull(),
	assignmentId: integer("assignment_id").notNull(),
	studentId: integer("student_id").notNull(),
	submittedAt: timestamp("submitted_at", { mode: 'string' }).defaultNow(),
	feedback: text(),
	status: varchar({ length: 20 }).default('submitted'),
	submissionText: text("submission_text"),
	submissionUrl: text("submission_url"),
	submissionFileName: text("submission_file_name"),
	marksObtained: integer("marks_obtained"),
	gradedBy: integer("graded_by"),
	gradedAt: timestamp("graded_at", { mode: 'string' }),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	index("idx_submissions_assignment").using("btree", table.assignmentId.asc().nullsLast().op("int4_ops")),
	index("idx_submissions_status").using("btree", table.status.asc().nullsLast().op("text_ops")),
	index("idx_submissions_student").using("btree", table.studentId.asc().nullsLast().op("int4_ops")),
	foreignKey({
			columns: [table.assignmentId],
			foreignColumns: [assignments.id],
			name: "assignment_submissions_assignment_id_assignments_id_fk"
		}),
	foreignKey({
			columns: [table.studentId],
			foreignColumns: [students.id],
			name: "assignment_submissions_student_id_students_id_fk"
		}),
	foreignKey({
			columns: [table.gradedBy],
			foreignColumns: [teachers.id],
			name: "assignment_submissions_graded_by_teachers_id_fk"
		}),
	unique("unique_assignment_submission").on(table.assignmentId, table.studentId),
]);

export const attendanceSummary = pgTable("attendance_summary", {
	id: serial().primaryKey().notNull(),
	studentId: integer("student_id").notNull(),
	classId: integer("class_id").notNull(),
	month: integer().notNull(),
	year: integer().notNull(),
	presentDays: integer().default(0),
	absentDays: integer().default(0),
	lateDays: integer().default(0),
	halfDays: integer().default(0),
	totalSchoolDays: integer().default(0),
}, (table) => [
	index("idx_attendance_summary_month").using("btree", table.month.asc().nullsLast().op("int4_ops"), table.year.asc().nullsLast().op("int4_ops")),
	index("idx_attendance_summary_student").using("btree", table.studentId.asc().nullsLast().op("int4_ops")),
	index("idx_attendance_summary_student_month").using("btree", table.studentId.asc().nullsLast().op("int4_ops"), table.month.asc().nullsLast().op("int4_ops"), table.year.asc().nullsLast().op("int4_ops")),
	foreignKey({
			columns: [table.studentId],
			foreignColumns: [students.id],
			name: "attendance_summary_student_id_students_id_fk"
		}),
	foreignKey({
			columns: [table.classId],
			foreignColumns: [classes.id],
			name: "attendance_summary_class_id_classes_id_fk"
		}),
	unique("unique_attendance_summary").on(table.studentId, table.month, table.year),
]);

export const chatRoomMembers = pgTable("chat_room_members", {
	id: serial().primaryKey().notNull(),
	roomId: integer("room_id").notNull(),
	userId: integer("user_id").notNull(),
	userType: varchar("user_type", { length: 20 }).notNull(),
	joinedAt: timestamp("joined_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	index("idx_chat_members_room").using("btree", table.roomId.asc().nullsLast().op("int4_ops")),
	index("idx_chat_members_user").using("btree", table.userId.asc().nullsLast().op("int4_ops"), table.userType.asc().nullsLast().op("int4_ops")),
	foreignKey({
			columns: [table.roomId],
			foreignColumns: [chatRooms.id],
			name: "chat_room_members_room_id_chat_rooms_id_fk"
		}),
	unique("unique_chat_member").on(table.roomId, table.userId, table.userType),
]);

export const events = pgTable("events", {
	id: serial().primaryKey().notNull(),
	title: text().notNull(),
	description: text(),
	startDate: timestamp("start_date", { mode: 'string' }).notNull(),
	endDate: timestamp("end_date", { mode: 'string' }).notNull(),
	eventType: varchar("event_type", { length: 50 }).notNull(),
	targetAudience: varchar("target_audience", { length: 20 }).default('all'),
	classId: integer("class_id"),
	createdBy: integer("created_by"),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	index("idx_events_date").using("btree", table.startDate.asc().nullsLast().op("timestamp_ops")),
	index("idx_events_type").using("btree", table.eventType.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.classId],
			foreignColumns: [classes.id],
			name: "events_class_id_classes_id_fk"
		}),
	foreignKey({
			columns: [table.createdBy],
			foreignColumns: [staff.id],
			name: "events_created_by_staff_id_fk"
		}),
]);

export const feePayments = pgTable("fee_payments", {
	id: serial().primaryKey().notNull(),
	studentFeeId: integer("student_fee_id").notNull(),
	amount: numeric({ precision: 10, scale:  2 }).notNull(),
	paymentDate: date("payment_date").notNull(),
	paymentMethod: varchar("payment_method", { length: 50 }).notNull(),
	referenceNumber: text("reference_number"),
	receivedBy: integer("received_by"),
	notes: text(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	index("idx_fee_payments_date").using("btree", table.paymentDate.asc().nullsLast().op("date_ops")),
	index("idx_fee_payments_reference").using("btree", table.referenceNumber.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.studentFeeId],
			foreignColumns: [studentFees.id],
			name: "fee_payments_student_fee_id_student_fees_id_fk"
		}),
	foreignKey({
			columns: [table.receivedBy],
			foreignColumns: [staff.id],
			name: "fee_payments_received_by_staff_id_fk"
		}),
]);

export const exams = pgTable("exams", {
	id: serial().primaryKey().notNull(),
	name: text().notNull(),
	classId: integer("class_id").notNull(),
	subjectId: integer("subject_id"),
	examDate: date("exam_date").notNull(),
	academicYear: varchar("academic_year", { length: 10 }).notNull(),
	term: integer().notNull(),
	weightage: integer().default(100),
	description: text(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	startTime: time("start_time"),
	endTime: time("end_time"),
	totalMarks: integer("total_marks").default(100),
	passingMarks: integer("passing_marks").default(40),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	index("idx_exams_class").using("btree", table.classId.asc().nullsLast().op("int4_ops")),
	index("idx_exams_date").using("btree", table.examDate.asc().nullsLast().op("date_ops")),
	foreignKey({
			columns: [table.classId],
			foreignColumns: [classes.id],
			name: "exams_class_id_classes_id_fk"
		}),
	foreignKey({
			columns: [table.subjectId],
			foreignColumns: [subjects.id],
			name: "exams_subject_id_subjects_id_fk"
		}),
	unique("unique_exam_class_subject").on(table.name, table.classId, table.subjectId, table.academicYear),
]);

export const chatRooms = pgTable("chat_rooms", {
	id: serial().primaryKey().notNull(),
	name: text(),
	type: varchar({ length: 20 }).default('direct').notNull(),
	classId: integer("class_id"),
	createdBy: integer("created_by"),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	index("idx_chat_rooms_class").using("btree", table.classId.asc().nullsLast().op("int4_ops")),
	index("idx_chat_rooms_type").using("btree", table.type.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.classId],
			foreignColumns: [classes.id],
			name: "chat_rooms_class_id_classes_id_fk"
		}),
	foreignKey({
			columns: [table.createdBy],
			foreignColumns: [staff.id],
			name: "chat_rooms_created_by_staff_id_fk"
		}),
]);

export const notices = pgTable("notices", {
	id: serial().primaryKey().notNull(),
	title: text().notNull(),
	content: text().notNull(),
	priority: varchar({ length: 20 }).default('normal'),
	targetAudience: varchar("target_audience", { length: 20 }).default('all'),
	startDate: date("start_date").notNull(),
	endDate: date("end_date"),
	isActive: boolean("is_active").default(true),
	createdBy: integer("created_by"),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	index("idx_notices_active").using("btree", table.isActive.asc().nullsLast().op("bool_ops")),
	index("idx_notices_date").using("btree", table.startDate.asc().nullsLast().op("date_ops")),
	index("idx_notices_priority").using("btree", table.priority.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.createdBy],
			foreignColumns: [staff.id],
			name: "notices_created_by_staff_id_fk"
		}),
]);

export const studentAttendance = pgTable("student_attendance", {
	id: serial().primaryKey().notNull(),
	studentId: integer("student_id").notNull(),
	classId: integer("class_id").notNull(),
	date: date().notNull(),
	status: varchar({ length: 20 }).default('present').notNull(),
	subjectId: integer("subject_id"),
	period: integer(),
	remarks: text(),
	recordedBy: integer("recorded_by"),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	index("idx_attendance_class_date").using("btree", table.classId.asc().nullsLast().op("date_ops"), table.date.asc().nullsLast().op("date_ops")),
	index("idx_attendance_student_date").using("btree", table.studentId.asc().nullsLast().op("int4_ops"), table.date.asc().nullsLast().op("date_ops")),
	index("idx_student_attendance_class").using("btree", table.classId.asc().nullsLast().op("int4_ops")),
	index("idx_student_attendance_date").using("btree", table.date.asc().nullsLast().op("date_ops")),
	index("idx_student_attendance_student").using("btree", table.studentId.asc().nullsLast().op("int4_ops")),
	foreignKey({
			columns: [table.studentId],
			foreignColumns: [students.id],
			name: "student_attendance_student_id_students_id_fk"
		}),
	foreignKey({
			columns: [table.classId],
			foreignColumns: [classes.id],
			name: "student_attendance_class_id_classes_id_fk"
		}),
	foreignKey({
			columns: [table.subjectId],
			foreignColumns: [subjects.id],
			name: "student_attendance_subject_id_subjects_id_fk"
		}),
	foreignKey({
			columns: [table.recordedBy],
			foreignColumns: [staff.id],
			name: "student_attendance_recorded_by_staff_id_fk"
		}),
	unique("unique_student_attendance").on(table.studentId, table.date, table.subjectId),
	check("attendance_status_check", sql`(status)::text = ANY ((ARRAY['present'::character varying, 'absent'::character varying, 'late'::character varying, 'half-day'::character varying])::text[])`),
]);

export const subjectTeachers = pgTable("subject_teachers", {
	id: serial().primaryKey().notNull(),
	subjectId: integer("subject_id").notNull(),
	teacherId: integer("teacher_id").notNull(),
	teacherName: text("teacher_name").notNull(),
	isPrimary: boolean("is_primary").default(false),
});

export const feeStructure = pgTable("fee_structure", {
	id: serial().primaryKey().notNull(),
	name: text().notNull(),
	classId: integer("class_id"),
	amount: numeric({ precision: 10, scale:  2 }).notNull(),
	frequency: varchar({ length: 20 }).default('monthly'),
	dueDate: integer("due_date"),
	isActive: boolean("is_active").default(true),
	description: text(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	index("idx_fee_structure_active").using("btree", table.isActive.asc().nullsLast().op("bool_ops")),
	index("idx_fee_structure_class").using("btree", table.classId.asc().nullsLast().op("int4_ops")),
	foreignKey({
			columns: [table.classId],
			foreignColumns: [classes.id],
			name: "fee_structure_class_id_classes_id_fk"
		}),
]);

export const grades = pgTable("grades", {
	id: serial().primaryKey().notNull(),
	studentId: integer("student_id").notNull(),
	examId: integer("exam_id").notNull(),
	marksObtained: numeric("marks_obtained", { precision: 6, scale:  2 }).notNull(),
	grade: varchar({ length: 5 }),
	comments: text(),
	recordedBy: integer("recorded_by"),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	index("idx_grades_exam").using("btree", table.examId.asc().nullsLast().op("int4_ops")),
	index("idx_grades_student").using("btree", table.studentId.asc().nullsLast().op("int4_ops")),
	foreignKey({
			columns: [table.studentId],
			foreignColumns: [students.id],
			name: "grades_student_id_students_id_fk"
		}),
	foreignKey({
			columns: [table.examId],
			foreignColumns: [exams.id],
			name: "grades_exam_id_exams_id_fk"
		}),
	foreignKey({
			columns: [table.recordedBy],
			foreignColumns: [staff.id],
			name: "grades_recorded_by_staff_id_fk"
		}),
	unique("unique_student_exam").on(table.studentId, table.examId),
]);

export const chatMessages = pgTable("chat_messages", {
	id: serial().primaryKey().notNull(),
	roomId: integer("room_id").notNull(),
	senderId: integer("sender_id").notNull(),
	senderType: varchar("sender_type", { length: 20 }).notNull(),
	message: text().notNull(),
	messageType: varchar("message_type", { length: 20 }).default('text'),
	attachments: text().array(),
	readBy: jsonb("read_by").default([]),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	index("idx_chat_messages_created").using("btree", table.createdAt.asc().nullsLast().op("timestamp_ops")),
	index("idx_chat_messages_room").using("btree", table.roomId.asc().nullsLast().op("int4_ops")),
	foreignKey({
			columns: [table.roomId],
			foreignColumns: [chatRooms.id],
			name: "chat_messages_room_id_chat_rooms_id_fk"
		}),
]);

export const studentFees = pgTable("student_fees", {
	id: serial().primaryKey().notNull(),
	studentId: integer("student_id").notNull(),
	feeStructureId: integer("fee_structure_id").notNull(),
	academicYear: varchar("academic_year", { length: 10 }).notNull(),
	term: integer(),
	amountDue: numeric("amount_due", { precision: 10, scale:  2 }).notNull(),
	amountPaid: numeric("amount_paid", { precision: 10, scale:  2 }).default('0'),
	dueDate: date("due_date").notNull(),
	status: varchar({ length: 20 }).default('pending'),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	index("idx_student_fees_due_date").using("btree", table.dueDate.asc().nullsLast().op("date_ops")),
	index("idx_student_fees_status").using("btree", table.status.asc().nullsLast().op("text_ops")),
	index("idx_student_fees_student").using("btree", table.studentId.asc().nullsLast().op("int4_ops")),
	foreignKey({
			columns: [table.studentId],
			foreignColumns: [students.id],
			name: "student_fees_student_id_students_id_fk"
		}),
	foreignKey({
			columns: [table.feeStructureId],
			foreignColumns: [feeStructure.id],
			name: "student_fees_fee_structure_id_fee_structure_id_fk"
		}),
]);

export const classActivities = pgTable("class_activities", {
	id: serial().primaryKey().notNull(),
	title: text().notNull(),
	date: text().notNull(),
	className: text("class_name"),
});

export const classes = pgTable("classes", {
	id: serial().primaryKey().notNull(),
	className: text("class_name").notNull(),
	teachers: text().array().notNull(),
	subjects: text().array().notNull(),
	classSection: text("class_section").notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	classTeacher: text("class_teacher"),
}, (table) => [
	index("idx_classes_name_section").using("btree", table.className.asc().nullsLast().op("text_ops"), table.classSection.asc().nullsLast().op("text_ops")),
	index("idx_classes_section").using("btree", table.classSection.asc().nullsLast().op("text_ops")),
	index("idx_classes_updated").using("btree", table.updatedAt.asc().nullsLast().op("timestamp_ops")),
	unique("unique_class_name_section").on(table.className, table.classSection),
	check("classes_class_name_not_empty", sql`(class_name IS NOT NULL) AND (class_name <> ''::text)`),
	check("classes_teachers_not_null", sql`teachers IS NOT NULL`),
	check("classes_subjects_not_null", sql`subjects IS NOT NULL`),
]);

export const staff = pgTable("staff", {
	id: serial().primaryKey().notNull(),
	staffId: varchar("staff_id", { length: 20 }).notNull(),
	name: text().notNull(),
	surname: text().notNull(),
	email: text().notNull(),
	phone: text().notNull(),
	address: text(),
	dateOfBirth: text("date_of_birth"),
	gender: text(),
	emergencyContact: text("emergency_contact"),
	emergencyPhone: text("emergency_phone"),
	employmentType: text("employment_type").notNull(),
	position: text().notNull(),
	department: text().notNull(),
	hireDate: text("hire_date").notNull(),
	terminationDate: text("termination_date"),
	employmentStatus: text("employment_status").default('active'),
	qualification: text().notNull(),
	specialization: text(),
	experience: integer().default(0).notNull(),
	certifications: text().array(),
	subjects: text().array(),
	role: text().notNull(),
	permissions: jsonb(),
	accessLevel: integer("access_level").default(1),
	isActive: boolean("is_active").default(true),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	unique("staff_staff_id_unique").on(table.staffId),
	unique("staff_email_unique").on(table.email),
]);

export const parents = pgTable("parents", {
	id: serial().primaryKey().notNull(),
	title: text(),
	name: text().notNull(),
	surname: text().notNull(),
	idNumber: text("id_number"),
	dateOfBirth: text("date_of_birth"),
	gender: text(),
	email: text(),
	phone: text().notNull(),
	alternatePhone: text("alternate_phone"),
	homeAddress: text("home_address"),
	postalAddress: text("postal_address"),
	workAddress: text("work_address"),
	occupation: text(),
	employer: text(),
	workPhone: text("work_phone"),
	relationshipToStudent: text("relationship_to_student").notNull(),
	isPrimaryContact: boolean("is_primary_contact").default(false),
	emergencyContact: boolean("emergency_contact").default(false),
	authorizedToPickup: boolean("authorized_to_pickup").default(true),
	responsibleForFees: boolean("responsible_for_fees").default(false),
	feePaymentMethod: text("fee_payment_method"),
	bankAccountDetails: jsonb("bank_account_details"),
	medicalConsent: boolean("medical_consent").default(false),
	status: text().default('active'),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	index("idx_parents_email").using("btree", table.email.asc().nullsLast().op("text_ops")),
	index("idx_parents_phone").using("btree", table.phone.asc().nullsLast().op("text_ops")),
	index("idx_parents_status").using("btree", table.status.asc().nullsLast().op("text_ops")),
	index("idx_parents_surname").using("btree", table.surname.asc().nullsLast().op("text_ops")),
	unique("parents_id_number_unique").on(table.idNumber),
	check("parents_name_not_empty", sql`(name IS NOT NULL) AND (name <> ''::text)`),
	check("parents_surname_not_empty", sql`(surname IS NOT NULL) AND (surname <> ''::text)`),
]);

export const parentStudentRelations = pgTable("parent_student_relations", {
	id: serial().primaryKey().notNull(),
	parentId: integer("parent_id").notNull(),
	studentId: integer("student_id").notNull(),
	relationship: text().notNull(),
	isPrimaryContact: boolean("is_primary_contact").default(false),
	emergencyContact: boolean("emergency_contact").default(false),
	authorizedToPickup: boolean("authorized_to_pickup").default(true),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	index("idx_parent_student_parent").using("btree", table.parentId.asc().nullsLast().op("int4_ops")),
	index("idx_parent_student_student").using("btree", table.studentId.asc().nullsLast().op("int4_ops")),
	unique("unique_parent_student_relation").on(table.parentId, table.studentId),
]);

export const staffAttendance = pgTable("staff_attendance", {
	id: serial().primaryKey().notNull(),
	staffId: integer("staff_id").notNull(),
	date: text().notNull(),
	status: text().notNull(),
	checkIn: text("check_in"),
	checkOut: text("check_out"),
	notes: text(),
});

export const feeCategories = pgTable("fee_categories", {
	id: serial().primaryKey().notNull(),
	name: text().notNull(),
	description: text(),
	isActive: boolean("is_active").default(true),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
});

export const gradeSystem = pgTable("grade_system", {
	id: serial().primaryKey().notNull(),
	name: text().notNull(),
	minMarks: numeric("min_marks", { precision: 5, scale:  2 }).notNull(),
	maxMarks: numeric("max_marks", { precision: 5, scale:  2 }).notNull(),
	grade: varchar({ length: 5 }).notNull(),
	points: numeric({ precision: 3, scale:  2 }),
	description: text(),
	isActive: boolean("is_active").default(true),
}, (table) => [
	unique("unique_grade_range").on(table.minMarks, table.maxMarks),
]);

export const classPeriods = pgTable("class_periods", {
	id: serial().primaryKey().notNull(),
	classId: integer("class_id").notNull(),
	periodNumber: integer("period_number").notNull(),
	startTime: time("start_time").notNull(),
	endTime: time("end_time").notNull(),
	subjectId: integer("subject_id"),
	dayOfWeek: integer("day_of_week").notNull(),
	isActive: boolean("is_active").default(true),
}, (table) => [
	index("idx_class_periods_class").using("btree", table.classId.asc().nullsLast().op("int4_ops")),
	foreignKey({
			columns: [table.classId],
			foreignColumns: [classes.id],
			name: "class_periods_class_id_classes_id_fk"
		}),
	foreignKey({
			columns: [table.subjectId],
			foreignColumns: [subjects.id],
			name: "class_periods_subject_id_subjects_id_fk"
		}),
	unique("unique_class_period").on(table.classId, table.periodNumber, table.dayOfWeek),
]);

export const feeDiscounts = pgTable("fee_discounts", {
	id: serial().primaryKey().notNull(),
	studentId: integer("student_id").notNull(),
	feeStructureId: integer("fee_structure_id"),
	discountType: varchar("discount_type", { length: 50 }).notNull(),
	discountAmount: numeric("discount_amount", { precision: 10, scale:  2 }),
	discountPercentage: numeric("discount_percentage", { precision: 5, scale:  2 }),
	reason: text(),
	startDate: date("start_date").notNull(),
	endDate: date("end_date"),
	isActive: boolean("is_active").default(true),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	index("idx_fee_discounts_active").using("btree", table.isActive.asc().nullsLast().op("bool_ops")),
	index("idx_fee_discounts_student").using("btree", table.studentId.asc().nullsLast().op("int4_ops")),
	foreignKey({
			columns: [table.studentId],
			foreignColumns: [students.id],
			name: "fee_discounts_student_id_students_id_fk"
		}),
	foreignKey({
			columns: [table.feeStructureId],
			foreignColumns: [feeStructure.id],
			name: "fee_discounts_fee_structure_id_fee_structure_id_fk"
		}),
]);

export const schoolCalendar = pgTable("school_calendar", {
	id: serial().primaryKey().notNull(),
	date: date().notNull(),
	dayType: varchar("day_type", { length: 20 }).default('school_day').notNull(),
	description: text(),
	academicYear: varchar("academic_year", { length: 10 }).notNull(),
	term: integer().notNull(),
}, (table) => [
	index("idx_school_calendar_date").using("btree", table.date.asc().nullsLast().op("date_ops")),
	unique("unique_calendar_date").on(table.date, table.academicYear),
]);

export const termConfig = pgTable("term_config", {
	id: serial().primaryKey().notNull(),
	academicYear: varchar("academic_year", { length: 10 }).notNull(),
	term: integer().notNull(),
	startDate: date("start_date").notNull(),
	endDate: date("end_date").notNull(),
	isCurrent: boolean("is_current").default(false),
}, (table) => [
	unique("unique_term_config").on(table.academicYear, table.term),
]);

export const notifications = pgTable("notifications", {
	id: serial().primaryKey().notNull(),
	userId: integer("user_id").notNull(),
	title: text().notNull(),
	message: text().notNull(),
	type: varchar({ length: 50 }).notNull(),
	relatedId: integer("related_id"),
	relatedType: varchar("related_type", { length: 50 }),
	isRead: boolean("is_read").default(false),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	index("idx_notifications_read").using("btree", table.isRead.asc().nullsLast().op("bool_ops")),
	index("idx_notifications_user").using("btree", table.userId.asc().nullsLast().op("int4_ops")),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "notifications_user_id_users_id_fk"
		}),
]);

export const userSessions = pgTable("user_sessions", {
	id: serial().primaryKey().notNull(),
	userId: integer("user_id").notNull(),
	token: text().notNull(),
	expiresAt: timestamp("expires_at", { mode: 'string' }).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	index("idx_user_sessions_token").using("btree", table.token.asc().nullsLast().op("text_ops")),
	index("idx_user_sessions_user").using("btree", table.userId.asc().nullsLast().op("int4_ops")),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "user_sessions_user_id_users_id_fk"
		}),
]);

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

export const curriculum = pgTable("curriculum", {
	id: serial().primaryKey().notNull(),
	classId: integer("class_id").notNull(),
	subjectId: integer("subject_id").notNull(),
	title: varchar({ length: 255 }).notNull(),
	description: text(),
	academicYear: varchar("academic_year", { length: 10 }).notNull(),
	status: varchar({ length: 20 }).default('draft'),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
	totalTopics: integer("total_topics").default(0),
	totalDuration: integer("total_duration").default(0),
}, (table) => [
	index("idx_curriculum_class_subject").using("btree", table.classId.asc().nullsLast().op("int4_ops"), table.subjectId.asc().nullsLast().op("int4_ops")),
	foreignKey({
			columns: [table.classId],
			foreignColumns: [classes.id],
			name: "curriculum_class_id_classes_id_fk"
		}),
	foreignKey({
			columns: [table.subjectId],
			foreignColumns: [subjects.id],
			name: "curriculum_subject_id_subjects_id_fk"
		}),
	unique("unique_curriculum_class_subject_year").on(table.classId, table.subjectId, table.academicYear),
]);

export const examResults = pgTable("exam_results", {
	id: serial().primaryKey().notNull(),
	examId: integer("exam_id").notNull(),
	studentId: integer("student_id").notNull(),
	marksObtained: numeric("marks_obtained", { precision: 6, scale:  2 }),
	grade: varchar({ length: 10 }),
	status: varchar({ length: 50 }).default('pending'),
	comments: text(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	index("idx_exam_results_exam").using("btree", table.examId.asc().nullsLast().op("int4_ops")),
	index("idx_exam_results_student").using("btree", table.studentId.asc().nullsLast().op("int4_ops")),
	foreignKey({
			columns: [table.examId],
			foreignColumns: [exams.id],
			name: "exam_results_exam_id_exams_id_fk"
		}),
	foreignKey({
			columns: [table.studentId],
			foreignColumns: [students.id],
			name: "exam_results_student_id_students_id_fk"
		}),
	unique("unique_exam_result").on(table.examId, table.studentId),
]);

export const subjectClasses = pgTable("subject_classes", {
	id: serial().primaryKey().notNull(),
	subjectId: integer("subject_id").notNull(),
	classId: integer("class_id").notNull(),
}, (table) => [
	index("idx_subject_classes_class").using("btree", table.classId.asc().nullsLast().op("int4_ops")),
	index("idx_subject_classes_subject").using("btree", table.subjectId.asc().nullsLast().op("int4_ops")),
	foreignKey({
			columns: [table.subjectId],
			foreignColumns: [subjects.id],
			name: "subject_classes_subject_id_subjects_id_fk"
		}),
	foreignKey({
			columns: [table.classId],
			foreignColumns: [classes.id],
			name: "subject_classes_class_id_classes_id_fk"
		}),
	unique("unique_subject_class").on(table.subjectId, table.classId),
]);

export const teacherClasses = pgTable("teacher_classes", {
	id: serial().primaryKey().notNull(),
	teacherId: integer("teacher_id").notNull(),
	classId: integer("class_id").notNull(),
	isPrimary: boolean("is_primary").default(false),
	subjects: text().array(),
}, (table) => [
	index("idx_teacher_classes_class").using("btree", table.classId.asc().nullsLast().op("int4_ops")),
	index("idx_teacher_classes_teacher").using("btree", table.teacherId.asc().nullsLast().op("int4_ops")),
	foreignKey({
			columns: [table.teacherId],
			foreignColumns: [teachers.id],
			name: "teacher_classes_teacher_id_teachers_id_fk"
		}),
	foreignKey({
			columns: [table.classId],
			foreignColumns: [classes.id],
			name: "teacher_classes_class_id_classes_id_fk"
		}),
	unique("unique_teacher_class").on(table.teacherId, table.classId),
]);

export const assignments = pgTable("assignments", {
	id: serial().primaryKey().notNull(),
	title: text().notNull(),
	description: text(),
	classId: integer("class_id").notNull(),
	subjectId: integer("subject_id").notNull(),
	dueDate: date("due_date").notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	instructions: text(),
	teacherId: integer("teacher_id").notNull(),
	assignedDate: date("assigned_date").notNull(),
	totalMarks: integer("total_marks").default(100),
	passingMarks: integer("passing_marks").default(40),
	attachmentUrl: text("attachment_url"),
	attachmentName: text("attachment_name"),
	status: varchar({ length: 20 }).default('published'),
	isPublished: boolean("is_published").default(true),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	index("idx_assignments_class").using("btree", table.classId.asc().nullsLast().op("int4_ops")),
	index("idx_assignments_due_date").using("btree", table.dueDate.asc().nullsLast().op("date_ops")),
	index("idx_assignments_status").using("btree", table.status.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.classId],
			foreignColumns: [classes.id],
			name: "assignments_class_id_classes_id_fk"
		}),
	foreignKey({
			columns: [table.subjectId],
			foreignColumns: [subjects.id],
			name: "assignments_subject_id_subjects_id_fk"
		}),
	foreignKey({
			columns: [table.teacherId],
			foreignColumns: [teachers.id],
			name: "assignments_teacher_id_teachers_id_fk"
		}),
]);

export const registeredStudents = pgTable("registered_students", {
	id: serial().primaryKey().notNull(),
	surname: text().notNull(),
	name: text().notNull(),
	preferredName: text(),
	dateOfBirth: text("date_of_birth").notNull(),
	idNumber: text("id_number"),
	sex: text(),
	religion: text(),
	numberOfChildrenInFamily: integer("number_of_children_in_family"),
	positionInFamily: integer("position_in_family"),
	authorizedToBring: text("authorized_to_bring").array(),
	authorizedToCollect: text("authorized_to_collect").array(),
	previousSchool: text("previous_school"),
	intendedPrimarySchool: text("intended_primary_school"),
	careRequired: text("care_required"),
	dateOfEnrolment: text("date_of_enrolment").notNull(),
	ageAtEnrolment: integer("age_at_enrolment"),
	emergencyContactFriendName: text("emergency_contact_friend_name"),
	emergencyContactFriendRelationship: text("emergency_contact_friend_relationship"),
	emergencyContactFriendAddress: text("emergency_contact_friend_address"),
	emergencyContactFriendWorkPhone: text("emergency_contact_friend_work_phone"),
	emergencyContactFriendHomePhone: text("emergency_contact_friend_home_phone"),
	emergencyContactFriendCell: text("emergency_contact_friend_cell"),
	emergencyContactKinName: text("emergency_contact_kin_name"),
	emergencyContactKinRelationship: text("emergency_contact_kin_relationship"),
	emergencyContactKinAddress: text("emergency_contact_kin_address"),
	emergencyContactKinWorkPhone: text("emergency_contact_kin_work_phone"),
	emergencyContactKinHomePhone: text("emergency_contact_kin_home_phone"),
	emergencyContactKinCell: text("emergency_contact_kin_cell"),
	transportContact1Name: text("transport_contact_1_name"),
	transportContact1Phone: text("transport_contact_1_phone"),
	transportContact2Name: text("transport_contact_2_name"),
	transportContact2Phone: text("transport_contact_2_phone"),
	transportContact3Name: text("transport_contact_3_name"),
	transportContact3Phone: text("transport_contact_3_phone"),
	specialInstructions: text("special_instructions"),
	medicalConsent1: text("medical_consent_1"),
	medicalConsent1Father: boolean("medical_consent_1_father").default(false),
	medicalConsent1Mother: boolean("medical_consent_1_mother").default(false),
	medicalConsent1Guardian: boolean("medical_consent_1_guardian").default(false),
	medicalConsent2: text("medical_consent_2"),
	medicalConsent2Father: boolean("medical_consent_2_father").default(false),
	medicalConsent2Mother: boolean("medical_consent_2_mother").default(false),
	medicalConsent2Guardian: boolean("medical_consent_2_guardian").default(false),
	maritalStatus: text("marital_status"),
	motherTitle: text("mother_title"),
	motherSurname: text("mother_surname"),
	motherFirstNames: text("mother_first_names"),
	motherIdNumber: text("mother_id_number"),
	motherOccupation: text("mother_occupation"),
	motherEmployer: text("mother_employer"),
	motherWorkPhone: text("mother_work_phone"),
	motherHomePhone: text("mother_home_phone"),
	motherCell: text("mother_cell"),
	motherEmail: text("mother_email"),
	motherHomeAddress: text("mother_home_address"),
	motherWorkAddress: text("mother_work_address"),
	fatherTitle: text("father_title"),
	fatherSurname: text("father_surname"),
	fatherFirstNames: text("father_first_names"),
	fatherIdNumber: text("father_id_number"),
	fatherOccupation: text("father_occupation"),
	fatherEmployer: text("father_employer"),
	fatherWorkPhone: text("father_work_phone"),
	fatherHomePhone: text("father_home_phone"),
	fatherCell: text("father_cell"),
	fatherEmail: text("father_email"),
	fatherHomeAddress: text("father_home_address"),
	fatherWorkAddress: text("father_work_address"),
	guardianTitle: text("guardian_title"),
	guardianSurname: text("guardian_surname"),
	guardianFirstNames: text("guardian_first_names"),
	guardianIdNumber: text("guardian_id_number"),
	guardianOccupation: text("guardian_occupation"),
	guardianEmployer: text("guardian_employer"),
	guardianWorkPhone: text("guardian_work_phone"),
	guardianHomePhone: text("guardian_home_phone"),
	guardianCell: text("guardian_cell"),
	guardianEmail: text("guardian_email"),
	guardianHomeAddress: text("guardian_home_address"),
	guardianWorkAddress: text("guardian_work_address"),
	financialAgreedTerms: boolean("financial_agreed_terms"),
	financialAgreedLiability: boolean("financial_agreed_liability"),
	financialAgreedCancellation: boolean("financial_agreed_cancellation"),
	motherFinancialSignature: text("mother_financial_signature"),
	motherFinancialDate: text("mother_financial_date"),
	fatherFinancialSignature: text("father_financial_signature"),
	fatherFinancialDate: text("father_financial_date"),
	monthlyAmount: integer("monthly_amount"),
	popiConsent: boolean("popi_consent").default(false),
	motherPopiSignature: text("mother_popi_signature"),
	motherPopiDate: text("mother_popi_date"),
	fatherPopiSignature: text("father_popi_signature"),
	fatherPopiDate: text("father_popi_date"),
	status: text().default('pending'),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
	address: text(),
	email: text(),
	phone: text(),
	familyDoctor: text("family_doctor"),
	doctorPhone: text("doctor_phone"),
	medicalConditions: text("medical_conditions").array(),
	medicalConditionsDetails: text("medical_conditions_details"),
	childhoodSicknesses: text("childhood_sicknesses"),
	lifeThreateningAllergies: text("life_threatening_allergies"),
	otherAllergies: text("other_allergies"),
	regularMedicationsDetails: text("regular_medications_details"),
	majorOperations: text("major_operations"),
	behaviorProblems: text("behavior_problems"),
	speechHearingProblems: text("speech_hearing_problems"),
	birthComplications: text("birth_complications"),
	immunisationUpToDate: boolean("immunisation_up_to_date"),
	familyMedicalHistory: text("family_medical_history"),
	regularMedications: boolean("regular_medications"),
	livesWith: text("lives_with").array(),
	homeLanguage: text("home_language").array(),
	signatory1FullName: text("signatory1_full_name"),
	signatory1IdNumber: text("signatory1_id_number"),
	signatory1Relation: text("signatory1_relation"),
	signatory1CellNumber: text("signatory1_cell_number"),
	signatory1Email: text("signatory1_email"),
	signatory1PhysicalAddress: text("signatory1_physical_address"),
	signatory1Signature: text("signatory1_signature"),
	signatory1DateSigned: text("signatory1_date_signed"),
	signatory2FullName: text("signatory2_full_name"),
	signatory2IdNumber: text("signatory2_id_number"),
	signatory2Relation: text("signatory2_relation"),
	signatory2CellNumber: text("signatory2_cell_number"),
	signatory2Email: text("signatory2_email"),
	signatory2PhysicalAddress: text("signatory2_physical_address"),
	signatory2Signature: text("signatory2_signature"),
	signatory2DateSigned: text("signatory2_date_signed"),
	signedAt: text("signed_at"),
	agreementDate: text("agreement_date"),
	witnessName: text("witness_name"),
	witnessSignature: text("witness_signature"),
	indemnityAgreement: boolean("indemnity_agreement").default(false),
	paymentDate: integer("payment_date"),
	studentId: text("student_id"),
}, (table) => [
	index("idx_registered_students_created").using("btree", table.createdAt.asc().nullsLast().op("timestamp_ops")),
	index("idx_registered_students_status").using("btree", table.status.asc().nullsLast().op("text_ops")),
	index("idx_registered_students_surname").using("btree", table.surname.asc().nullsLast().op("text_ops")),
	check("registered_students_surname_not_empty", sql`(surname IS NOT NULL) AND (surname <> ''::text)`),
]);

export const curriculumProgress = pgTable("curriculum_progress", {
	id: serial().primaryKey().notNull(),
	curriculumId: integer("curriculum_id").notNull(),
	classId: integer("class_id").notNull(),
	completedTopics: jsonb("completed_topics"),
	progressPercentage: integer("progress_percentage").default(0),
	lastUpdated: timestamp("last_updated", { mode: 'string' }).defaultNow(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	index("idx_curriculum_progress_class").using("btree", table.classId.asc().nullsLast().op("int4_ops")),
	index("idx_curriculum_progress_curriculum").using("btree", table.curriculumId.asc().nullsLast().op("int4_ops")),
	foreignKey({
			columns: [table.curriculumId],
			foreignColumns: [curriculum.id],
			name: "curriculum_progress_curriculum_id_curriculum_id_fk"
		}),
	foreignKey({
			columns: [table.classId],
			foreignColumns: [classes.id],
			name: "curriculum_progress_class_id_classes_id_fk"
		}),
	unique("unique_curriculum_progress").on(table.curriculumId, table.classId),
]);

export const studentMedicalInfo = pgTable("student_medical_info", {
	id: integer().primaryKey().notNull(),
	idNumber: text("id_number").notNull(),
	familyDoctor: text("family_doctor"),
	doctorPhone: text("doctor_phone"),
	medicalConditions: text("medical_conditions").array(),
	medicalConditionsDetails: text("medical_conditions_details"),
	childhoodSicknesses: text("childhood_sicknesses"),
	lifeThreateningAllergies: text("life_threatening_allergies"),
	otherAllergies: text("other_allergies"),
	regularMedications: boolean("regular_medications"),
	regularMedicationsDetails: text("regular_medications_details"),
	majorOperations: text("major_operations"),
	behaviorProblems: text("behavior_problems"),
	speechHearingProblems: text("speech_hearing_problems"),
	birthComplications: text("birth_complications"),
	immunisationUpToDate: boolean("immunisation_up_to_date"),
	familyMedicalHistory: text("family_medical_history"),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	index("idx_student_medical_id").using("btree", table.id.asc().nullsLast().op("int4_ops")),
	index("idx_student_medical_id_number").using("btree", table.idNumber.asc().nullsLast().op("text_ops")),
	check("student_medical_id_required", sql`id IS NOT NULL`),
]);

export const reportCardComments = pgTable("report_card_comments", {
	id: serial().primaryKey().notNull(),
	category: text().notNull(),
	commentText: text("comment_text").notNull(),
	minPercentage: numeric("min_percentage", { precision: 5, scale:  2 }),
	maxPercentage: numeric("max_percentage", { precision: 5, scale:  2 }),
	isPositive: boolean("is_positive").default(true),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
});

export const reportCardSubjects = pgTable("report_card_subjects", {
	id: serial().primaryKey().notNull(),
	reportCardId: integer("report_card_id").notNull(),
	subjectId: integer("subject_id").notNull(),
	marksObtained: numeric("marks_obtained", { precision: 6, scale:  2 }),
	maxMarks: numeric("max_marks", { precision: 6, scale:  2 }),
	percentage: numeric({ precision: 5, scale:  2 }),
	grade: text(),
	gradePoint: numeric("grade_point", { precision: 3, scale:  1 }),
	teacherComments: text("teacher_comments"),
	practicalMarks: numeric("practical_marks", { precision: 6, scale:  2 }),
	theoryMarks: numeric("theory_marks", { precision: 6, scale:  2 }),
	assignmentMarks: numeric("assignment_marks", { precision: 6, scale:  2 }),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	index("idx_report_card_subjects_report_card").using("btree", table.reportCardId.asc().nullsLast().op("int4_ops")),
	foreignKey({
			columns: [table.reportCardId],
			foreignColumns: [reportCards.id],
			name: "report_card_subjects_report_card_id_report_cards_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.subjectId],
			foreignColumns: [subjects.id],
			name: "report_card_subjects_subject_id_subjects_id_fk"
		}),
	unique("unique_report_card_subject").on(table.reportCardId, table.subjectId),
]);

export const reportCards = pgTable("report_cards", {
	id: serial().primaryKey().notNull(),
	studentId: integer("student_id").notNull(),
	academicYearId: integer("academic_year_id").notNull(),
	termId: integer("term_id").notNull(),
	classId: integer("class_id").notNull(),
	overallGrade: text("overall_grade"),
	totalPercentage: numeric("total_percentage", { precision: 5, scale:  2 }),
	positionInClass: integer("position_in_class"),
	totalMarksObtained: numeric("total_marks_obtained", { precision: 10, scale:  2 }),
	totalMaxMarks: numeric("total_max_marks", { precision: 10, scale:  2 }),
	attendancePercentage: numeric("attendance_percentage", { precision: 5, scale:  2 }),
	teacherComments: text("teacher_comments"),
	principalComments: text("principal_comments"),
	isPublished: boolean("is_published").default(false),
	publishedAt: timestamp("published_at", { mode: 'string' }),
	generatedBy: integer("generated_by"),
	generatedAt: timestamp("generated_at", { mode: 'string' }).defaultNow(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	index("idx_report_cards_academic_year").using("btree", table.academicYearId.asc().nullsLast().op("int4_ops"), table.termId.asc().nullsLast().op("int4_ops")),
	index("idx_report_cards_student").using("btree", table.studentId.asc().nullsLast().op("int4_ops")),
	foreignKey({
			columns: [table.academicYearId],
			foreignColumns: [academicYears.id],
			name: "report_cards_academic_year_id_academic_years_id_fk"
		}),
	foreignKey({
			columns: [table.termId],
			foreignColumns: [academicTerms.id],
			name: "report_cards_term_id_academic_terms_id_fk"
		}),
	foreignKey({
			columns: [table.classId],
			foreignColumns: [classes.id],
			name: "report_cards_class_id_classes_id_fk"
		}),
	foreignKey({
			columns: [table.generatedBy],
			foreignColumns: [staff.id],
			name: "report_cards_generated_by_staff_id_fk"
		}),
	foreignKey({
			columns: [table.studentId],
			foreignColumns: [students.id],
			name: "report_cards_student_id_students_id_fk"
		}).onDelete("cascade"),
	unique("unique_report_card").on(table.studentId, table.academicYearId, table.termId, table.classId),
]);

export const academicYears = pgTable("academic_years", {
	id: serial().primaryKey().notNull(),
	name: text().notNull(),
	startDate: date("start_date").notNull(),
	endDate: date("end_date").notNull(),
	isCurrent: boolean("is_current").default(false),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	unique("unique_academic_year_name").on(table.name),
]);

export const academicTerms = pgTable("academic_terms", {
	id: serial().primaryKey().notNull(),
	academicYearId: integer("academic_year_id").notNull(),
	name: text().notNull(),
	order: integer().notNull(),
	startDate: date("start_date").notNull(),
	endDate: date("end_date").notNull(),
	isCurrent: boolean("is_current").default(false),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	index("idx_academic_terms_year").using("btree", table.academicYearId.asc().nullsLast().op("int4_ops")),
	foreignKey({
			columns: [table.academicYearId],
			foreignColumns: [academicYears.id],
			name: "academic_terms_academic_year_id_academic_years_id_fk"
		}),
	unique("unique_term_name_year").on(table.academicYearId, table.name),
]);

export const curriculumChapters = pgTable("curriculum_chapters", {
	id: serial().primaryKey().notNull(),
	curriculumId: integer("curriculum_id").notNull(),
	chapterNumber: integer("chapter_number").notNull(),
	title: varchar({ length: 255 }).notNull(),
	description: text(),
	order: integer().notNull(),
	duration: integer().default(0),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	index("idx_chapters_curriculum").using("btree", table.curriculumId.asc().nullsLast().op("int4_ops")),
	index("idx_chapters_order").using("btree", table.curriculumId.asc().nullsLast().op("int4_ops"), table.order.asc().nullsLast().op("int4_ops")),
	foreignKey({
			columns: [table.curriculumId],
			foreignColumns: [curriculum.id],
			name: "curriculum_chapters_curriculum_id_curriculum_id_fk"
		}).onDelete("cascade"),
	unique("unique_chapter_curriculum_order").on(table.curriculumId, table.order),
]);

export const curriculumTopics = pgTable("curriculum_topics", {
	id: serial().primaryKey().notNull(),
	chapterId: integer("chapter_id").notNull(),
	topicNumber: integer("topic_number").notNull(),
	title: varchar({ length: 255 }).notNull(),
	description: text(),
	order: integer().notNull(),
	duration: varchar({ length: 50 }),
	learningObjectives: text("learning_objectives").array(),
	resources: text().array(),
	isCore: boolean("is_core").default(true),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	index("idx_topics_chapter").using("btree", table.chapterId.asc().nullsLast().op("int4_ops")),
	index("idx_topics_order").using("btree", table.chapterId.asc().nullsLast().op("int4_ops"), table.order.asc().nullsLast().op("int4_ops")),
	foreignKey({
			columns: [table.chapterId],
			foreignColumns: [curriculumChapters.id],
			name: "curriculum_topics_chapter_id_curriculum_chapters_id_fk"
		}).onDelete("cascade"),
	unique("unique_topic_chapter_order").on(table.chapterId, table.order),
]);

export const studentCurriculumProgress = pgTable("student_curriculum_progress", {
	id: serial().primaryKey().notNull(),
	studentId: integer("student_id").notNull(),
	curriculumId: integer("curriculum_id").notNull(),
	completedTopics: jsonb("completed_topics"),
	progressPercentage: integer("progress_percentage").default(0),
	lastUpdated: timestamp("last_updated", { mode: 'string' }).defaultNow(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	index("idx_student_curriculum_progress_curriculum").using("btree", table.curriculumId.asc().nullsLast().op("int4_ops")),
	index("idx_student_curriculum_progress_student").using("btree", table.studentId.asc().nullsLast().op("int4_ops")),
	foreignKey({
			columns: [table.studentId],
			foreignColumns: [students.id],
			name: "student_curriculum_progress_student_id_students_id_fk"
		}),
	foreignKey({
			columns: [table.curriculumId],
			foreignColumns: [curriculum.id],
			name: "student_curriculum_progress_curriculum_id_curriculum_id_fk"
		}),
	unique("unique_student_curriculum_progress").on(table.studentId, table.curriculumId),
]);
export const dailyAttendanceView = pgView("daily_attendance_view", {	date: date(),
	classId: integer("class_id"),
	className: text("class_name"),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	totalStudents: bigint("total_students", { mode: "number" }),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	presentCount: bigint("present_count", { mode: "number" }),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	absentCount: bigint("absent_count", { mode: "number" }),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	lateCount: bigint("late_count", { mode: "number" }),
	attendancePercentage: numeric("attendance_percentage"),
}).as(sql`SELECT sa.date, c.id AS class_id, c.class_name, count(DISTINCT sa.student_id) AS total_students, count( CASE WHEN sa.status::text = 'present'::text THEN 1 ELSE NULL::integer END) AS present_count, count( CASE WHEN sa.status::text = 'absent'::text THEN 1 ELSE NULL::integer END) AS absent_count, count( CASE WHEN sa.status::text = 'late'::text THEN 1 ELSE NULL::integer END) AS late_count, round(count( CASE WHEN sa.status::text = 'present'::text THEN 1 ELSE NULL::integer END)::numeric * 100.0 / count(DISTINCT sa.student_id)::numeric, 2) AS attendance_percentage FROM student_attendance sa JOIN classes c ON sa.class_id = c.id GROUP BY sa.date, c.id, c.class_name`);