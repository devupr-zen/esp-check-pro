import type * as React from "react";
import { cn } from "@/lib/utils";

interface MetricChipProps {
	label: string;
	value: string | number;
	trend?: "up" | "down" | "neutral";
	variant?: "primary" | "accent" | "success" | "warning" | "info";
	className?: string;
}

const MetricChip: React.FC<MetricChipProps> = ({
	label,
	value,
	trend,
	variant = "primary",
	className,
}) => {
	const variantClasses = {
		primary: "bg-primary/10 text-primary border-primary/20",
		accent: "bg-accent/10 text-accent border-accent/20",
		success: "bg-success/10 text-success border-success/20",
		warning: "bg-warning/10 text-warning border-warning/20",
		info: "bg-info/10 text-info border-info/20",
	};

	const trendIcon = {
		up: "↗",
		down: "↘",
		neutral: "→",
	};

	return (
		<div
			className={cn(
				"glass-card p-4 border",
				variantClasses[variant],
				className,
			)}
		>
			<div className="space-y-1">
				<p className="text-sm font-medium opacity-80">{label}</p>
				<div className="flex items-center gap-2">
					<span className="text-2xl font-bold">{value}</span>
					{trend && (
						<span className="text-sm opacity-60">{trendIcon[trend]}</span>
					)}
				</div>
			</div>
		</div>
	);
};

export { MetricChip };
