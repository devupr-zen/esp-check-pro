import { Calendar, Clock, Play, Target, TrendingUp } from "lucide-react";
import React from "react";
import { BarChart } from "@/components/charts/BarChart";
import { DonutChart } from "@/components/charts/DonutChart";
import { GlassCard } from "@/components/reusable/GlassCard";
import { MetricChip } from "@/components/reusable/MetricChip";
import { ProgressBar } from "@/components/reusable/ProgressBar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

// Mock data
const progressData = [
	{ name: "Reading", value: 85, color: "hsl(var(--chart-teal))" },
	{ name: "Listening", value: 78, color: "hsl(var(--chart-orange))" },
	{ name: "Speaking", value: 72, color: "hsl(var(--chart-purple))" },
	{ name: "Writing", value: 68, color: "hsl(var(--chart-lavender))" },
];

const comparisonData = [
	{ name: "Reading", value: 85, comparison: 75 },
	{ name: "Listening", value: 78, comparison: 80 },
	{ name: "Speaking", value: 72, comparison: 70 },
	{ name: "Writing", value: 68, comparison: 72 },
];

const recentActivities = [
	{
		title: "Business Writing Assessment",
		time: "2 hours ago",
		score: 85,
		status: "completed",
	},
	{
		title: "Email Communication Activity",
		time: "1 day ago",
		score: 92,
		status: "completed",
	},
	{
		title: "Presentation Skills",
		time: "3 days ago",
		score: 78,
		status: "completed",
	},
	{
		title: "Grammar Review",
		time: "1 week ago",
		score: 88,
		status: "completed",
	},
];

export default function Dashboard() {
	return (
		<div className="space-y-6">
			{/* Welcome Section */}
			<div className="space-y-2">
				<h1 className="text-3xl font-bold text-foreground">
					Welcome back, John!
				</h1>
				<p className="text-muted-foreground">
					Here's your progress overview for this week.
				</p>
			</div>

			{/* KPI Metrics */}
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
				<MetricChip
					label="Overall Average"
					value="76%"
					trend="up"
					variant="primary"
				/>
				<MetricChip
					label="Last Activity"
					value="85%"
					trend="up"
					variant="success"
				/>
				<MetricChip
					label="Study Streak"
					value="12 days"
					trend="up"
					variant="accent"
				/>
				<MetricChip label="CEFR Level" value="B2" variant="info" />
			</div>

			{/* Main Content Grid */}
			<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
				{/* Progress Overview */}
				<DonutChart
					data={progressData}
					title="Skill Progress Overview"
					centerValue="76%"
					centerLabel="Overall"
					height={350}
				/>

				{/* Class Comparison */}
				<BarChart
					data={comparisonData}
					title="Performance vs Class Average"
					height={350}
				/>
			</div>

			{/* Secondary Content Grid */}
			<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
				{/* Monthly Focus */}
				<GlassCard className="space-y-4">
					<div className="flex items-center gap-2">
						<Target className="h-5 w-5 text-primary" />
						<h3 className="text-lg font-semibold">Monthly Focus</h3>
					</div>
					<div className="space-y-3">
						<Badge variant="accent">Business Communication</Badge>
						<p className="text-sm text-muted-foreground">
							This month, focus on improving your professional email writing and
							presentation skills.
						</p>
						<ProgressBar
							label="Progress"
							value={65}
							variant="accent"
							size="sm"
						/>
						<ul className="text-sm space-y-1 text-muted-foreground">
							<li>• Complete 3 email writing activities</li>
							<li>• Practice presentation skills</li>
							<li>• Take formal assessment</li>
						</ul>
					</div>
				</GlassCard>

				{/* Activity Timeline */}
				<GlassCard className="space-y-4">
					<div className="flex items-center gap-2">
						<Clock className="h-5 w-5 text-primary" />
						<h3 className="text-lg font-semibold">Recent Activities</h3>
					</div>
					<div className="space-y-3">
						{recentActivities.map((activity, index) => (
							<div
								key={index}
								className="flex items-center justify-between p-2 rounded-lg bg-background/50"
							>
								<div className="space-y-1">
									<p className="text-sm font-medium">{activity.title}</p>
									<p className="text-xs text-muted-foreground">
										{activity.time}
									</p>
								</div>
								<Badge variant="success">{activity.score}%</Badge>
							</div>
						))}
					</div>
				</GlassCard>

				{/* Next Assessment CTA */}
				<GlassCard className="space-y-4">
					<div className="flex items-center gap-2">
						<TrendingUp className="h-5 w-5 text-primary" />
						<h3 className="text-lg font-semibold">Next Steps</h3>
					</div>
					<div className="space-y-4">
						<div className="text-center space-y-3">
							<div className="w-16 h-16 bg-accent/20 rounded-full mx-auto flex items-center justify-center">
								<Play className="h-8 w-8 text-accent" />
							</div>
							<div>
								<h4 className="font-semibold">Business Email Assessment</h4>
								<p className="text-sm text-muted-foreground">
									Ready for your next challenge?
								</p>
							</div>
						</div>
						<Button variant="accent" size="lg" className="w-full">
							Start Assessment
						</Button>
						<div className="text-center">
							<p className="text-xs text-muted-foreground">
								Estimated time: 25 minutes
							</p>
						</div>
					</div>
				</GlassCard>
			</div>
		</div>
	);
}
