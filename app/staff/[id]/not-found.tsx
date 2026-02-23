import Link from 'next/link';

export default function NotFound() {
    return (
        <div className="text-center py-20">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">Staff Member Not Found</h2>
            <p className="text-gray-600 mb-8">The staff member you're looking for doesn't exist or has been removed.</p>
            <Link 
                href="/dashboard/users/staff"
                className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
                Return to Staff Directory
            </Link>
        </div>
    );
}