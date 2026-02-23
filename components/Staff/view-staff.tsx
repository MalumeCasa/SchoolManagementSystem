import { getStaffById } from '@api/staff-actions';
import ViewStaffForm from './view-staff-form';
import { notFound } from 'next/navigation';

type PageProps = {
    params: Promise<{ id: string }>;
    user?: any;
};

export default async function ViewStaffPage({ params, user }: PageProps) {
    const { id } = await params;

    // Guard against non-numeric IDs before hitting the DB
    if (isNaN(parseInt(id, 10))) notFound();

    const result = await getStaffById(id);

    if (result.error || !result.success) {
        notFound();
    }

    return <ViewStaffForm staff={result.data} user={user} />;
}