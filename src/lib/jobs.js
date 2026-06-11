import supabase from "./supabase";

const JOB_SELECT = `
  *,
  users:created_by (id, username, avatar_url, bio)
`;

export async function getAllJobs() {
  const { data, error } = await supabase
    .from("jobs")
    .select(JOB_SELECT)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data;
}

export async function getJobById(id) {
  const { data, error } = await supabase
    .from("jobs")
    .select(JOB_SELECT)
    .eq("id", id)
    .single();

  if (error) throw error;
  return data;
}

export async function getJobsByUser(userId) {
  const { data, error } = await supabase
    .from("jobs")
    .select(JOB_SELECT)
    .eq("created_by", userId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data;
}

export async function createJob(job) {
  const { data, error } = await supabase
    .from("jobs")
    .insert(job)
    .select(JOB_SELECT)
    .single();

  if (error) throw error;
  return data;
}

export async function updateJob(id, updates) {
  const { data, error } = await supabase
    .from("jobs")
    .update(updates)
    .eq("id", id)
    .select(JOB_SELECT)
    .single();

  if (error) throw error;
  return data;
}

export async function deleteJob(id) {
  const { error } = await supabase.from("jobs").delete().eq("id", id);
  if (error) throw error;
}
