import AsyncStorage from '@react-native-async-storage/async-storage';

const SESSION_KEY = '@insurx_session';

interface Session {
  userId: string;
  phone: string;
  onboardingComplete: boolean;
  idToken?: string;
}

export async function getSession(): Promise<Session | null> {
  try {
    const raw = await AsyncStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export async function saveSession(session: Session): Promise<void> {
  await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

export async function updateSession(partial: Partial<Session>): Promise<void> {
  const existing = await getSession();
  if (existing) {
    await AsyncStorage.setItem(
      SESSION_KEY,
      JSON.stringify({ ...existing, ...partial })
    );
  }
}

export async function markOnboardingComplete(): Promise<void> {
  await updateSession({ onboardingComplete: true });
}

export async function clearSession(): Promise<void> {
  await AsyncStorage.removeItem(SESSION_KEY);
}

// Legacy compat
export async function createSession(phone: string): Promise<Session> {
  const session: Session = {
    userId: phone,
    phone,
    onboardingComplete: false,
    idToken: undefined, // ✅ add this
  };

  await saveSession(session);
  return session;
}