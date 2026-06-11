import supabase from "./supabase";

export async function getOrCreateConversation({ jobId, employerId, applicantId }) {
  const { data: existing } = await supabase
    .from("conversations")
    .select("*")
    .eq("job_id", jobId)
    .eq("applicant_id", applicantId)
    .maybeSingle();

  if (existing) return existing;

  const { data, error } = await supabase
    .from("conversations")
    .insert({ job_id: jobId, employer_id: employerId, applicant_id: applicantId })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getMessages(conversationId) {
  const { data, error } = await supabase
    .from("messages")
    .select("*, users:sender_id (id, username, avatar_url)")
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: true });

  if (error) throw error;
  return data;
}

export async function sendMessage({ conversationId, senderId, content }) {
  const { data, error } = await supabase
    .from("messages")
    .insert({ conversation_id: conversationId, sender_id: senderId, content })
    .select("*, users:sender_id (id, username, avatar_url)")
    .single();

  if (error) throw error;
  return data;
}

export async function updateMessage(messageId, content) {
  const { data, error } = await supabase
    .from("messages")
    .update({ content, updated_at: new Date().toISOString() })
    .eq("id", messageId)
    .select("*, users:sender_id (id, username, avatar_url)")
    .single();

  if (error) throw error;
  return data;
}

export async function getConversationsByJobId(jobId) {
  const { data, error } = await supabase
    .from("conversations")
    .select("*")
    .eq("job_id", jobId);

  if (error) throw error;
  return data;
}

export function subscribeToMessages(conversationId, callback) {
  const channel = supabase
    .channel(`messages:${conversationId}`)
    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "messages",
        filter: `conversation_id=eq.${conversationId}`,
      },
      async (payload) => {
        const { data } = await supabase
          .from("messages")
          .select("*, users:sender_id (id, username, avatar_url)")
          .eq("id", payload.new.id)
          .single();

        if (data) callback(data);
      }
    )
    .subscribe();

  return () => supabase.removeChannel(channel);
}
