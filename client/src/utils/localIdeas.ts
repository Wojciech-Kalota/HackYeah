import type { Idea, StoredIdea } from '../types/domain';

const IDEAS_STORAGE_KEY = 'glos-miasta:ideas';

export function getLocalIdeas(userId?: string): StoredIdea[] {
  try {
    const ideas = JSON.parse(
      localStorage.getItem(IDEAS_STORAGE_KEY) ?? '[]',
    ) as StoredIdea[];
    return userId ? ideas.filter((idea) => idea.user_id === userId) : ideas;
  } catch {
    return [];
  }
}

export function saveLocalIdea(idea: Idea, userId: string): StoredIdea {
  const storedIdea: StoredIdea = {
    ...idea,
    id: crypto.randomUUID(),
    user_id: userId,
    created_at: new Date().toISOString(),
  };
  const ideas = getLocalIdeas();
  localStorage.setItem(
    IDEAS_STORAGE_KEY,
    JSON.stringify([storedIdea, ...ideas]),
  );
  return storedIdea;
}
