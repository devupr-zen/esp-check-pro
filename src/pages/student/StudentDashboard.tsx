import React, { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { requireRole } from "@/components/auth/RouteGuard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/lib/supabase";

type ClassRow = {
	id: string;
	name: string;
	level: string | null;
	created_at: string;
	updated_at: string;
};
type AssignmentRow = {
	id: string;
	assessment_id: string;
	class_id: string | null;
	user_id: string | null;
	opens_at: string | null;
	due_at: string | null;
	created_at: string;
	assessments?: { title: string } | { title: string }[] | null;
};

function StudentDashboardInner() {
	const { user } = useAuth();
	const [classes, setClasses] = useState<ClassRow[]>([]);
	const [assignments, setAssignments] = useState<AssignmentRow[]>([]);
	const [loading, setLoading] = useState(true);
	const [invite, setInvite] = useState("");

	async function loadClasses() {
		// RLS lets students read only their classes
		const { data, error } = await supabase
			.from("classes")
			.select("id,name,level,created_at,updated_at")
			.order("created_at", { ascending: false });
		if (error) throw error;
		setClasses(data || []);
	}

	async function loadAssignments() {
		// This section is optional; skip if table missing.
		try {
			// Personal assignments
			const direct = await supabase
				.from("assessment_assignments")
				.select(
					"id,assessment_id,class_id,user_id,opens_at,due_at,created_at,assessments(title)",
				)
				.eq("user_id", user.id);

			if (direct.error && direct.error.code === "42P01") {
				// assignments table not present — silently ignore
				setAssignments([]);
				return;
			}
			if (direct.error) throw direct.error;

			// Class-based assignments (if any classes)
			let classBased: AssignmentRow[] = [];
			if ((classes?.length || 0) > 0) {
				const classIds = classes.map((c) => c.id);
				const res = await supabase
					.from("assessment_assignments")
					.select(
						"id,assessment_id,class_id,user_id,opens_at,due_at,created_at,assessments(title)",
					)
					.in("class_id", classIds);
				if (res.error) throw res.error;
				classBased = (res.data || []) as any;
			}

			// Merge + sort by due date (soonest first), fall back to opens_at/created_at
			const merged = [...(direct.data || []), ...classBased];
			const unique = new Map<string, AssignmentRow>();
			merged.forEach((a) => unique.set(a.id, a));
			const list = Array.from(unique.values()).sort((a, b) => {
				const da = new Date(a.due_at || a.opens_at || a.created_at).getTime();
				const db = new Date(b.due_at || b.opens_at || b.created_at).getTime();
				return da - db;
			});
			setAssignments(list);
		} catch (e) {
			console.warn("Assignments load skipped:", (e as any).message);
			setAssignments([]);
		}
	}

	async function reload() {
		setLoading(true);
		try {
			await loadClasses();
		} catch (e) {
			alert((e as any).message);
		}
		try {
			await loadAssignments();
		} finally {
			setLoading(false);
		}
	}

	useEffect(() => {
		reload();
	}, []);
	useEffect(() => {
		if (!loading) loadAssignments();
	}, [classes]); // refresh assignments after classes load

	async function redeem() {
		const code = invite.trim().toUpperCase();
		if (!code) return;
		const { data, error } = await supabase.rpc("redeem_class_invite", {
			p_code: code,
		});
		if (error) return alert(error.message);
		setInvite("");
		await reload();
		alert(`Joined class: ${data?.[0]?.class_name ?? "Success"}`);
	}

	const emptyState = !loading && classes.length === 0;

	return (
		<div className="space-y-6">
			<h1 className="text-xl font-semibold">Welcome</h1>

			{/* Join with code */}
			<Card>
				<CardHeader>
					<CardTitle>Join a class</CardTitle>
				</CardHeader>
				<CardContent className="flex flex-col gap-3 sm:flex-row">
					<Input
						value={invite}
						onChange={(e) => setInvite(e.target.value)}
						placeholder="Enter invite code (e.g., 8-CHAR)"
						className="sm:max-w-xs uppercase"
					/>
					<Button onClick={redeem} disabled={!invite.trim()}>
						Apply code
					</Button>
				</CardContent>
			</Card>

			{/* My Classes */}
			<Card>
				<CardHeader>
					<CardTitle>My classes</CardTitle>
				</CardHeader>
				<CardContent>
					{loading ? (
						<div className="text-sm text-muted-foreground">Loading…</div>
					) : classes.length === 0 ? (
						<div className="text-sm text-muted-foreground">
							You are not in any class yet. Use an invite code above.
						</div>
					) : (
						<div className="grid gap-3 md:grid-cols-2">
							{classes.map((c) => (
								<div key={c.id} className="rounded-md border p-3">
									<div className="font-medium">{c.name}</div>
									<div className="text-xs text-muted-foreground">
										Level: {c.level || "—"}
									</div>
									<div className="text-xs text-muted-foreground">
										Joined / Updated:{" "}
										{new Date(c.updated_at).toLocaleDateString()}
									</div>
								</div>
							))}
						</div>
					)}
				</CardContent>
			</Card>

			{/* Upcoming Assignments (if assignments table exists) */}
			<Card>
				<CardHeader>
					<CardTitle>Upcoming assignments</CardTitle>
				</CardHeader>
				<CardContent>
					{loading ? (
						<div className="text-sm text-muted-foreground">Loading…</div>
					) : assignments.length === 0 ? (
						<div className="text-sm text-muted-foreground">
							No assignments yet.
						</div>
					) : (
						<div className="space-y-2">
							{assignments.map((a) => {
								const cls = a.class_id
									? classes.find((c) => c.id === a.class_id)
									: null;
								const due = a.due_at
									? new Date(a.due_at).toLocaleString()
									: "—";
								return (
									<div key={a.id} className="rounded-md border p-3">
										<div className="flex items-center justify-between">
											<div className="font-medium">
												{(Array.isArray(a.assessments)
													? a.assessments[0]?.title
													: a.assessments?.title) || "Assessment"}
											</div>
											<div className="text-xs text-muted-foreground">
												Due: {due}
											</div>
										</div>
										<Separator className="my-2" />
										<div className="text-xs text-muted-foreground">
											{a.class_id ? (
												<>Class: {cls?.name || a.class_id}</>
											) : (
												<>Personal assignment</>
											)}
										</div>
									</div>
								);
							})}
						</div>
					)}
				</CardContent>
			</Card>

			{emptyState && (
				<div className="rounded-md border p-4 text-sm">
					No classes? Ask your teacher for an invite link or code.
				</div>
			)}
		</div>
	);
}

// Guard page
export default requireRole("student")(StudentDashboardInner);
