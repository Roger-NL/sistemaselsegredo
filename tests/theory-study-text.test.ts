// @vitest-environment jsdom
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { lessons } from "@/features/theory/content";
import { StudyText } from "@/features/theory/StudyText";
import { plainStudyText, studyTextParts } from "@/features/theory/study-text";

function render(text: string, english = false) {
  const element = document.createElement("div");
  element.innerHTML = renderToStaticMarkup(createElement(StudyText, { english }, text));
  return element;
}

describe("English as study material inside Portuguese explanations", () => {
  it("distinguishes every occurrence from the screenshot, preserving the readable Portuguese sentence", () => {
    const reason = lessons[0].steps[1].why;
    const result = render(reason);
    expect(result.textContent).toBe("My e your acompanham coffee. Mine e yours substituem esse conjunto quando o objeto já está claro; por isso, não repetimos coffee depois deles.");
    expect([...result.querySelectorAll("mark")].map(mark => mark.textContent)).toEqual(["My", "your", "coffee", "Mine", "yours", "coffee"]);
    for (const mark of result.querySelectorAll("mark")) {
      expect(mark.lang).toBe("en");
      expect(mark.getAttribute("translate")).toBe("no");
    }
    expect(result.textContent).not.toContain("`");
  });

  it("keeps Portuguese homographs and quoted translations in Portuguese instead of guessing their language", () => {
    const result = render("A palavra `a` vem antes do nome. `Me too.` significa ‘eu também’; me explique o uso.");
    expect([...result.querySelectorAll("mark")].map(mark => mark.textContent)).toEqual(["a", "Me too."]);
    expect(result.textContent).toBe("A palavra a vem antes do nome. Me too. significa ‘eu também’; me explique o uso.");
    expect(render("I have to go.", true).querySelector("mark")?.textContent).toBe("I have to go.");
    expect(render("Português sem exemplos.").querySelector("mark")).toBeNull();
  });

  it("treats editorial content as escaped text, never HTML", () => {
    const result = render("Compare `<img src=x onerror=alert(1)>` com o exemplo.");
    expect(result.querySelector("img")).toBeNull();
    expect(result.querySelector("mark")?.textContent).toBe("<img src=x onerror=alert(1)>");
  });

  it("keeps annotations balanced across all lessons and out of answers, tokens and saved IDs", () => {
    let markedReasons = 0;
    const prose = (source: string) => {
      expect(source.split("`").length % 2, source).toBe(1);
      expect(plainStudyText(source)).not.toContain("`");
      for (const part of studyTextParts(source).filter(part => part.english)) expect(part.text.trim()).not.toBe("");
    };
    const raw = (source: string) => expect(source).not.toContain("`");
    for (const lesson of lessons) for (const step of lesson.steps) {
      [step.title, step.goal, step.why, step.body, step.detail, step.practice.prompt, step.practice.explanation, step.practice.hint].forEach(prose);
      expect(studyTextParts(step.why).some(part => part.english), step.id).toBe(true);
      markedReasons++;
      [step.id, step.phrase, step.meaning].forEach(raw);
      step.examples?.forEach(example => { raw(example.text); raw(example.meaning); if (example.note) prose(example.note); });
      if (step.practice.instruction) prose(step.practice.instruction);
      Object.entries(step.practice.feedback ?? {}).forEach(([answer, explanation]) => { raw(answer); prose(explanation); });
      if (step.practice.kind === "write") {
        step.practice.answers.forEach(raw);
        step.practice.gaps?.forEach(gap => { [gap.before, gap.after, gap.meaning, ...gap.answers].forEach(raw); if (gap.feedback) prose(gap.feedback); });
      } else {
        raw(step.practice.answer);
        (step.practice.kind === "choice" ? step.practice.options : [...step.practice.tokens, ...(step.practice.distractors ?? [])]).forEach(raw);
      }
    }
    expect(markedReasons).toBe(24);
  });
});
