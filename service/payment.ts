"use server";

import { createClient } from "@/lib/supabase-server";

export async function createTransaction(plan: string, amount: number) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { error: "Unauthorized" };
    }

    if (!plan || !amount) {
      return { error: "Missing required fields" };
    }

    // Generate a unique payment code
    // Format: VIP + Random 6 chars (uppercase alphanumeric)
    const randomCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    const paymentCode = `VIP${randomCode}`;

    // Create pending transaction
    const { data: transaction, error } = await supabase
      .from("transactions")
      .insert({
        user_id: user.id,
        amount: amount,
        plan: plan,
        status: "pending",
        payment_code: paymentCode,
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating transaction:", error);
      return { error: "Failed to create transaction" };
    }

    return {
      paymentCode: paymentCode,
      transactionId: transaction.id
    };

  } catch (error) {
    console.error("Internal error:", error);
    return { error: "Internal server error" };
  }
}

export async function checkTransactionStatus(code: string) {
  try {
    if (!code) {
      return { error: "Missing code" };
    }

    const supabase = await createClient();

    // Check transaction status
    const { data: transaction, error } = await supabase
      .from("transactions")
      .select("status")
      .eq("payment_code", code)
      .single();

    if (error || !transaction) {
      return { status: "not_found" };
    }

    return { status: transaction.status };

  } catch (error) {
    console.error("Check status error:", error);
    return { error: "Internal error" };
  }
}
