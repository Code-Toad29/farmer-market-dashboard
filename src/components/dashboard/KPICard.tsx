interface KPICardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: {
    value: string;
    direction: "up" | "down" | "neutral";
  };
  color?: string;
}

export function KPICard({ title, value, icon, trend, color = "text-primary" }: KPICardProps) {
  return (
    <div className="bg-white rounded-xl border border-border-light p-6 shadow-soft hover:shadow-md hover:border-primary/30 transition-all duration-300 group">
      <div className="flex justify-between items-start mb-4">
        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          {title}
        </p>
        <div className="text-primary/60 group-hover:text-primary transition-colors">
          {icon}
        </div>
      </div>
      <h3 className={`text-4xl font-bold font-display ${color} tracking-tight`}>
        {value}
      </h3>
      {trend && (
        <p className={`text-xs font-medium mt-2 flex items-center gap-1 ${
          trend.direction === "up" ? "text-green-600" :
          trend.direction === "down" ? "text-red-500" :
          "text-gray-400"
        }`}>
          <span className="text-sm">
            {trend.direction === "up" ? "↑" : trend.direction === "down" ? "↓" : "—"}
          </span>
          {trend.value}
        </p>
      )}
    </div>
  );
}