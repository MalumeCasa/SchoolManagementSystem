import { getStaffById } from '@api/staff-actions';
import ViewStaffForm from './view-staff-form';
import { notFound } from 'next/navigation';

export default async function ViewStaffPage({ params }: { 
    params: Promise<{ id: string }> 
}) {
    const { id } = await params;
    const result = await getStaffById(id);
    
    if (result.error || !result.success) {
        notFound(); // This will show the Next.js 404 page
    }

    // Since getStaffById returns { success: true, data: staffMember }
    return <ViewStaffForm staff={result.data} />; 
}