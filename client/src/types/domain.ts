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

export type ReportStatus = IdeaStatus;

export type Report = {
  id: number | string;
  duplicateOfId?: string | null;
  district: string;
  category: string;
  title: string;
  description: string;
  status: ReportStatus;
  comments: number;
  votes: number;
  hasVoted: boolean;
  updatedAt: string;
  image: string;
};

export type DashboardStatId =
  'submitted' | 'under_review' | 'in_progress' | 'completed';

export type DashboardStat = {
  id: DashboardStatId;
  label: string;
  value: number;
  description: string;
  badge: string;
};
