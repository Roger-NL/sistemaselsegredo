import PagamentoPageClient from "./PagamentoPageClient";
import { isBetaFreeMode } from "@/server/payments/config";

export const dynamic = "force-dynamic";

export default function PagamentoPage() {
    return <PagamentoPageClient betaFreeMode={isBetaFreeMode()} />;
}
