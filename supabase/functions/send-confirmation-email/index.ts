
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface ConfirmationEmailRequest {
  email: string;
  fullName: string;
  venueName: string;
  confirmationUrl: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, fullName, venueName, confirmationUrl }: ConfirmationEmailRequest = await req.json();

    const emailResponse = await resend.emails.send({
      from: "VR Kiosk Admin <onboarding@resend.dev>",
      to: [email],
      subject: "Confirm Your VR Kiosk Admin Account",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #2563eb; margin-bottom: 10px;">Welcome to VR Kiosk Admin</h1>
            <p style="color: #666; font-size: 16px;">Confirm your admin account for ${venueName}</p>
          </div>
          
          <div style="background: #f8fafc; padding: 30px; border-radius: 8px; margin-bottom: 30px;">
            <h2 style="color: #1e293b; margin-bottom: 15px;">Hello ${fullName}!</h2>
            <p style="color: #475569; line-height: 1.6; margin-bottom: 25px;">
              Thank you for creating your admin account for <strong>${venueName}</strong>. 
              To complete your registration and start managing your VR kiosk, please confirm your email address.
            </p>
            
            <div style="text-align: center;">
              <a href="${confirmationUrl}" 
                 style="background: #2563eb; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: 600; display: inline-block;">
                Confirm Your Account
              </a>
            </div>
          </div>
          
          <div style="border-top: 1px solid #e2e8f0; padding-top: 20px;">
            <p style="color: #64748b; font-size: 14px; line-height: 1.5;">
              If you didn't create this account, you can safely ignore this email.
              <br><br>
              If you're having trouble with the button above, copy and paste this URL into your browser:
              <br>
              <a href="${confirmationUrl}" style="color: #2563eb; word-break: break-all;">${confirmationUrl}</a>
            </p>
          </div>
          
          <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0;">
            <p style="color: #94a3b8; font-size: 12px;">
              © 2024 VR Kiosk Admin. All rights reserved.
            </p>
          </div>
        </div>
      `,
    });

    console.log("Confirmation email sent successfully:", emailResponse);

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-confirmation-email function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
