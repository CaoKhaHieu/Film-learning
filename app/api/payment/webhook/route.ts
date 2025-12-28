import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

// Initialize Supabase Admin Client (Service Role)
// We need service role to update tables without RLS restrictions for webhooks
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  try {
    // This webhook structure is compatible with SePay/Casso
    // They usually send JSON body with: { content, amount, gateway, transactionDate, ... }
    const body = await req.json();
    const { content, amount, gateway, id } = body;

    console.log("Received webhook:", body);

    if (!content || !amount) {
      return NextResponse.json({ error: "Invalid webhook data" }, { status: 400 });
    }

    // Extract payment code from content (e.g., "VIP12345" from "VIP12345 NGUYEN VAN A")
    // We look for the pattern VIP + 6 chars
    const match = content.match(/VIP[A-Z0-9]{6}/);
    if (!match) {
      return NextResponse.json({ error: "Payment code not found in content" }, { status: 400 });
    }

    const paymentCode = match[0];

    // Find the transaction
    const { data: transaction, error: txError } = await supabaseAdmin
      .from("transactions")
      .select("*")
      .eq("payment_code", paymentCode)
      .eq("status", "pending")
      .single();

    if (txError || !transaction) {
      console.error("Transaction not found or already processed:", paymentCode);
      return NextResponse.json({ error: "Transaction not found" }, { status: 404 });
    }

    // Verify amount (allow small difference for fees if necessary, but here we expect exact)
    // In production, be careful with float comparison
    if (parseFloat(amount) < parseFloat(transaction.amount)) {
      return NextResponse.json({ error: "Insufficient amount" }, { status: 400 });
    }

    // 1. Update Transaction Status
    const { error: updateError } = await supabaseAdmin
      .from("transactions")
      .update({
        status: "completed",
        gateway_transaction_id: id || gateway,
        updated_at: new Date().toISOString(),
      })
      .eq("id", transaction.id);

    if (updateError) {
      console.error("Failed to update transaction:", updateError);
      return NextResponse.json({ error: "Database error" }, { status: 500 });
    }

    // 2. Activate Subscription
    // Calculate end date based on plan
    let endDate = null;
    const now = new Date();

    if (transaction.plan === "monthly") {
      now.setMonth(now.getMonth() + 1);
      endDate = now.toISOString();
    } else if (transaction.plan === "yearly") {
      now.setFullYear(now.getFullYear() + 1);
      endDate = now.toISOString();
    }
    // lifetime -> endDate remains null

    // Check if user already has a subscription
    const { data: existingSub } = await supabaseAdmin
      .from("subscriptions")
      .select("*")
      .eq("user_id", transaction.user_id)
      .single();

    if (existingSub) {
      // Update existing
      await supabaseAdmin
        .from("subscriptions")
        .update({
          plan: "vip",
          status: "active",
          start_date: new Date().toISOString(),
          end_date: endDate,
        })
        .eq("id", existingSub.id);
    } else {
      // Create new
      await supabaseAdmin
        .from("subscriptions")
        .insert({
          user_id: transaction.user_id,
          plan: "vip",
          status: "active",
          start_date: new Date().toISOString(),
          end_date: endDate,
        });
    }

    return NextResponse.json({ success: true, message: "Payment processed successfully" });

  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
