import { cors } from '../_shared/cors.js'
import { supabase } from '../_shared/supabaseClient.js'

const BREVO_API_KEY = Deno.env.get("BREVO_API_KEY");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface EmailRequest {
  invitationId: string;
  propertyName: string;
  inviteeEmail: string;
  inviterName: string;
}

const authClient = supabase.auth.admin

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response('ok', { headers: cors })
  }

  try {
    const { property_id, invitee_email, role } = await req.json()

    // 招待されるユーザーのIDを取得
    const { data: inviteeUser, error: userError } = await authClient.getUserByEmail(invitee_email)
    if (userError) {
      return new Response(JSON.stringify({ error: '招待ユーザーが見つかりません' }), {
        headers: { ...cors, 'Content-Type': 'application/json' },
        status: 400,
      })
    }
    const invitee_id = inviteeUser.user.id

    // 招待を作成
    const { error: invitationError } = await supabase
      .from('property_shares')
      .insert({ property_id, user_id: invitee_id, role })

    if (invitationError) {
      return new Response(JSON.stringify({ error: '招待の作成に失敗しました' }), {
        headers: { ...cors, 'Content-Type': 'application/json' },
        status: 500,
      })
    }

    return new Response(
      JSON.stringify({ message: '招待を送信しました' }),
      { headers: { ...cors, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...cors, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
}

Deno.serve(handler)