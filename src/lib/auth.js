import supabase from "./supabase";

export async function signUp(email, password, username = "") {
  let { data, error } = await supabase.auth.signUp({
    email,
    password,
  });

  if (error) throw error;

  console.log("Auth signup successful:", data);

  const displayName = username || email.split("@")[0];

  if (data?.user) {
    try {
      const { data: profileData, error: profileError } = await supabase
        .from("users")
        .insert({
          id: data.user.id,
          username: displayName,
          email: email,
          avatar_url: null,
        })
        .select()
        .single();

      if (profileError) throw profileError;
      console.log("Profile created successfully", profileData);
    } catch (profileError) {
      console.error("profile creation error:", profileError);
      // If profile creation fails due to RLS or missing session,
      // the profile can still be created on first sign in.
    }
  }

  return data;
}

export async function signIn(email, password) {
  let { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw error;

  let profile = null;

  if (data?.user) {
    try {
      profile = await getUserProfile(data.user.id);
      console.log("profile info ", profile);
    } catch (err) {
      console.error("Error with profile during signin:", err);
    }
  }

  return {
    user: data.user,
    profile,
  };
}

export async function getUserProfile(userId) {
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("id", userId)
    .maybeSingle();

  // if exists
  if (data) return data;

  // if not exists → create
  if (!data && !error) {
    const { data: userData } = await supabase.auth.getUser();
    const email = userData?.user?.email;

    const username = email?.split("@")[0] || `user_${Date.now()}`;

    const { data: newProfile, error: createError } = await supabase
      .from("users")
      .insert({
        id: userId,
        username,
        email,
        avatar_url: null,
      })
      .select()
      .single();

    if (createError) throw createError;

    return newProfile;
  }

  throw error;
}

export function onAuthChange(callback) {
  const { data } = supabase.auth.onAuthStateChange((event, session) => {
    callback(session?.user || null, event);
  });

  return () => data.subscription.unsubscribe();
}

// signout

export async function signOut() {
  await supabase.auth.signOut();
}
