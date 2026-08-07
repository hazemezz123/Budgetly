export async function resolveGoogleUser(payload, User) {
  const { sub, email, name, picture } = payload;

  const byGoogleId = await User.findOne({ googleId: sub });
  if (byGoogleId) return byGoogleId;

  const byEmail = await User.findOne({ email });
  if (byEmail) {
    byEmail.googleId = sub;
    if (!byEmail.name) byEmail.name = name;
    if (!byEmail.profilePicture) byEmail.profilePicture = picture;
    await byEmail.save();
    return byEmail;
  }

  return User.create({
    email,
    name,
    googleId: sub,
    profilePicture: picture,
    username: await generateUsername(email, User),
  });
}

async function generateUsername(email, User) {
  let base = email.split("@")[0].toLowerCase().replace(/[^a-z0-9_.]/g, "");
  if (!base) base = "user";
  if (!(await User.findOne({ username: base }))) return base;
  for (let i = 0; i < 5; i++) {
    const candidate = `${base}${Math.random().toString(36).slice(2, 6)}`;
    if (!(await User.findOne({ username: candidate }))) return candidate;
  }
  return `${base}${Date.now().toString(36)}`;
}
