import { ArrowLeft, Eye, EyeOff, Key, Lock, Mail, User } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/ui/GlassCard"; // stable path
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";

type AuthStep = "signin" | "newPassword" | "reset";

// RPC return row shape
type ValidateInviteRow = {
	ok: boolean;
	invite_id: string | null;
	expires_at: string | null;
};

export default function TeacherAuth() {
	const [step, setStep] = useState<AuthStep>("signin");
	const [loading, setLoading] = useState(false);
	const [showInvite, setShowInvite] = useState(false);
	const [showNewPassword, setShowNewPassword] = useState(false);
	const [showConfirmPassword, setShowConfirmPassword] = useState(false);

	const [formData, setFormData] = useState({
		email: "",
		inviteCode: "", // ← renamed from prePassword
		newPassword: "",
		confirmPassword: "",
		firstName: "",
		lastName: "",
	});

	const [tempUserData, setTempUserData] = useState<{
		id: string;
		expires_at: string | null;
	} | null>(null);
	const navigate = useNavigate();
	const { toast } = useToast();
	const [params] = useSearchParams();

	const redirectBase = `${window.location.origin}/auth/callback`;
	const teacherHome = "/teacher";

	async function upsertTeacherProfile(userId: string, _email: string | null) {
		await supabase.from("profiles").upsert(
			{
				id: userId,
				role: "teacher",
				full_name:
					[formData.firstName, formData.lastName].filter(Boolean).join(" ") ||
					null,
			},
			{ onConflict: "id" },
		);
	}

	useEffect(() => {
		const intended = params.get("returnTo");
		localStorage.setItem("upraizenRole", "teacher");
		if (intended) localStorage.setItem("returnTo", intended);

		(async () => {
			const {
				data: { session },
			} = await supabase.auth.getSession();
			if (!session) return;

			const { data: profile } = await supabase
				.from("profiles")
				.select("role, password_changed")
				.eq("id", session.user.id)
				.single();

			if (profile?.role !== "teacher") {
				await upsertTeacherProfile(session.user.id, session.user.email);
			}

			if (
				profile &&
				profile.role === "teacher" &&
				profile.password_changed === false
			) {
				setStep("newPassword");
				return;
			}

			const returnTo = localStorage.getItem("returnTo");
			if (returnTo && returnTo.startsWith("/teacher")) {
				navigate(returnTo, { replace: true });
				localStorage.removeItem("returnTo");
			} else {
				navigate(teacherHome, { replace: true });
			}
		})();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	// Step 1: validate invite (email + invite_code not used & not expired)
	const handleInviteCheck = async (e: React.FormEvent) => {
		e.preventDefault();
		setLoading(true);
		try {
			// No generic on .rpc — cast the response after
			const rpc = await supabase.rpc("validate_teacher_invite", {
				p_email: formData.email,
				p_code: formData.inviteCode,
			});

			const rows = (rpc.data ?? []) as ValidateInviteRow[];
			const row = rows[0];

			if (rpc.error || !row || !row.ok || !row.invite_id) {
				toast({
					title: "Invalid invite",
					description: "Check your email and invite code.",
					variant: "destructive",
				});
				return;
			}

			// Extra expiry guard in UI (server already checks)
			if (row.expires_at && new Date(row.expires_at) < new Date()) {
				toast({
					title: "Invite expired",
					description: "Ask your admin for a new invite code.",
					variant: "destructive",
				});
				return;
			}

			setTempUserData({ id: row.invite_id, expires_at: row.expires_at });
			setStep("newPassword");
			toast({
				title: "Invite verified",
				description: "Set your new password to continue.",
			});
		} catch (err) {
			const msg = err instanceof Error ? err.message : "Unexpected error";
			toast({ title: "Error", description: msg, variant: "destructive" });
		} finally {
			setLoading(false);
		}
	};

	// Step 2: create account (first-time) OR update password for existing
	const handleNewPasswordSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setLoading(true);

		try {
			if (formData.newPassword !== formData.confirmPassword) {
				toast({
					title: "Passwords don't match",
					description: "Please make sure both passwords are identical.",
					variant: "destructive",
				});
				return;
			}

			if (tempUserData) {
				// First-time: sign up + upsert profile + mark invite used
				const { data: authData, error: authError } = await supabase.auth.signUp(
					{
						email: formData.email,
						password: formData.newPassword,
						options: {
							emailRedirectTo: `${redirectBase}?returnTo=${encodeURIComponent(teacherHome)}`,
							data: {
								role: "teacher",
								first_name: formData.firstName,
								last_name: formData.lastName,
							},
						},
					},
				);
				if (authError) throw authError;

				if (authData.user) {
					await upsertTeacherProfile(authData.user.id, authData.user.email);
				}

				// Safer via RPC if you prefer: await supabase.rpc('mark_teacher_invite_used', { p_invite_id: tempUserData.id })
				await supabase
					.from("teacher_credentials")
					.update({ is_used: true, used_at: new Date().toISOString() })
					.eq("id", tempUserData.id);

				toast({
					title: "Account created",
					description: "Check your email to verify your account.",
				});
			} else {
				// Existing user changing password (rare path here)
				const { error } = await supabase.auth.updateUser({
					password: formData.newPassword,
				});
				if (error) throw error;

				const {
					data: { session },
				} = await supabase.auth.getSession();
				if (session) {
					await upsertTeacherProfile(session.user.id, session.user.email);
					await supabase
						.from("profiles")
						.update({ password_changed: true })
						.eq("id", session.user.id);
				}

				toast({
					title: "Password updated",
					description: "Your password has been changed.",
				});
			}

			navigate(teacherHome, { replace: true });
		} catch (err) {
			const msg = err instanceof Error ? err.message : "Unexpected error";
			toast({ title: "Error", description: msg, variant: "destructive" });
		} finally {
			setLoading(false);
		}
	};

	// Step 3: reset password
	const handleReset = async (e: React.FormEvent) => {
		e.preventDefault();
		setLoading(true);
		try {
			const { error } = await supabase.auth.resetPasswordForEmail(
				formData.email,
				{
					redirectTo: `${redirectBase}?returnTo=/auth/reset`,
				},
			);
			if (error) throw error;

			toast({
				title: "Reset email sent",
				description: "Check your email for reset instructions.",
			});
		} catch (err) {
			const msg = err instanceof Error ? err.message : "Unexpected error";
			toast({ title: "Error", description: msg, variant: "destructive" });
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="min-h-screen bg-gradient-to-br from-primary/20 via-background to-accent/20 flex">
			{/* Left Panel */}
			<div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary to-accent relative overflow-hidden">
				<div className="absolute inset-0 bg-black/20" />
				<div className="relative z-10 flex flex-col justify-center items-center text-white p-12">
					<h1 className="text-5xl font-bold mb-6">Upraizen ESPCheck Pro</h1>
					<p className="text-xl text-center max-w-md">
						Teacher Portal - Create, manage, and track progress
					</p>
				</div>
			</div>

			{/* Right Panel */}
			<div className="flex-1 flex items-center justify-center p-6">
				<div className="w-full max-w-md">
					<Button
						variant="ghost"
						onClick={() => navigate("/")}
						className="mb-6"
					>
						<ArrowLeft className="w-4 h-4 mr-2" />
						Back to Home
					</Button>

					<GlassCard className="p-8">
						<div className="text-center mb-8">
							<h2 className="text-3xl font-bold text-foreground mb-2">
								{step === "signin" && "Teacher Access"}
								{step === "newPassword" && "Set New Password"}
								{step === "reset" && "Reset Password"}
							</h2>
							<p className="text-muted-foreground">
								{step === "signin" &&
									"Enter your email and invite code to begin"}
								{step === "newPassword" &&
									"Create a secure password for your account"}
								{step === "reset" && "Enter your email to reset your password"}
							</p>
						</div>

						{step === "signin" && (
							<form onSubmit={handleInviteCheck} className="space-y-6">
								<div className="space-y-2">
									<Label htmlFor="email">Email</Label>
									<div className="relative">
										<Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
										<Input
											id="email"
											type="email"
											placeholder="teacher@example.com"
											value={formData.email}
											onChange={(e) =>
												setFormData({ ...formData, email: e.target.value })
											}
											className="pl-10"
											required
										/>
									</div>
								</div>

								<div className="space-y-2">
									<Label htmlFor="inviteCode">Invite Code</Label>
									<div className="relative">
										<Key className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
										<Input
											id="inviteCode"
											type={showInvite ? "text" : "password"}
											placeholder="Paste your invite code"
											value={formData.inviteCode}
											onChange={(e) =>
												setFormData({ ...formData, inviteCode: e.target.value })
											}
											className="pl-10 pr-10"
											required
										/>
										<button
											type="button"
											onClick={() => setShowInvite(!showInvite)}
											className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
										>
											{showInvite ? (
												<EyeOff className="h-4 w-4" />
											) : (
												<Eye className="h-4 w-4" />
											)}
										</button>
									</div>
								</div>

								<Button
									type="submit"
									className="w-full"
									size="lg"
									disabled={loading}
								>
									{loading ? "Verifying..." : "Continue"}
								</Button>

								<div className="text-center">
									<button
										type="button"
										onClick={() => setStep("reset")}
										className="text-sm text-muted-foreground hover:text-foreground"
									>
										Need help accessing your account?
									</button>
								</div>
							</form>
						)}

						{step === "newPassword" && (
							<form onSubmit={handleNewPasswordSubmit} className="space-y-6">
								{tempUserData && (
									<div className="grid grid-cols-2 gap-4">
										<div className="space-y-2">
											<Label htmlFor="firstName">First Name</Label>
											<div className="relative">
												<User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
												<Input
													id="firstName"
													type="text"
													placeholder="John"
													value={formData.firstName}
													onChange={(e) =>
														setFormData({
															...formData,
															firstName: e.target.value,
														})
													}
													className="pl-10"
													required
												/>
											</div>
										</div>
										<div className="space-y-2">
											<Label htmlFor="lastName">Last Name</Label>
											<div className="relative">
												<User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
												<Input
													id="lastName"
													type="text"
													placeholder="Doe"
													value={formData.lastName}
													onChange={(e) =>
														setFormData({
															...formData,
															lastName: e.target.value,
														})
													}
													className="pl-10"
													required
												/>
											</div>
										</div>
									</div>
								)}

								<div className="space-y-2">
									<Label htmlFor="newPassword">New Password</Label>
									<div className="relative">
										<Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
										<Input
											id="newPassword"
											type={showNewPassword ? "text" : "password"}
											placeholder="••••••••"
											value={formData.newPassword}
											onChange={(e) =>
												setFormData({
													...formData,
													newPassword: e.target.value,
												})
											}
											className="pl-10 pr-10"
											required
										/>
										<button
											type="button"
											onClick={() => setShowNewPassword(!showNewPassword)}
											className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
										>
											{showNewPassword ? (
												<EyeOff className="h-4 w-4" />
											) : (
												<Eye className="h-4 w-4" />
											)}
										</button>
									</div>
								</div>

								<div className="space-y-2">
									<Label htmlFor="confirmPassword">Confirm Password</Label>
									<div className="relative">
										<Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
										<Input
											id="confirmPassword"
											type={showConfirmPassword ? "text" : "password"}
											placeholder="••••••••"
											value={formData.confirmPassword}
											onChange={(e) =>
												setFormData({
													...formData,
													confirmPassword: e.target.value,
												})
											}
											className="pl-10 pr-10"
											required
										/>
										<button
											type="button"
											onClick={() =>
												setShowConfirmPassword(!showConfirmPassword)
											}
											className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
										>
											{showConfirmPassword ? (
												<EyeOff className="h-4 w-4" />
											) : (
												<Eye className="h-4 w-4" />
											)}
										</button>
									</div>
								</div>

								<Button
									type="submit"
									className="w-full"
									size="lg"
									disabled={loading}
								>
									{loading ? "Setting Password..." : "Set Password"}
								</Button>
							</form>
						)}

						{step === "reset" && (
							<form onSubmit={handleReset} className="space-y-6">
								<div className="space-y-2">
									<Label htmlFor="resetEmail">Email</Label>
									<div className="relative">
										<Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
										<Input
											id="resetEmail"
											type="email"
											placeholder="teacher@example.com"
											value={formData.email}
											onChange={(e) =>
												setFormData({ ...formData, email: e.target.value })
											}
											className="pl-10"
											required
										/>
									</div>
								</div>

								<Button
									type="submit"
									className="w-full"
									size="lg"
									disabled={loading}
								>
									{loading ? "Sending..." : "Send Reset Email"}
								</Button>

								<div className="text-center">
									<button
										type="button"
										onClick={() => setStep("signin")}
										className="text-sm text-muted-foreground hover:text-foreground"
									>
										Back to sign in
									</button>
								</div>
							</form>
						)}
					</GlassCard>
				</div>
			</div>
		</div>
	);
}
