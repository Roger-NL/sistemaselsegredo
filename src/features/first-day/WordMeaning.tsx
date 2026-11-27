import { createContext, useContext, Fragment } from "react";

const glossary: Record<string, string> = {
  yes: "sim", still: "ainda", closed: "fechada", hi: "oi", can: "poder · Can I…? = Posso…?", i: "eu", sit: "sentar", here: "aqui",
  "i'm": "eu sou / estou", rafael: "Rafael (nome)", by: "by the way = aliás", the: "o / a", way: "by the way = aliás",
  sure: "claro", ana: "Ana (nome)", close: "fechar", door: "porta", "it's": "é / está",
  noisy: "barulhento", out: "fora", there: "lá", open: "abrir / aberta", it: "isso",
  see: "ver · See you! = Até!",
  of: "of course = claro", course: "of course = claro", go: "ir", ahead: "go ahead = pode ir",
  no: "nenhum", problem: "problema", you: "você", call: "chamar", me: "me / mim · show me = me mostrar", lunchtime: "hora do almoço",
  pick: "pick up = pegar", up: "para cima", your: "sua / seu", tray: "bandeja", and: "e", look: "olhar",
  for: "para · look for = procurar", a: "um / uma", seat: "lugar para sentar", is: "é / está",
  reading: "lendo", comic: "gibi", "there's": "há", an: "um / uma", empty: "vazia", chair: "cadeira",
  next: "próximo / próxima · next to = ao lado de", to: "a / para", her: "ela / dela", looks: "olha", moves: "afasta", bag: "bolsa",
  puts: "coloca", his: "dele", down: "para baixo", sits: "senta", beside: "ao lado de", time: "hora",
  introduce: "apresentar", himself: "a si mesmo", smiles: "sorri", introduces: "apresenta",
  herself: "a si mesma", before: "antes", ask: "pedir", permission: "permissão",
  wow: "uau!", show: "mostrar", "that's": "isso é", so: "tão", cool: "legal",
  know: "saber · I know, right? = Pois é, né?", right: "em I know, right? = Pois é, né? · right here = aqui mesmo", page: "página",
  picture: "desenho / imagem", catches: "chama · catches your eye = chama sua atenção", eye: "olho",
  now: "agora", whole: "inteiro", watch: "observe", their: "deles", hands: "mãos",
  who: "quem", "who's": "quem está / quem é", shows: "mostra", offer: "oferecer", different: "diferente", requests: "pedidos",
  react: "reagir", does: "faz", action: "ação", after: "depois de",
  name: "nome / indicar", person: "pessoa", doing: "fazendo", then: "em seguida",
  use: "usar", base: "básica", form: "forma", unchanged: "sem mudar", verb: "verbo", like: "como / gostar", or: "ou",
  start: "iniciar", question: "pergunta", means: "quer dizer", wants: "quer", she: "ela",
  has: "tem", finger: "dedo", on: "sobre / em", what: "o que", do: "fazer / auxiliar na pergunta",
  say: "dizer", love: "adorar", new: "novo", tell: "dizer a / indicar", if: "se", needed: "necessário", complement: "complemento",
  turn: "virar · turn the page = virar a página", turns: "vira", toward: "na direção de", sailboat: "veleiro", appears: "aparece",
  drawing: "desenho", notices: "repara em", tilts: "inclina", corner: "canto", listener: "quem escuta",
  will: "vai", comes: "vem", loves: "adora", could: "poderia", he: "ele", check: "confira",
  leo: "Leo (nome)", walks: "walks over = se aproxima", over: "walks over = se aproxima",
  him: "ele / a ele", my: "meu / minha", nice: "nice to meet you = prazer em te conhecer",
  gives: "dá · gives back = devolve", back: "de volta", borrowed: "pegou emprestado", returned: "devolveu",
  meet: "conhecer / encontrar", have: "ter · I have = eu tenho", we: "nós",
  one: "um / uma · the new one = a edição nova", two: "dois / duas", comics: "gibis",
  points: "aponta", confirms: "confirma", cover: "capa", mentions: "fala de / menciona", issue: "edição de uma revista ou gibi",
  read: "ler", bring: "trazer", tomorrow: "amanhã", holding: "segurando",
  speech: "fala · speech bubble = balão de fala", bubble: "balão",
  speaks: "fala", speaking: "falando", yourself: "você mesmo / si mesmo",
  at: "às / ao · at lunch = na hora do almoço", lunch: "almoço", breakfast: "café da manhã",
  noon: "meio-dia", today: "hoje", yeah: "sim / é", table: "mesa", when: "quando", "you'll": "você vai",
  bell: "sinal", rings: "toca", class: "aula", thanks: "obrigado / valeu", guys: "pessoal / galera",
  goodbye: "adeus · say goodbye = se despedir", wave: "acenar", meal: "refeição", clock: "relógio",
  day: "dia", same: "mesmo / mesma", together: "juntos", already: "já", clear: "claro / entendido",
  just: "só / basta", give: "dar / informar", mention: "mencionar", choose: "escolher",
  agreed: "combinaram", midday: "meio-dia", break: "intervalo / pausa", calendar: "agenda / calendário", they: "eles / elas",
};
export const MeaningContext = createContext<(word: string) => void>(() => {});
export function meaningOf(word: string) {
  const key = word.toLowerCase().replaceAll("’", "'").replace(/^[^a-z]+|[^a-z]+$/g, "");
  return glossary[key];
}
export function EnglishWords({ text }: { text: string }) {
  const show = useContext(MeaningContext);
  return <>{text.split(/(\s+)/).map((word, i) => meaningOf(word)
    ? <button key={i} type="button" className="fd-gloss-word" onClick={event => {
      if (event.currentTarget.closest('[data-drop-available="true"]')) return;
      event.stopPropagation();
      show(word);
    }}>{word}</button> : <Fragment key={i}>{word}</Fragment>)}</>;
}
