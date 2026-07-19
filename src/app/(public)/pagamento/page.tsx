import PagamentoPageClient from "./PagamentoPageClient";
import { isBetaFreeMode } from "@/lib/payments/config";

export const dynamic = "force-dynamic";

export default function PagamentoPage() {
    return <PagamentoPageClient betaFreeMode={isBetaFreeMode()} />;
}
