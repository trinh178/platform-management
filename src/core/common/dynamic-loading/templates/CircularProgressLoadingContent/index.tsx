import { LoadingContentProps } from '../..';

export default function CircularProgressLoadingContent({
  visible,
}: LoadingContentProps) {
  if (!visible) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      style={{ pointerEvents: 'all' }}
    >
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-white border-t-transparent" />
    </div>
  );
}
