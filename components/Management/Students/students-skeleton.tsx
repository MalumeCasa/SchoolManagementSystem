import React from "react";

export function StudentsPageSkeleton() {
  return (
    <div className="p-6 animate-pulse">
      {/* Header Skeleton */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <div className="h-14 w-14 rounded-2xl bg-gray-200 dark:bg-gray-700" />
          <div>
            <div className="h-7 w-48 rounded-lg bg-gray-200 dark:bg-gray-700" />
            <div className="mt-2 h-4 w-32 rounded bg-gray-200 dark:bg-gray-700" />
          </div>
        </div>
        <div className="flex gap-2">
          <div className="h-9 w-24 rounded-lg bg-gray-200 dark:bg-gray-700" />
          <div className="h-9 w-24 rounded-lg bg-gray-200 dark:bg-gray-700" />
        </div>
      </div>

      {/* Filters Skeleton */}
      <div className="mb-6 rounded-xl border border-gray-200 bg-gray-50/50 p-5 dark:border-gray-700 dark:bg-gray-800/50">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className={i === 0 ? "lg:col-span-2" : ""}>
              <div className="mb-2 h-3 w-16 rounded bg-gray-200 dark:bg-gray-700" />
              <div className="h-10 w-full rounded-lg bg-gray-200 dark:bg-gray-700" />
            </div>
          ))}
        </div>
      </div>

      {/* Export Bar Skeleton */}
      <div className="mb-4 flex justify-between">
        <div className="flex gap-2">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-9 w-16 rounded-lg bg-gray-200 dark:bg-gray-700" />
          ))}
        </div>
      </div>

      {/* Table Skeleton */}
      <div className="hidden lg:block">
        <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700">
          <div className="p-4">
            {/* Table Header */}
            <div className="mb-4 flex items-center gap-4 pb-4 border-b border-gray-200 dark:border-gray-700">
              <div className="h-4 w-4 rounded bg-gray-200 dark:bg-gray-700" />
              {[...Array(9)].map((_, i) => (
                <div key={i} className="h-4 w-20 rounded bg-gray-200 dark:bg-gray-700" />
              ))}
            </div>
            
            {/* Table Rows */}
            {[...Array(5)].map((_, rowIndex) => (
              <div key={rowIndex} className="mb-4 flex items-center gap-4">
                <div className="h-4 w-4 rounded bg-gray-200 dark:bg-gray-700" />
                <div className="h-8 w-8 rounded-full bg-gray-200 dark:bg-gray-700" />
                <div className="h-4 w-24 rounded bg-gray-200 dark:bg-gray-700" />
                <div className="h-4 w-24 rounded bg-gray-200 dark:bg-gray-700" />
                <div className="h-4 w-32 rounded bg-gray-200 dark:bg-gray-700" />
                <div className="h-4 w-24 rounded bg-gray-200 dark:bg-gray-700" />
                <div className="h-4 w-16 rounded bg-gray-200 dark:bg-gray-700" />
                <div className="h-4 w-16 rounded bg-gray-200 dark:bg-gray-700" />
                <div className="h-4 w-20 rounded bg-gray-200 dark:bg-gray-700" />
                <div className="h-8 w-24 rounded bg-gray-200 dark:bg-gray-700" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Mobile Cards Skeleton */}
      <div className="lg:hidden space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-800">
            <div className="flex items-start gap-3">
              <div className="h-4 w-4 rounded bg-gray-200 dark:bg-gray-700 mt-1" />
              <div className="h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-700" />
              <div className="flex-1">
                <div className="h-5 w-32 rounded bg-gray-200 dark:bg-gray-700" />
                <div className="mt-2 h-4 w-24 rounded bg-gray-200 dark:bg-gray-700" />
                <div className="mt-3 flex gap-2">
                  <div className="h-6 w-16 rounded-full bg-gray-200 dark:bg-gray-700" />
                  <div className="h-6 w-16 rounded-full bg-gray-200 dark:bg-gray-700" />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}