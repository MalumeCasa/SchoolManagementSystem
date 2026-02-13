// components/assignments/assignment-form.tsx
'use client';

import { useState } from 'react';
import { createAssignment, updateAssignment } from '@api/assignments-actions';
import { Class, Subject, Teacher } from '@api/types';

interface AssignmentFormProps {
  classes: Class[];
  subjects: Subject[];
  teachers: Teacher[];
  assignment?: any;
  onSuccess?: () => void;
}

export default function AssignmentForm({
  classes,
  subjects,
  teachers,
  assignment,
  onSuccess,
}: AssignmentFormProps) {
  const [formData, setFormData] = useState({
    title: assignment?.title || '',
    description: assignment?.description || '',
    instructions: assignment?.instructions || '',
    classId: assignment?.classId || '',
    subjectId: assignment?.subjectId || '',
    teacherId: assignment?.teacherId || '',
    assignedDate: assignment?.assignedDate || new Date().toISOString().split('T')[0],
    dueDate: assignment?.dueDate || '',
    totalMarks: assignment?.totalMarks || 100,
    passingMarks: assignment?.passingMarks || 40,
    attachmentUrl: assignment?.attachmentUrl || '',
    attachmentName: assignment?.attachmentName || '',
  });

  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) newErrors.title = 'Title is required';
    if (!formData.classId) newErrors.classId = 'Class is required';
    if (!formData.subjectId) newErrors.subjectId = 'Subject is required';
    if (!formData.teacherId) newErrors.teacherId = 'Teacher is required';
    if (!formData.dueDate) newErrors.dueDate = 'Due date is required';

    if (formData.dueDate && formData.assignedDate && formData.dueDate < formData.assignedDate) {
      newErrors.dueDate = 'Due date cannot be before assigned date';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsLoading(true);
    
    // Convert string IDs to numbers for the API
    const submissionData = {
      ...formData,
      classId: parseInt(formData.classId as string),
      subjectId: parseInt(formData.subjectId as string),
      teacherId: parseInt(formData.teacherId as string),
    };

    const result = assignment 
      ? await updateAssignment(assignment.id, submissionData)
      : await createAssignment(submissionData);

    if (result.success) {
      onSuccess?.();
      // Reset form if creating new
      if (!assignment) {
        setFormData({
          title: '',
          description: '',
          instructions: '',
          classId: '',
          subjectId: '',
          teacherId: '',
          assignedDate: new Date().toISOString().split('T')[0],
          dueDate: '',
          totalMarks: 100,
          passingMarks: 40,
          attachmentUrl: '',
          attachmentName: '',
        });
      }
      alert(assignment ? 'Assignment updated successfully!' : 'Assignment created successfully!');
    } else {
      alert(`Error: ${result.error}`);
    }
    
    setIsLoading(false);
  };

  // Filter subjects based on selected class
  const filteredSubjects = subjects.filter(subject => {
    if (!formData.classId) return true;
    
    // Check if subject belongs to the selected class
    // Since your schema doesn't have classId in subjects, we'll use className matching
    const selectedClass = classes.find(c => c.id.toString() === formData.classId);
    return selectedClass && subject.className === selectedClass.className;
  });

  // Filter teachers based on selected class - simplified approach
  const filteredTeachers = teachers.filter(teacher => {
    if (!formData.classId) return true;
    
    // Since your schema doesn't have direct class-teacher relationship,
    // we'll return all teachers for now, or implement your logic here
    return true;
  });

  return (
    <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
      <div className="border-b border-stroke px-6.5 py-4 dark:border-strokedark">
        <h3 className="font-medium text-black dark:text-white">
          {assignment ? 'Edit Assignment' : 'Create New Assignment'}
        </h3>
      </div>

      <form onSubmit={handleSubmit} className="p-6.5">
        <div className="mb-4.5 grid grid-cols-1 gap-4.5 md:grid-cols-2">
          {/* Title */}
          <div className="md:col-span-2">
            <label className="mb-3 block text-sm font-medium text-black dark:text-white">
              Assignment Title *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => handleChange('title', e.target.value)}
              placeholder="Enter assignment title"
              className={`w-full rounded-lg border border-stroke bg-transparent py-3 px-5 outline-none focus:border-primary dark:border-strokedark dark:bg-meta-4 ${
                errors.title ? 'border-red-500' : ''
              }`}
            />
            {errors.title && <p className="mt-1 text-sm text-red-500">{errors.title}</p>}
          </div>

          {/* Class */}
          <div>
            <label className="mb-3 block text-sm font-medium text-black dark:text-white">
              Class *
            </label>
            <select
              value={formData.classId}
              onChange={(e) => {
                handleChange('classId', e.target.value);
                // Reset subject and teacher when class changes
                handleChange('subjectId', '');
                handleChange('teacherId', '');
              }}
              className={`w-full rounded-lg border border-stroke bg-transparent py-3 px-5 outline-none focus:border-primary dark:border-strokedark dark:bg-meta-4 ${
                errors.classId ? 'border-red-500' : ''
              }`}
            >
              <option value="">Select Class</option>
              {classes.map((classItem) => (
                <option key={classItem.id} value={classItem.id}>
                  {classItem.className} - {classItem.classSection}
                </option>
              ))}
            </select>
            {errors.classId && <p className="mt-1 text-sm text-red-500">{errors.classId}</p>}
          </div>

          {/* Subject */}
          <div>
            <label className="mb-3 block text-sm font-medium text-black dark:text-white">
              Subject *
            </label>
            <select
              value={formData.subjectId}
              onChange={(e) => handleChange('subjectId', e.target.value)}
              disabled={!formData.classId}
              className={`w-full rounded-lg border border-stroke bg-transparent py-3 px-5 outline-none focus:border-primary dark:border-strokedark dark:bg-meta-4 ${
                errors.subjectId ? 'border-red-500' : ''
              }`}
            >
              <option value="">Select Subject</option>
              {filteredSubjects.map((subject) => (
                <option key={subject.id} value={subject.id}>
                  {subject.name}
                </option>
              ))}
            </select>
            {errors.subjectId && <p className="mt-1 text-sm text-red-500">{errors.subjectId}</p>}
          </div>

          {/* Teacher */}
          <div>
            <label className="mb-3 block text-sm font-medium text-black dark:text-white">
              Teacher *
            </label>
            <select
              value={formData.teacherId}
              onChange={(e) => handleChange('teacherId', e.target.value)}
              disabled={!formData.classId}
              className={`w-full rounded-lg border border-stroke bg-transparent py-3 px-5 outline-none focus:border-primary dark:border-strokedark dark:bg-meta-4 ${
                errors.teacherId ? 'border-red-500' : ''
              }`}
            >
              <option value="">Select Teacher</option>
              {filteredTeachers.map((teacher) => (
                <option key={teacher.id} value={teacher.id}>
                  {teacher.name} {teacher.surname}
                </option>
              ))}
            </select>
            {errors.teacherId && <p className="mt-1 text-sm text-red-500">{errors.teacherId}</p>}
          </div>

          {/* Dates */}
          <div>
            <label className="mb-3 block text-sm font-medium text-black dark:text-white">
              Assigned Date *
            </label>
            <input
              type="date"
              value={formData.assignedDate}
              onChange={(e) => handleChange('assignedDate', e.target.value)}
              className="w-full rounded-lg border border-stroke bg-transparent py-3 px-5 outline-none focus:border-primary dark:border-strokedark dark:bg-meta-4"
            />
          </div>

          <div>
            <label className="mb-3 block text-sm font-medium text-black dark:text-white">
              Due Date *
            </label>
            <input
              type="date"
              value={formData.dueDate}
              onChange={(e) => handleChange('dueDate', e.target.value)}
              className={`w-full rounded-lg border border-stroke bg-transparent py-3 px-5 outline-none focus:border-primary dark:border-strokedark dark:bg-meta-4 ${
                errors.dueDate ? 'border-red-500' : ''
              }`}
            />
            {errors.dueDate && <p className="mt-1 text-sm text-red-500">{errors.dueDate}</p>}
          </div>

          {/* Marks */}
          <div>
            <label className="mb-3 block text-sm font-medium text-black dark:text-white">
              Total Marks
            </label>
            <input
              type="number"
              value={formData.totalMarks}
              onChange={(e) => handleChange('totalMarks', parseInt(e.target.value) || 0)}
              min="1"
              max="1000"
              className="w-full rounded-lg border border-stroke bg-transparent py-3 px-5 outline-none focus:border-primary dark:border-strokedark dark:bg-meta-4"
            />
          </div>

          <div>
            <label className="mb-3 block text-sm font-medium text-black dark:text-white">
              Passing Marks
            </label>
            <input
              type="number"
              value={formData.passingMarks}
              onChange={(e) => handleChange('passingMarks', parseInt(e.target.value) || 0)}
              min="1"
              max={formData.totalMarks}
              className="w-full rounded-lg border border-stroke bg-transparent py-3 px-5 outline-none focus:border-primary dark:border-strokedark dark:bg-meta-4"
            />
          </div>
        </div>

        {/* Description */}
        <div className="mb-4.5">
          <label className="mb-3 block text-sm font-medium text-black dark:text-white">
            Description
          </label>
          <textarea
            rows={3}
            value={formData.description}
            onChange={(e) => handleChange('description', e.target.value)}
            placeholder="Enter assignment description"
            className="w-full rounded-lg border border-stroke bg-transparent py-3 px-5 outline-none focus:border-primary dark:border-strokedark dark:bg-meta-4"
          />
        </div>

        {/* Instructions */}
        <div className="mb-4.5">
          <label className="mb-3 block text-sm font-medium text-black dark:text-white">
            Instructions
          </label>
          <textarea
            rows={3}
            value={formData.instructions}
            onChange={(e) => handleChange('instructions', e.target.value)}
            placeholder="Enter assignment instructions"
            className="w-full rounded-lg border border-stroke bg-transparent py-3 px-5 outline-none focus:border-primary dark:border-strokedark dark:bg-meta-4"
          />
        </div>

        {/* File Attachment */}
        <div className="mb-6">
          <label className="mb-3 block text-sm font-medium text-black dark:text-white">
            Attachment (Optional)
          </label>
          <div className="flex gap-4">
            <input
              type="text"
              value={formData.attachmentName}
              onChange={(e) => handleChange('attachmentName', e.target.value)}
              placeholder="File name"
              className="flex-1 rounded-lg border border-stroke bg-transparent py-3 px-5 outline-none focus:border-primary dark:border-strokedark dark:bg-meta-4"
            />
            <input
              type="url"
              value={formData.attachmentUrl}
              onChange={(e) => handleChange('attachmentUrl', e.target.value)}
              placeholder="File URL"
              className="flex-1 rounded-lg border border-stroke bg-transparent py-3 px-5 outline-none focus:border-primary dark:border-strokedark dark:bg-meta-4"
            />
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="flex w-full justify-center rounded bg-primary p-3 font-medium text-white hover:bg-opacity-90 disabled:opacity-50"
        >
          {isLoading 
            ? (assignment ? 'Updating...' : 'Creating...') 
            : (assignment ? 'Update Assignment' : 'Create Assignment')
          }
        </button>
      </form>
    </div>
  );
}