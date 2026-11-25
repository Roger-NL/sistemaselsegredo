export type Phrase = { en: string; pt: string };
export type Part = { en: string; pt: string };

type BaseScene = {
  id: string;
  label: string;
  title: string;
  context: string;
  question: string;
  hint: string;
  incoming?: Phrase;
  response: Phrase;
  after: string;
  responseParts: Part[];
};

export type ChoiceScene = BaseScene & {
  kind: "choice";
  options: readonly [Phrase, Phrase];
  why: string;
  parts: readonly [Part[], Part[]];
};

export type GameScene = BaseScene & { kind: "bookmark" | "note" };
export type Scene = ChoiceScene | GameScene;

export const scenes: readonly Scene[] = [
  {
    id: "seat", kind: "choice", label: "Um lugar", title: "Tem alguém sentado aqui?",
    context: "É sábado à tarde. Uma jovem lê perto da janela. Há uma cadeira vazia à mesa; ela percebe seu olhar e sorri.",
    question: "Como você pede para se sentar?",
    hint: "Aqui, “Can I…?” serve para pedir permissão.",
    options: [
      { en: "Can I sit here?", pt: "Posso me sentar aqui?" },
      { en: "Can I sit with you?", pt: "Posso me sentar com você?" },
    ],
    response: { en: "Sure! I'm Lara.", pt: "Claro! Eu sou a Lara." },
    after: "Lara afasta o livro para abrir espaço. Você se senta.",
    why: "Você fez um pedido. Uma opção destaca o lugar; a outra, a companhia. As duas permitem que Lara aceite com a mesma resposta.",
    parts: [
      [{ en: "Can I…?", pt: "Posso…? Aqui, um pedido de permissão." }, { en: "sit", pt: "Sentar ou se sentar." }, { en: "here", pt: "Aqui: o lugar que você está indicando." }],
      [{ en: "Can I…?", pt: "Posso…? Aqui, um pedido de permissão." }, { en: "sit", pt: "Sentar ou se sentar." }, { en: "with you", pt: "Com você: a companhia dela." }],
    ],
    responseParts: [{ en: "Sure!", pt: "Claro! Uma forma de aceitar o pedido." }, { en: "I'm Lara.", pt: "Eu sou a Lara. “I'm” é a forma curta de “I am”." }],
  },
  {
    id: "name", kind: "choice", label: "Seu nome", title: "Agora ela quer conhecer você.",
    context: "Ela deixou o livro sobre a mesa e contou como se chama. Você quer dizer seu nome também.",
    question: "Como você se apresenta?", hint: "As duas opções dizem seu nome. Escolha a que você prefere usar.",
    options: [{ en: "I'm Ben.", pt: "Eu sou o Ben." }, { en: "My name is Ben.", pt: "Meu nome é Ben." }],
    response: { en: "Nice to meet you, Ben.", pt: "Prazer em conhecer você, Ben." },
    after: "Lara sorri. O livro azul continua aberto entre vocês.",
    why: "Você se apresentou de uma das duas formas. A primeira é curta; a segunda diz literalmente qual é seu nome. Ambas são naturais aqui.",
    parts: [
      [{ en: "I'm", pt: "Eu sou, nesta apresentação. Forma curta de “I am”." }, { en: "Ben", pt: "O nome do seu personagem." }],
      [{ en: "My name", pt: "Meu nome." }, { en: "is", pt: "É: liga “meu nome” ao nome Ben." }, { en: "Ben", pt: "O nome do seu personagem." }],
    ],
    responseParts: [{ en: "Nice to meet you.", pt: "Prazer em conhecer você. Aprenda a expressão com esse sentido completo." }],
  },
  {
    id: "book", kind: "choice", label: "O livro azul", title: "O livro entre vocês.",
    context: "Lara aproxima o livro azul. Você quer saber sobre a história.",
    question: "Como você pergunta sobre a história?", hint: "O assunto continua sendo o livro. “It” pode retomar esse livro.",
    options: [{ en: "What's the book about?", pt: "Sobre o que é o livro?" }, { en: "What's it about?", pt: "Sobre o que é?" }],
    response: { en: "It's about a man with a key to a house. But the house isn't his.", pt: "É sobre um homem que tem a chave de uma casa. Mas a casa não é dele." },
    after: "Ela para antes de contar mais. Você se inclina um pouco para ver a página.",
    why: "As duas perguntas pedem o assunto da história. Você pode nomear “the book” ou usar “it”, porque o livro já está claro na conversa.",
    parts: [
      [{ en: "What's", pt: "Forma curta de “what is”." }, { en: "the book", pt: "O livro." }, { en: "about", pt: "Sobre. A pergunta inteira pede o assunto do livro." }],
      [{ en: "What's", pt: "Forma curta de “what is”." }, { en: "it", pt: "Retoma o livro que vocês estão vendo." }, { en: "about", pt: "Sobre. A pergunta inteira pede o assunto do livro." }],
    ],
    responseParts: [{ en: "It's about…", pt: "É sobre… Uma forma de começar o resumo." }, { en: "a man with a key to a house", pt: "Um homem com a chave de uma casa." }, { en: "But the house isn't his.", pt: "Mas a casa não é dele. “Isn't” é “is not”; “his” indica que algo é dele." }],
  },
  {
    id: "bookmark", kind: "bookmark", label: "Uma pequena ajuda", title: "Guarde esta página.",
    context: "Lara precisa guardar a página para mostrar o cartaz. Ela pede um dos dois marcadores da mesa.",
    incoming: { en: "Can you pass me the blue bookmark?", pt: "Você pode me passar o marcador azul?" },
    question: "Passe o marcador que ela pediu.", hint: "“Blue bookmark” significa “marcador azul”. Você pode consultar os rótulos.",
    response: { en: "Thanks!", pt: "Obrigada!" },
    after: "Lara marca a página e vira o cartaz para você.",
    responseParts: [{ en: "Can you…?", pt: "Você pode…? Aqui, Lara faz um pedido a você." }, { en: "pass me", pt: "Me passar, neste pedido." }, { en: "the blue bookmark", pt: "O marcador azul. Em inglês, a cor vem antes do nome do objeto." }, { en: "Thanks!", pt: "Obrigada! Uma forma breve de agradecer." }],
  },
  {
    id: "invitation", kind: "choice", label: "Um reencontro", title: "Um primeiro ouvinte.",
    context: "O cartaz anuncia uma tarde de histórias: domingo, às 16h, na livraria. Lara também escreve e quer ler seu texto amanhã.",
    incoming: { en: "I want to read my story here tomorrow. But I'm nervous.", pt: "Quero ler minha história aqui amanhã. Mas estou nervosa." },
    question: "Você gostaria de ouvir a história antes do evento. Como oferece isso?", hint: "Aqui, “first” quer dizer antes das outras pessoas.",
    options: [{ en: "Can I hear it first?", pt: "Posso ouvir antes?" }, { en: "Can you read it to me first?", pt: "Você pode ler para mim antes?" }],
    response: { en: "Of course. Tomorrow at three thirty?", pt: "Claro. Amanhã às três e meia?" },
    after: "Lara abre o caderno. Pela primeira vez, ela parece querer mostrar o que está escrevendo.",
    why: "Você demonstrou vontade de ouvir antes do público. Uma opção pede para ouvir; a outra pede que ela leia para você. Lara aceita e combina uma leitura às 15h30.",
    parts: [
      [{ en: "Can I hear…?", pt: "Posso ouvir…?" }, { en: "it", pt: "Retoma a história de Lara, mencionada logo antes." }, { en: "first", pt: "Antes: neste contexto, antes das outras pessoas." }],
      [{ en: "Can you read…?", pt: "Você pode ler…?" }, { en: "it to me", pt: "A história para mim. “It” retoma a história." }, { en: "first", pt: "Antes: neste contexto, antes das outras pessoas." }],
    ],
    responseParts: [{ en: "I want to read my story.", pt: "Quero ler minha história. “Want to” seguido de ação expressa o que alguém quer fazer." }, { en: "I'm nervous.", pt: "Estou nervosa. Aqui, “I'm” descreve como Lara está se sentindo." }, { en: "Of course.", pt: "Claro. Ela aceita seu pedido." }, { en: "Tomorrow at three thirty?", pt: "Amanhã às três e meia? Lara propõe domingo, 15h30, antes do evento das 16h." }],
  },
  {
    id: "note", kind: "note", label: "Até amanhã", title: "Um bilhete para amanhã.",
    context: "Vocês anotam: domingo, 15h30, na livraria. Complete uma despedida no bilhete que Lara guardará.",
    incoming: { en: "See you tomorrow!", pt: "Até amanhã!" },
    question: "Deixe sua despedida no bilhete.", hint: "Toque nas partes para completar o bilhete.",
    response: { en: "See you tomorrow, Ben.", pt: "Até amanhã, Ben." },
    after: "Lara guarda o bilhete no caderno. O encontro de amanhã já tem um primeiro ouvinte.",
    responseParts: [{ en: "See you tomorrow!", pt: "Até amanhã! Essa é a tradução natural da despedida inteira." }, { en: "See you", pt: "Em despedidas, pode ter o sentido de “até mais” ou “a gente se vê”." }, { en: "tomorrow", pt: "Amanhã. Na história, vocês estão no sábado e combinam o domingo." }],
  },
];

