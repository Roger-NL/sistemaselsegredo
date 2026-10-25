"use client";

import type { Ref } from "react";
import type { SceneNode } from "../model/types";
import { audio } from "../content/media";
import { AudioButton } from "./AudioButton";

/** A single reading target, before the learner sees the next task. */
export function OpeningCard({ node, headingRef }: { node: SceneNode; headingRef: Ref<HTMLHeadingElement> }) {
  const dialogue = node.presentation === "dialogue";
  return <article className="opening-card" data-presentation={node.presentation}>
    {dialogue && <p className="opening-speaker">Lucas</p>}
    <h1 ref={headingRef} tabIndex={-1} lang={dialogue ? "en" : "pt-BR"}>
      {dialogue ? node.heard?.map(id => audio[id].text).join(" ") : node.context}
    </h1>
    {dialogue && node.heard?.length ? <AudioButton audio={node.heard} label="Ouvir fala de Lucas" /> : null}
  </article>;
}
