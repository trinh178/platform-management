import { LoadingContentProps } from '../..';

export default function PreventInteractiveLoadingContent({
  visible,
}: LoadingContentProps) {
  if (!visible) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/10"
      style={{ pointerEvents: 'all' }}
    ></div>
  );
}