export type JourneyEvent = { sceneId: string; option?: 0 | 1; assisted?: boolean };
export type Snapshot = { version: 1; started: boolean; events: JourneyEvent[]; noteDraft: number[] };
export const storageKey = "basedspeak.bookshop-prototype.v1";
export const freshSnapshot = (): Snapshot => ({ version: 1, started: false, events: [], noteDraft: [] });

export function restoreSnapshot(raw: string | null): Snapshot {
  if (!raw) return freshSnapshot();
  try {
    const data = JSON.parse(raw);
    if (data.version !== 1 || typeof data.started !== "boolean" || !Array.isArray(data.events) || data.events.length > scenes.length) return freshSnapshot();
    for (let i = 0; i < data.events.length; i++) {
      const event = data.events[i];
      if (!event || event.sceneId !== scenes[i].id) return freshSnapshot();
      if (scenes[i].kind === "choice" && event.option !== 0 && event.option !== 1) return freshSnapshot();
      if (scenes[i].kind !== "choice" && typeof event.assisted !== "boolean") return freshSnapshot();
    }
    const draft = data.noteDraft;
    const validDraft = Array.isArray(draft) && draft.length <= 2 && draft.every((n: unknown) => n === 0 || n === 1) && new Set(draft).size === draft.length;
    return { version: 1, started: data.started || data.events.length > 0, events: data.events.map((e: JourneyEvent) => ({ sceneId: e.sceneId, option: e.option, assisted: e.assisted })), noteDraft: validDraft && data.events.length === 5 ? draft : [] };
  } catch { return freshSnapshot(); }
}

