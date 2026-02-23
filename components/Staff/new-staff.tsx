import NewStaffForm from './new-staff-form';

export default function AddStaffPage({user }: {user: any}) {
    return <NewStaffForm isEdit={false} user={user} />;
}