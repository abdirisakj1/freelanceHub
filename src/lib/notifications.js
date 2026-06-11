import supabase from "./supabase";

export async function createNotification({
  userId,
  senderId,
  title,
  message,
  type,
  jobId,
}) {
  console.log("🔔 Creating notification with data:", { userId, senderId, title, message, type, jobId });
  
  if (!userId) {
    console.error("❌ userId is missing!");
    throw new Error("userId is required for notification");
  }
  
  const notificationData = {
    user_id: userId,
    title,
    message,
    type,
    is_read: false,
  };
  
  // Only add sender_id if provided
  if (senderId) {
    notificationData.sender_id = senderId;
  }
  
  // Only add job_id if provided
  if (jobId) {
    notificationData.job_id = jobId;
  }

  console.log("📤 Sending to Supabase:", notificationData);

  const { data, error } = await supabase
    .from("notifications")
    .insert([notificationData])
    .select()
    .single();

  if (error) {
    console.error("❌ Supabase error:", error);
    throw error;
  }
  
  console.log("✅ Notification created:", data);
  return data;
}

export async function getNotifications(userId) {
  const { data, error } = await supabase
    .from("notifications")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data;
}

export async function getUnreadNotifications(userId) {
  const { data, error } = await supabase
    .from("notifications")
    .select("*")
    .eq("user_id", userId)
    .eq("is_read", false)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data;
}

export async function getUnreadCount(userId) {
  const { count, error } = await supabase
    .from("notifications")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("is_read", false);

  if (error) throw error;
  return count;
}

export async function markNotificationAsRead(notificationId) {
  const { data, error } = await supabase
    .from("notifications")
    .update({ is_read: true })
    .eq("id", notificationId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function markAllNotificationsAsRead(userId) {
  const { error } = await supabase
    .from("notifications")
    .update({ is_read: true })
    .eq("user_id", userId)
    .eq("is_read", false);

  if (error) throw error;
}

export async function deleteNotification(notificationId) {
  const { error } = await supabase
    .from("notifications")
    .delete()
    .eq("id", notificationId);

  if (error) throw error;
}

export function subscribeToNotifications(userId, callback) {
  const channel = supabase
    .channel(`notifications:${userId}`)
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "notifications",
        filter: `user_id=eq.${userId}`,
      },
      callback
    )
    .subscribe((status) => {
      console.log(`Notification subscription status for ${userId}:`, status);
    });

  return () => {
    console.log("Unsubscribing from notifications:", userId);
    supabase.removeChannel(channel);
  };
}

export async function notifyJobApplication({
  employerId,
  applicantName,
  jobTitle,
  senderId,
  jobId,
}) {
  return createNotification({
    userId: employerId,
    senderId,
    title: "New Application",
    message: `${applicantName} applied for "${jobTitle}"`,
    type: "application",
    jobId,
  });
}

export async function notifyNewMessage({
  recipientId,
  senderName,
  jobTitle,
  senderId,
  jobId,
}) {
  return createNotification({
    userId: recipientId,
    senderId,
    title: "New Message",
    message: `You have a new message from ${senderName} regarding "${jobTitle}"`,
    type: "message",
    jobId,
  });
}

export async function notifyApplicationAccepted({
  applicantId,
  jobTitle,
  employerName,
  senderId,
  jobId,
}) {
  return createNotification({
    userId: applicantId,
    senderId,
    title: "Application Accepted",
    message: `Your application for "${jobTitle}" has been accepted by ${employerName}`,
    type: "acceptance",
    jobId,
  });
}