export function appendEvent(snapshot: Snapshot, event: JourneyEvent): Snapshot {
  const next = scenes[snapshot.events.length];
  if (!next || next.id !== event.sceneId) return snapshot;
  if (next.kind === "choice" && event.option !== 0 && event.option !== 1) return snapshot;
  if (next.kind !== "choice" && typeof event.assisted !== "boolean") return snapshot;
  return { version: 1, started: true, events: [...snapshot.events, event], noteDraft: [] };
}

export function chosenPhrase(scene: Scene, event: JourneyEvent): Phrase | null {
  if (scene.kind === "choice" && event.option !== undefined) return scene.options[event.option];
  if (scene.kind === "note" && !event.assisted) return { en: "See you tomorrow!", pt: "Até amanhã!" };
  return null;
}

export function responseFor(scene: Scene, event: JourneyEvent): Phrase {
  return scene.kind === "bookmark" && event.assisted
    ? { en: "Here it is.", pt: "Aqui está." }
    : scene.response;
}

export function gestureFor(scene: Scene, event: JourneyEvent): string {
  if (scene.kind === "bookmark" && event.assisted) return "Lara pega o marcador azul, guarda a página e vira o cartaz para você.";
  if (scene.kind === "note" && event.assisted) return "Vocês usam o modelo de despedida no bilhete. Lara o guarda no caderno.";
  return scene.after;
}
