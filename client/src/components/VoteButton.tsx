import { LoaderCircle, ThumbsUp } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

import { api, getApiErrorMessage, type VoteResult } from '../api/client';
import { useAuth } from '../auth/AuthContext';
import { uiTheme } from '../styles/theme';

type VoteButtonProps = {
  ideaId: string | number;
  votes: number;
  hasVoted: boolean;
  compact?: boolean;
  onChanged?: (result: VoteResult) => void;
};

export function VoteButton({
  ideaId,
  votes,
  hasVoted,
  compact = false,
  onChanged,
}: VoteButtonProps) {
  const { user } = useAuth();
  const location = useLocation();
  const [voteCount, setVoteCount] = useState(votes);
  const [voted, setVoted] = useState(hasVoted);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setVoteCount(votes);
    setVoted(hasVoted);
  }, [hasVoted, votes]);

  const className = `${uiTheme.focusRing} pointer-events-auto relative z-30 inline-flex items-center justify-center gap-2 rounded-xl border font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 ${
    compact ? 'min-h-9 px-3 py-2 text-xs' : 'min-h-11 px-4 py-2.5 text-sm'
  } ${
    voted
      ? 'border-blue-700 bg-blue-700 text-white hover:bg-blue-800'
      : 'border-blue-200 bg-blue-50 text-blue-800 hover:border-blue-300 hover:bg-blue-100'
  }`;

  if (!user) {
    return (
      <Link
        aria-label={`Zaloguj się, aby poprzeć pomysł. Liczba głosów: ${voteCount}`}
        className={className}
        state={{ from: `${location.pathname}${location.search}` }}
        to="/logowanie"
      >
        <ThumbsUp aria-hidden="true" size={compact ? 15 : 17} />
        <span>{voteCount}</span>
        {!compact && <span>Zaloguj się, aby poprzeć</span>}
      </Link>
    );
  }

  async function toggleVote() {
    setBusy(true);
    setError('');
    try {
      const result = await api.ideas.changeVote(String(ideaId));
      setVoteCount(result.voteCount);
      setVoted(result.hasVoted);
      onChanged?.(result);
    } catch (voteError) {
      setError(getApiErrorMessage(voteError));
    } finally {
      setBusy(false);
    }
  }

  return (
    <span className="pointer-events-auto relative z-30 inline-flex flex-col items-end gap-1">
      <button
        aria-label={`${voted ? 'Cofnij poparcie' : 'Poprzyj pomysł'}. Liczba głosów: ${voteCount}`}
        aria-pressed={voted}
        className={className}
        disabled={busy}
        onClick={() => void toggleVote()}
        type="button"
      >
        {busy ? (
          <LoaderCircle aria-hidden="true" className="animate-spin" size={17} />
        ) : (
          <ThumbsUp aria-hidden="true" size={compact ? 15 : 17} />
        )}
        <span>{voteCount}</span>
        {!compact && <span>{voted ? 'Poparto' : 'Poprzyj pomysł'}</span>}
      </button>
      {error && (
        <span
          className="max-w-56 text-right text-[10px] text-red-700"
          role="alert"
        >
          {error}
        </span>
      )}
    </span>
  );
}
