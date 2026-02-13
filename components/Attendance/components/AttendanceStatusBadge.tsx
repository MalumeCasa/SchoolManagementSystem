'use client';

interface AttendanceStatusBadgeProps {
  status: 'present' | 'absent' | 'late' | 'half-day';
  size?: 'sm' | 'md' | 'lg';
}

export function AttendanceStatusBadge({ status, size = 'md' }: AttendanceStatusBadgeProps) {
  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-2 text-base'
  };

  const statusConfig = {
    present: {
      class: 'bg-green-100 text-green-800 border-green-200',
      label: 'Present',
      icon: '✅'
    },
    absent: {
      class: 'bg-red-100 text-red-800 border-red-200',
      label: 'Absent',
      icon: '❌'
    },
    late: {
      class: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      label: 'Late',
      icon: '⏰'
    },
    'half-day': {
      class: 'bg-purple-100 text-purple-800 border-purple-200',
      label: 'Half Day',
      icon: '🕐'
    }
  };

  const config = statusConfig[status];

  return (
    <span className={`inline-flex items-center rounded-full border font-medium ${sizeClasses[size]} ${config.class}`}>
      <span className="mr-1">{config.icon}</span>
      {config.label}
    </span>
  );
}