import { getStaffById } from '@api/staff-actions';
import NewStaffForm from './new-staff-form';
import { notFound } from 'next/navigation';

type PageProps = {
    params: Promise<{ id: string }>;
    user?: any;
};

// Recursive function to transform all null values to undefined
function transformNullToUndefined(obj: any): any {
    if (obj === null) return undefined;
    if (Array.isArray(obj)) return obj.map(transformNullToUndefined);
    if (typeof obj === 'object') {
        return Object.fromEntries(
            Object.entries(obj).map(([key, value]) => [key, transformNullToUndefined(value)])
        );
    }
    return obj;
}

export default async function EditStaffPage({ user, params }: PageProps) {
    const { id } = await params;
    const staffId = parseInt(id, 10);

    // Guard against non-numeric IDs before hitting the DB
    if (isNaN(staffId)) notFound();

    const result = await getStaffById(staffId.toString());

    if (result.error || !result.success) {
        notFound();
    }

    const transformedStaff = transformNullToUndefined(result.data);

    return <NewStaffForm staff={transformedStaff} user={user} isEdit={true} />;
}