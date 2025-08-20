import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/components/auth/AuthProvider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/lib/supabase";

type ClassRow = {
	id: string;
	name: string;
	level: string | null;
	created_at: string;
	updated_at: string;
	class_members?: { count: number }[];
};

export default function ClassesList() {
	const { user } = useAuth();
	const nav = useNavigate();
	const [rows, setRows] = useState<ClassRow[]>([]);
	const [loading, setLoading] = useState(true);
	const [q, setQ] = useState("");

	async function load() {
		setLoading(true);
		const { data, error } = await supabase
			.from("classes")
			.select("id,name,level,created_at,updated_at,class_members(count)")
			.order("created_at", { ascending: false });
		if (error) {
			alert(error.message);
		} else {
			setRows(data as any);
		}
		setLoading(false);
	}

	useEffect(() => {
		load();
	}, []);

	const filtered = useMemo(() => {
		const t = q.trim().toLowerCase();
		if (!t) return rows;
		return rows.filter(
			(r) =>
				r.name.toLowerCase().includes(t) ||
				(r.level || "").toLowerCase().includes(t),
		);
	}, [rows, q]);

	async function onDelete(id: string) {
		if (
			!confirm(
				"Delete this class? Students will be removed from this class (their accounts remain).",
			)
		)
			return;
		const { error } = await supabase.from("classes").delete().eq("id", id);
		if (error) return alert(error.message);
		setRows((rows) => rows.filter((r) => r.id !== id));
	}

	return (
		<div className="space-y-4">
			<div className="flex items-center justify-between">
				<h1 className="text-xl font-semibold">Classes</h1>
				<Button onClick={() => nav("/teacher/classes/new")}>New class</Button>
			</div>

			<div className="flex items-center gap-2">
				<Input
					placeholder="Search by name or level…"
					value={q}
					onChange={(e) => setQ(e.target.value)}
					className="max-w-sm"
				/>
				<Button variant="outline" onClick={load}>
					Refresh
				</Button>
			</div>

			{loading ? (
				<div className="text-sm text-muted-foreground">Loading…</div>
			) : filtered.length === 0 ? (
				<div className="rounded-md border p-6 text-sm text-muted-foreground">
					No classes yet. Create your first class.
				</div>
			) : (
				<div className="overflow-x-auto rounded-md border">
					<table className="w-full text-sm">
						<thead className="bg-muted/50 text-left">
							<tr>
								<th className="p-3 font-medium">Name</th>
								<th className="p-3 font-medium">Level</th>
								<th className="p-3 font-medium">Students</th>
								<th className="p-3 font-medium">Updated</th>
								<th className="p-3"></th>
							</tr>
						</thead>
						<tbody>
							{filtered.map((r) => {
								const count = r.class_members?.[0]?.count ?? 0;
								return (
									<tr key={r.id} className="border-t">
										<td className="p-3">{r.name}</td>
										<td className="p-3">{r.level || "-"}</td>
										<td className="p-3">{count}</td>
										<td className="p-3">
											{new Date(r.updated_at).toLocaleString()}
										</td>
										<td className="p-3 text-right">
											<Link
												to={`/teacher/classes/${r.id}`}
												className="mr-2 underline"
											>
												Edit
											</Link>
											<button
												onClick={() => onDelete(r.id)}
												className="text-destructive underline"
											>
												Delete
											</button>
										</td>
									</tr>
								);
							})}
						</tbody>
					</table>
				</div>
			)}
		</div>
	);
}
