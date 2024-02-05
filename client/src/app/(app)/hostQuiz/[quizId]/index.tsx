import HostStream from '@/components/streaming/hostStream';

export default function hostStream({ params }: { params: { quizId: string } }) {
  return <HostStream quizId={params.quizId} />;
}
