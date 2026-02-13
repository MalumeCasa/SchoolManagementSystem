"use client";

import React from "react";
import Link from "next/link";
import { ShowcaseSection } from "@/components/Layouts/showcase-section";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import type { Staff } from "@api/db/types";
import { deleteStaff } from "@api/staff-actions"; // ← ADDED IMPORT
import { getStatusBadge } from './common';

interface DisplayStaffPageProps {
  staff?: Staff[];
}

export function DisplayStaffPage({ staff = [] }: DisplayStaffPageProps) {
  const [selectedStaff, setSelectedStaff] = React.useState<string[]>([]);
  const [filterDepartment, setFilterDepartment] = React.useState<string>("all");
  const [filterRole, setFilterRole] = React.useState<string>("all");
  const [searchTerm, setSearchTerm] = React.useState<string>("");
  const [isDeleting, setIsDeleting] = React.useState<string | null>(null); // ← ADDED STATE for delete loading

  const toggleStaffSelection = (staffId: string) => {
    setSelectedStaff(prev =>
      prev.includes(staffId)
        ? prev.filter(id => id !== staffId)
        : [...prev, staffId]
    );
  };

  const selectAllStaff = () => {
    setSelectedStaff(
      selectedStaff.length === filteredStaff.length
        ? []
        : filteredStaff.map(staff => staff.id.toString())
    );
  };

  // ← ADDED DELETE FUNCTION
  const handleDeleteStaff = async (staffId: string, staffName: string) => {
    if (!confirm(`Are you sure you want to delete ${staffName}? This action cannot be undone.`)) {
      return;
    }

    setIsDeleting(staffId);
    try {
      const result = await deleteStaff(parseInt(staffId));
      if (result.success) {
        // Refresh the page or update the staff list
        window.location.reload();
      } else {
        alert(`Failed to delete staff: ${result.error}`);
      }
    } catch (error) {
      console.error('Error deleting staff:', error);
      alert('An error occurred while deleting staff');
    } finally {
      setIsDeleting(null);
    }
  };

  // Filter staff based on search term, department, and role
  const filteredStaff = staff.filter(staffMember => {
    const matchesSearch = 
      staffMember.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      staffMember.surname.toLowerCase().includes(searchTerm.toLowerCase()) ||
      staffMember.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      staffMember.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
      staffMember.staffId?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesDepartment = filterDepartment === "all" || staffMember.department === filterDepartment;
    const matchesRole = filterRole === "all" || staffMember.role === filterRole;

    return matchesSearch && matchesDepartment && matchesRole;
  });

  // Get unique departments and roles for filters
  const departments = [...new Set(staff.map(s => s.department))];
  const roles = [...new Set(staff.map(s => s.role))];

  // Export functionality for staff
  const ExportButtons = ({ staff, selectedStaff }: { staff: Staff[], selectedStaff: string[] }) => {
    const exportStaff = (staffToExport: Staff[]) => {
      const data = staffToExport.map(staff => ({
        'Staff ID': staff.staffId,
        'Name': staff.name,
        'Surname': staff.surname,
        'Email': staff.email,
        'Phone': staff.phone,
        'Position': staff.position,
        'Department': staff.department,
        'Role': staff.role,
        'Employment Type': staff.employmentType,
        'Qualification': staff.qualification,
        'Experience': `${staff.experience} years`,
        'Specialization': staff.specialization || 'N/A',
        'Status': staff.isActive ? 'Active' : 'Inactive'
      }));

      const csvContent = [
        Object.keys(data[0]).join(','),
        ...data.map(row => Object.values(row).map(field => `"${field}"`).join(','))
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `staff-directory-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
    };

    const handleExportSelected = () => {
      const staffToExport = staff.filter(s => selectedStaff.includes(s.id.toString()));
      exportStaff(staffToExport);
    };

    const handleExportAll = () => {
      exportStaff(staff);
    };

    return (
      <div className="flex gap-2 mb-4">
        <Button
          onClick={handleExportAll}
          variant="outline"
          size="sm"
        >
          Export All Staff
        </Button>
        {selectedStaff.length > 0 && (
          <Button
            onClick={handleExportSelected}
            variant="outline"
            size="sm"
          >
            Export Selected ({selectedStaff.length})
          </Button>
        )}
      </div>
    );
  };

  // Format role for display
  const formatRole = (role: string) => {
    return role.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };



  // Get department badge color
  const getDepartmentBadge = (department: string) => {
    switch (department) {
      case 'academic':
        return "bg-blue-100 text-blue-800";
      case 'administrative':
        return "bg-purple-100 text-purple-800";
      case 'support':
        return "bg-orange-100 text-orange-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <>
      <div className="grid grid-cols-1 gap-9 sm:grid-cols-1">
        <div className="flex flex-col gap-9">
          <ShowcaseSection title="Staff Directory" className="space-y-5.5 !p-6.5">
            {/* Header Section */}
            <div className="flex justify-between items-center mb-6">
              <div>
                <h1 className="text-3xl font-bold text-foreground">Staff Directory</h1>
                <p className="text-sm text-muted-foreground mt-1">
                  Total Staff: {staff.length} | Showing: {filteredStaff.length} | 
                  Selected: {selectedStaff.length}
                </p>
              </div>
              <Link
                href="/staff/new"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Add New Staff
              </Link>
            </div>

            {/* Filters and Search Section */}
            <div className="bg-gray-50 p-4 rounded-lg mb-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {/* Search */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Search Staff
                  </label>
                  <input
                    type="text"
                    placeholder="Search by name, email, position..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full rounded border border-stroke bg-white py-2 px-3 text-black outline-none transition focus:border-primary"
                  />
                </div>

                {/* Department Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Department
                  </label>
                  <select
                    value={filterDepartment}
                    onChange={(e) => setFilterDepartment(e.target.value)}
                    className="w-full rounded border border-stroke bg-white py-2 px-3 text-black outline-none transition focus:border-primary"
                  >
                    <option value="all">All Departments</option>
                    {departments.map(dept => (
                      <option key={dept} value={dept}>
                        {dept.charAt(0).toUpperCase() + dept.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Role Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Role
                  </label>
                  <select
                    value={filterRole}
                    onChange={(e) => setFilterRole(e.target.value)}
                    className="w-full rounded border border-stroke bg-white py-2 px-3 text-black outline-none transition focus:border-primary"
                  >
                    <option value="all">All Roles</option>
                    {roles.map(role => (
                      <option key={role} value={role}>
                        {formatRole(role)}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Clear Filters */}
                <div className="flex items-end">
                  <Button
                    onClick={() => {
                      setSearchTerm("");
                      setFilterDepartment("all");
                      setFilterRole("all");
                    }}
                    variant="outline"
                    size="sm"
                    className="w-full"
                  >
                    Clear Filters
                  </Button>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-between items-center">
              <ExportButtons
                staff={filteredStaff}
                selectedStaff={selectedStaff}
              />
              <div className="text-sm text-gray-500">
                {selectedStaff.length > 0
                  ? `${selectedStaff.length} selected`
                  : `${filteredStaff.length} staff members`
                }
              </div>
            </div>

            {/* Staff Table */}
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50">
                    <TableHead>
                      <input
                        type="checkbox"
                        checked={filteredStaff.length > 0 && selectedStaff.length === filteredStaff.length}
                        onChange={selectAllStaff}
                        className="w-4 h-4"
                      />
                    </TableHead>
                    <TableHead>Staff ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Position</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Experience</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredStaff.length > 0 ? (
                    filteredStaff.map((staffMember) => (
                      <TableRow key={staffMember.id} className="hover:bg-gray-50">
                        <TableCell>
                          <input
                            type="checkbox"
                            checked={selectedStaff.includes(staffMember.id.toString())}
                            onChange={() => toggleStaffSelection(staffMember.id.toString())}
                            className="w-4 h-4"
                          />
                        </TableCell>
                        <TableCell className="font-medium">
                          {staffMember.staffId || `STF${staffMember.id.toString().padStart(4, '0')}`}
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{staffMember.name} {staffMember.surname}</div>
                            <div className="text-sm text-gray-500">{staffMember.employmentType}</div>
                          </div>
                        </TableCell>
                        <TableCell>{staffMember.position}</TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 rounded-full text-xs ${getDepartmentBadge(staffMember.department)}`}>
                            {staffMember.department.charAt(0).toUpperCase() + staffMember.department.slice(1)}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                            {formatRole(staffMember.role)}
                          </span>
                        </TableCell>
                        <TableCell>{staffMember.email}</TableCell>
                        <TableCell>{staffMember.phone || "N/A"}</TableCell>
                        <TableCell>
                          <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs">
                            {staffMember.experience} years
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 rounded-full text-xs ${getStatusBadge(staffMember.isActive, staffMember.employmentStatus)}`}>
                            {staffMember.isActive ? (staffMember.employmentStatus === 'suspended' ? 'Suspended' : 'Active') : 'Inactive'}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Link
                              href={`/staff/${staffMember.id}/edit`}
                              className="text-blue-600 hover:underline text-sm"
                            >
                              Edit
                            </Link>
                            <Link
                              href={`/staff/${staffMember.id}`}
                              className="text-green-600 hover:underline text-sm"
                            >
                              View
                            </Link>
                            {/* ← ADDED DELETE BUTTON */}
                            <button 
                              onClick={() => handleDeleteStaff(staffMember.id.toString(), `${staffMember.name} ${staffMember.surname}`)}
                              disabled={isDeleting === staffMember.id.toString()}
                              className="text-red-600 hover:underline text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {isDeleting === staffMember.id.toString() ? 'Deleting...' : 'Delete'}
                            </button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={11} className="text-center py-8 text-gray-500">
                        {staff.length === 0 ? (
                          <>
                            No staff members found.{" "}
                            <Link href="/staff/new" className="text-blue-600 hover:underline">
                              Add your first staff member
                            </Link>
                          </>
                        ) : (
                          "No staff members match your current filters."
                        )}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>

            {/* ← UPDATED: Reduced size of Quick Stats blocks */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6"> {/* ← CHANGED: gap-4 to gap-3 and mt-6 */}
              <div className="bg-blue-50 p-3 rounded-lg text-center"> {/* ← CHANGED: p-4 to p-3 */}
                <div className="text-xl font-bold text-blue-700">{staff.length}</div> {/* ← CHANGED: text-2xl to text-xl */}
                <div className="text-xs text-blue-600">Total Staff</div> {/* ← CHANGED: text-sm to text-xs */}
              </div>
              <div className="bg-green-50 p-3 rounded-lg text-center"> {/* ← CHANGED: p-4 to p-3 */}
                <div className="text-xl font-bold text-green-700"> {/* ← CHANGED: text-2xl to text-xl */}
                  {staff.filter(s => s.isActive && s.employmentStatus !== 'suspended').length}
                </div>
                <div className="text-xs text-green-600">Active Staff</div> {/* ← CHANGED: text-sm to text-xs */}
              </div>
              <div className="bg-purple-50 p-3 rounded-lg text-center"> {/* ← CHANGED: p-4 to p-3 */}
                <div className="text-xl font-bold text-purple-700"> {/* ← CHANGED: text-2xl to text-xl */}
                  {staff.filter(s => s.department === 'academic').length}
                </div>
                <div className="text-xs text-purple-600">Academic Staff</div> {/* ← CHANGED: text-sm to text-xs */}
              </div>
              <div className="bg-orange-50 p-3 rounded-lg text-center"> {/* ← CHANGED: p-4 to p-3 */}
                <div className="text-xl font-bold text-orange-700"> {/* ← CHANGED: text-2xl to text-xl */}
                  {staff.filter(s => s.department === 'administrative').length}
                </div>
                <div className="text-xs text-orange-600">Administrative</div> {/* ← CHANGED: text-sm to text-xs */}
              </div>
            </div>
          </ShowcaseSection>
        </div>
      </div>
    </>
  );
}