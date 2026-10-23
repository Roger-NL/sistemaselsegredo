import { part01 } from "./parts/part-01";
import { part02 } from "./parts/part-02";
import { part03 } from "./parts/part-03";
import { part04 } from "./parts/part-04";
import { part05 } from "./parts/part-05";
import { part06 } from "./parts/part-06";
import { part07 } from "./parts/part-07";
import { part08 } from "./parts/part-08";
import { part09 } from "./parts/part-09";
import { part10 } from "./parts/part-10";
import { assertCatalog } from "./builders";
import type { DemoNode } from "../model/types";

export const nodes: DemoNode[] = [...part01, ...part02, ...part03, ...part04, ...part05, ...part06, ...part07, ...part08, ...part09, ...part10];
assertCatalog(nodes);
export const catalog = Object.fromEntries(nodes.map(n => [n.id, n])) as Record<string, DemoNode>;
