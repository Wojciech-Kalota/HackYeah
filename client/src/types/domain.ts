export type IdeaStatus =
  | 'submitted'
  | 'under_review'
  | 'accepted'
  | 'in_progress'
  | 'completed'
  | 'rejected';

export type Idea = {
  district: string;
  category: string;
  title: string;
  desc: string;
  status: IdeaStatus;
  img?: string;
};

export type Comment = {
  user_id: string;
  date: string;
  text: string;
};

export type Upvote = {
  user_id: string;
  date: string;
  quantity?: number;
};

export type Duplicate = {
  idea_id: string;
  title: string;
  desc: string;
  img?: string;
};

export type StoredIdea = Idea & {
  id: string;
  user_id: string;
  created_at: string;
};
