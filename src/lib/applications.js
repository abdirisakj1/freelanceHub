import supabase from "./supabase";

const APP_SELECT = `
  *,
  jobs (
    id, title, description, budget, deadline, category, image_url, created_by,
    users:created_by (id, username, avatar_url, bio)
  ),
  users:applicant_id (id, username, avatar_url, bio)
`;

export async function createApplication(application) {
  const { data, error } = await supabase
    .from("applications")
    .insert(application)
    .select(APP_SELECT)
    .single();

  if (error) throw error;
  return data;
}

export async function getApplicationsByJob(jobId) {
  const { data, error } = await supabase
    .from("applications")
    .select(APP_SELECT)
    .eq("job_id", jobId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data;
}

export async function getApplicationsForEmployer(userId) {
  const { data, error } = await supabase
    .from("applications")
    .select(APP_SELECT)
    .eq("jobs.created_by", userId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data;
}

export async function getEmployerApplications(userId) {
  const { data: jobs, error: jobsError } = await supabase
    .from("jobs")
    .select("id")
    .eq("created_by", userId);

  if (jobsError) throw jobsError;
  if (!jobs?.length) return [];

  const jobIds = jobs.map((j) => j.id);

  const { data, error } = await supabase
    .from("applications")
    .select(APP_SELECT)
    .in("job_id", jobIds)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data;
}

export async function getApplicationsByApplicant(userId) {
  const { data, error } = await supabase
    .from("applications")
    .select(APP_SELECT)
    .eq("applicant_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data;
}

export async function hasApplied(jobId, userId) {
  const { data, error } = await supabase
    .from("applications")
    .select("id")
    .eq("job_id", jobId)
    .eq("applicant_id", userId)
    .maybeSingle();

  if (error) throw error;
  return !!data;
}

export async function updateApplicationStatus(applicationId, status) {
  const { data, error } = await supabase
    .from("applications")
    .update({ status })
    .eq("id", applicationId)
    .select(APP_SELECT)
    .single();

  if (error) throw error;
  return data;
}
