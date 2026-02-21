const stats = [
  { value: "15+", label: "Years Experience", color: "text-logo-yellow" },
  { value: "200+", label: "Happy Children", color: "text-logo-orange" },
  { value: "20+", label: "Qualified Staff", color: "text-logo-green" },
  { value: "100%", label: "Parent Satisfaction", color: "text-logo-pink" },
]

export function StatsBanner() {
  return (
    <section className="bg-logo-blue py-12 md:py-16">
      <div className="mx-auto max-w-7xl px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {stats.map((stat) => (
            <div key={stat.label}>
              <p className={`text-3xl md:text-4xl font-extrabold ${stat.color}`}>
                {stat.value}
              </p>
              <p className="mt-2 text-sm font-medium text-white/85">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
