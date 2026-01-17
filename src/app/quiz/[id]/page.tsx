import { QuizClient } from "@/components/quiz/QuizClient";

// ============================================================================
// QUIZ PAGE - SERVER COMPONENT
// Passa o ID do pilar para o componente cliente
// ============================================================================

interface PageProps {
    params: Promise<{ id: string }>;
}

export default async function QuizPage({ params }: PageProps) {
    const { id } = await params;

    return <QuizClient pillarId={id} />;
}
