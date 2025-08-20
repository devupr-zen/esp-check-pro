import type * as React from "react";
import { cn } from "@/lib/utils";

interface ProgressBarProps {
	value: number;
	max?: number;
	label?: string;
	variant?: "primary" | "accent" | "success" | "warning";
	size?: "sm" | "md" | "lg";
	showValue?: boolean;
	className?: string;
}

const ProgressBar: React.FC<ProgressBarProps> = ({
	value,
	max = 100,
	label,
	variant = "primary",
	size = "md",
	showValue = true,
	className,
}) => {
	const percentage = Math.min((value / max) * 100, 100);

	const variantClasses = {
		primary: "bg-primary",
		accent: "bg-accent",
		success: "bg-success",
		warning: "bg-warning",
	};

	const sizeClasses = {
		sm: "h-2",
		md: "h-3",
		lg: "h-4",
	};

	return (
		<div className={cn("space-y-2", className)}>
			{(label || showValue) && (
				<div className="flex items-center justify-between">
					{label && (
						<span className="text-sm font-medium text-foreground">{label}</span>
					)}
					{showValue && (
						<span className="text-sm text-muted-foreground">
							{value}
							{max === 100 ? "%" : `/${max}`}
						</span>
					)}
				</div>
			)}
			<div
				className={cn(
					"w-full bg-muted rounded-full overflow-hidden",
					sizeClasses[size],
				)}
			>
				<div
					className={cn(
						"h-full transition-all duration-500 ease-out rounded-full",
						variantClasses[variant],
					)}
					style={{ width: `${percentage}%` }}
				/>
			</div>
		</div>
	);
};

export { ProgressBar };
