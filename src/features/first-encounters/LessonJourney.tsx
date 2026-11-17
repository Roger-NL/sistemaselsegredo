import { getLessonJourney, LESSON_JOURNEY_TITLE, type LessonJourneyStage } from "./lesson-journey";
import "./lesson-journey.css";

export type LessonJourneyProps = { stage: LessonJourneyStage; completed: number; label?: string };

export function LessonJourney({ stage, completed, label }: LessonJourneyProps) {
  const progress = getLessonJourney(stage, completed);
  return <div className="lj-journey" data-journey-stage={progress.stage} role="progressbar" aria-label="Percurso completo da aula"
    aria-valuemin={0} aria-valuemax={100} aria-valuenow={progress.percent}
    aria-valuetext={`${progress.percent}% do percurso. ${progress.label}: ${progress.stageCompleted} de ${progress.stageTotal}.`}
    title={`${LESSON_JOURNEY_TITLE}. ${progress.completedUnits} de ${progress.totalUnits} etapas.`}>
    <span className="lj-label">{label ?? progress.label}</span>
    <span className="lj-track" aria-hidden="true">{progress.segments.map(segment => <span className="lj-segment" key={segment.id}
      style={{ flexGrow: segment.units }}><span style={{ transform: `scaleX(${segment.fraction})` }}/></span>)}</span>
    <strong className="lj-percent" data-journey-percent>{progress.percent}%</strong>
  </div>;
}
