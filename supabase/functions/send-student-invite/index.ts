import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
	"Access-Control-Allow-Origin": "*",
	"Access-Control-Allow-Headers":
		"authorization, x-client-info, apikey, content-type",
};

interface StudentInviteRequest {
	studentName: string;
	email: string;
	inviteCode: string;
	className: string;
	teacherName: string;
}

const handler = async (req: Request): Promise<Response> => {
	if (req.method === "OPTIONS") {
		return new Response(null, { headers: corsHeaders });
	}

	try {
		const {
			studentName,
			email,
			inviteCode,
			className,
			teacherName,
		}: StudentInviteRequest = await req.json();

		const inviteUrl = `${Deno.env.get("SUPABASE_URL")?.replace("pmhlsouvemmzhxhsslfm.supabase.co", "pmhlsouvemmzhxhsslfm.lovable.app")}/auth/student?code=${inviteCode}`;

		const emailResponse = await resend.emails.send({
			from: "English Learning Platform <onboarding@resend.dev>",
			to: [email],
			subject: `You're invited to join ${className}!`,
			html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #2563eb; text-align: center;">You're Invited!</h1>
          
          <p>Hi ${studentName},</p>
          
          <p>${teacherName} has invited you to join their English class: <strong>${className}</strong></p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${inviteUrl}" 
               style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">
              Join Class
            </a>
          </div>
          
          <p style="color: #666; font-size: 14px;">
            If the button doesn't work, copy and paste this link into your browser:<br>
            <a href="${inviteUrl}">${inviteUrl}</a>
          </p>
          
          <p style="color: #666; font-size: 14px;">
            This invitation will expire in 30 days. If you didn't expect this invitation, you can safely ignore this email.
          </p>
          
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
          
          <p style="color: #999; font-size: 12px; text-align: center;">
            English Learning Platform<br>
            Powered by AI-driven assessments
          </p>
        </div>
      `,
		});

		console.log("Student invite email sent successfully:", emailResponse);

		return new Response(JSON.stringify(emailResponse), {
			status: 200,
			headers: {
				"Content-Type": "application/json",
				...corsHeaders,
			},
		});
	} catch (error: any) {
		console.error("Error in send-student-invite function:", error);
		return new Response(JSON.stringify({ error: error.message }), {
			status: 500,
			headers: { "Content-Type": "application/json", ...corsHeaders },
		});
	}
};

serve(handler);
