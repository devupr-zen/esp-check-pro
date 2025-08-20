import {
	Calendar,
	CreditCard,
	DollarSign,
	Download,
	TrendingUp,
	Users,
} from "lucide-react";
import { GlassCard } from "@/components/reusable/GlassCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function TeacherBilling() {
	const subscriptionData = {
		plan: "Professional",
		status: "Active",
		nextBilling: "2024-02-15",
		amount: "$49.99",
		students: 50,
		assessments: "Unlimited",
	};

	const invoices = [
		{
			id: "INV-2024-001",
			date: "2024-01-15",
			amount: "$49.99",
			status: "Paid",
			description: "Professional Plan - Monthly",
		},
		{
			id: "INV-2023-012",
			date: "2023-12-15",
			amount: "$49.99",
			status: "Paid",
			description: "Professional Plan - Monthly",
		},
		{
			id: "INV-2023-011",
			date: "2023-11-15",
			amount: "$49.99",
			status: "Paid",
			description: "Professional Plan - Monthly",
		},
	];

	const usageStats = [
		{
			label: "Students",
			current: 42,
			limit: 50,
			icon: Users,
			color: "primary",
		},
		{
			label: "Assessments Created",
			current: 23,
			limit: "Unlimited",
			icon: TrendingUp,
			color: "accent",
		},
	];

	const getStatusColor = (status: string) => {
		return status === "Paid"
			? "bg-primary/20 text-primary"
			: "bg-destructive/20 text-destructive";
	};

	return (
		<div className="p-6 space-y-6">
			<div className="flex flex-col space-y-2">
				<h1 className="text-3xl font-bold text-foreground">
					Billing & Subscription
				</h1>
				<p className="text-muted-foreground">
					Manage your subscription and billing information
				</p>
			</div>

			<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
				{/* Subscription Overview */}
				<div className="lg:col-span-2">
					<GlassCard className="p-6">
						<h3 className="text-lg font-semibold text-foreground mb-4">
							Current Subscription
						</h3>

						<div className="flex items-center justify-between mb-6">
							<div>
								<h4 className="text-2xl font-bold text-foreground">
									{subscriptionData.plan}
								</h4>
								<div className="flex items-center gap-2 mt-1">
									<Badge className="bg-primary/20 text-primary">
										{subscriptionData.status}
									</Badge>
									<span className="text-sm text-muted-foreground">
										Next billing: {subscriptionData.nextBilling}
									</span>
								</div>
							</div>
							<div className="text-right">
								<p className="text-2xl font-bold text-foreground">
									{subscriptionData.amount}
								</p>
								<p className="text-sm text-muted-foreground">per month</p>
							</div>
						</div>

						<div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
							<div className="p-4 rounded-lg bg-primary/10">
								<div className="flex items-center gap-2 mb-2">
									<Users className="h-5 w-5 text-primary" />
									<span className="font-medium text-foreground">Students</span>
								</div>
								<p className="text-lg font-bold text-foreground">
									Up to {subscriptionData.students}
								</p>
							</div>
							<div className="p-4 rounded-lg bg-accent/10">
								<div className="flex items-center gap-2 mb-2">
									<TrendingUp className="h-5 w-5 text-accent" />
									<span className="font-medium text-foreground">
										Assessments
									</span>
								</div>
								<p className="text-lg font-bold text-foreground">
									{subscriptionData.assessments}
								</p>
							</div>
						</div>

						<div className="flex gap-3">
							<Button variant="outline">Change Plan</Button>
							<Button variant="outline">Update Payment Method</Button>
						</div>
					</GlassCard>
				</div>

				{/* Usage Statistics */}
				<div>
					<GlassCard className="p-6">
						<h3 className="text-lg font-semibold text-foreground mb-4">
							Usage This Month
						</h3>

						<div className="space-y-4">
							{usageStats.map((stat, index) => (
								<div key={index} className="space-y-2">
									<div className="flex items-center justify-between">
										<div className="flex items-center gap-2">
											<stat.icon className={`h-4 w-4 text-${stat.color}`} />
											<span className="text-sm font-medium text-foreground">
												{stat.label}
											</span>
										</div>
										<span className="text-sm text-muted-foreground">
											{stat.current}/{stat.limit}
										</span>
									</div>
									{typeof stat.limit === "number" && (
										<div className="w-full bg-muted rounded-full h-2">
											<div
												className={`bg-${stat.color} h-2 rounded-full transition-all duration-300`}
												style={{
													width: `${(stat.current / stat.limit) * 100}%`,
												}}
											></div>
										</div>
									)}
								</div>
							))}
						</div>
					</GlassCard>
				</div>
			</div>

			{/* Payment Method */}
			<GlassCard className="p-6">
				<h3 className="text-lg font-semibold text-foreground mb-4">
					Payment Method
				</h3>

				<div className="flex items-center justify-between p-4 rounded-lg border border-border">
					<div className="flex items-center gap-3">
						<div className="p-2 rounded-lg bg-primary/10">
							<CreditCard className="h-5 w-5 text-primary" />
						</div>
						<div>
							<p className="font-medium text-foreground">•••• •••• •••• 4242</p>
							<p className="text-sm text-muted-foreground">Expires 12/25</p>
						</div>
					</div>
					<Button variant="outline" size="sm">
						Update
					</Button>
				</div>
			</GlassCard>

			{/* Billing History */}
			<GlassCard className="p-6">
				<div className="flex items-center justify-between mb-4">
					<h3 className="text-lg font-semibold text-foreground">
						Billing History
					</h3>
					<Button variant="outline" size="sm">
						<Download className="h-4 w-4 mr-2" />
						Download All
					</Button>
				</div>

				<div className="space-y-3">
					{invoices.map((invoice) => (
						<div
							key={invoice.id}
							className="flex items-center justify-between p-4 rounded-lg border border-border"
						>
							<div className="flex items-center gap-4">
								<div className="p-2 rounded-lg bg-accent/10">
									<DollarSign className="h-4 w-4 text-accent" />
								</div>
								<div>
									<p className="font-medium text-foreground">
										{invoice.description}
									</p>
									<div className="flex items-center gap-2 text-sm text-muted-foreground">
										<Calendar className="h-3 w-3" />
										{invoice.date}
										<span>•</span>
										<span>{invoice.id}</span>
									</div>
								</div>
							</div>

							<div className="flex items-center gap-3">
								<Badge className={getStatusColor(invoice.status)}>
									{invoice.status}
								</Badge>
								<span className="font-semibold text-foreground">
									{invoice.amount}
								</span>
								<Button variant="ghost" size="sm">
									<Download className="h-4 w-4" />
								</Button>
							</div>
						</div>
					))}
				</div>
			</GlassCard>
		</div>
	);
}
