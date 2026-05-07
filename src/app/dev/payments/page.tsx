"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { CreditCard, ExternalLink, QrCode, ShoppingCart, ShieldAlert } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { DirectCardForm } from "@/components/payments/DirectCardForm";
import {
  buildDirectCardPayload,
  EMPTY_DIRECT_CARD_FORM,
  getDirectCardValidationError,
} from "@/lib/payments/direct-card";

const TEST_PRODUCTS = [
  { id: "spec-tech", name: "Especialidade Tech", price: 50 },
  { id: "spec-sales", name: "Especialidade Sales", price: 50 },
  { id: "spec-travel", name: "Especialidade Travel", price: 50 },
  { id: "spec-exam", name: "Especialidade Exam Prep", price: 50 },
];

const ADMIN_EMAILS = ["roger@esacademy.com", "admin@esacademy.com", "raugerac@gmail.com"];

export default function DevPaymentsPage() {
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const [selectedIds, setSelectedIds] = useState<string[]>([TEST_PRODUCTS[0].id]);
  const [cpf, setCpf] = useState("12345678909");
  const [paymentMethod, setPaymentMethod] = useState<"PIX" | "CREDIT_CARD">("PIX");
  const [cardForm, setCardForm] = useState(EMPTY_DIRECT_CARD_FORM);
  const [paymentId, setPaymentId] = useState<string | null>(null);
  const [invoiceUrl, setInvoiceUrl] = useState<string | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<string | null>(null);
  const [qrCodeData, setQrCodeData] = useState<{ encodedImage: string; payload: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const isAdmin = Boolean(user?.email && ADMIN_EMAILS.includes(user.email));
  const selectedProducts = TEST_PRODUCTS.filter((product) => selectedIds.includes(product.id));
  const total = useMemo(
    () => selectedProducts.reduce((sum, product) => sum + product.price, 0),
    [selectedProducts]
  );
  const description = selectedProducts.length
    ? `Teste DevTools - ${selectedProducts.map((product) => product.name).join(" + ")}`
    : "Teste DevTools - Carrinho vazio";
  const isApproved = paymentStatus === "RECEIVED" || paymentStatus === "CONFIRMED";

  useEffect(() => {
    if (!paymentId || !user?.id) return;

    let stopped = false;
    const verify = async () => {
      if (stopped) return;

      try {
        const res = await fetch("/api/verify-payment", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ paymentId, userId: user.id }),
        });
        const data = await res.json();
        if (!stopped) {
          setPaymentStatus(data.status || null);
          if (data.isPaid) {
            setMessage("Pagamento confirmado pelo webhook/verificacao.");
          }
        }
      } catch {
        // silent polling
      }
    };

    void verify();
    const interval = setInterval(verify, 5000);

    const unsubscribe = onSnapshot(doc(db, "users", user.id), (snapshot) => {
      const userData = snapshot.data();
      if (!userData || stopped) return;
      if (userData.paymentId === paymentId && typeof userData.paymentStatus === "string") {
        setPaymentStatus(userData.paymentStatus);
      }
    });

    return () => {
      stopped = true;
      clearInterval(interval);
      unsubscribe();
    };
  }, [paymentId, user?.id]);

  const toggleProduct = (productId: string) => {
    setSelectedIds((prev) =>
      prev.includes(productId) ? prev.filter((id) => id !== productId) : [...prev, productId]
    );
  };

  const createCharge = async (openImmediately: boolean) => {
    setError(null);
    setMessage(null);

    if (!user) {
      setError("Usuario nao autenticado.");
      return;
    }

    if (!selectedProducts.length) {
      setError("Selecione pelo menos um produto de teste.");
      return;
    }

    if (cpf.replace(/\D/g, "").length < 11) {
      setError("Informe um CPF valido para o teste.");
      return;
    }

    if (paymentMethod === "CREDIT_CARD") {
      const validationError = getDirectCardValidationError(cardForm);
      if (validationError) {
        setError(validationError);
        return;
      }
    }

    setLoading(true);

    try {
      const endpoint = paymentMethod === "CREDIT_CARD" ? "/api/checkout/card/direct" : "/api/checkout";
      const directCardPayload = paymentMethod === "CREDIT_CARD" ? buildDirectCardPayload(cardForm) : {};
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          localCustomerId: user.id,
          name: user.name || "Admin Teste",
          email: user.email,
          cpfCnpj: cpf.replace(/\D/g, ""),
          paymentMethod,
          creditCardMode: paymentMethod === "CREDIT_CARD" ? "DIRECT" : undefined,
          plan: "specialty",
          value: total,
          description,
          ...directCardPayload,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Falha ao criar cobranca de teste.");
      }

      setPaymentId(data.paymentId || null);
      setInvoiceUrl(data.invoiceUrl || null);
      setPaymentStatus(data.status || null);
      setQrCodeData(
        data.qrCode && data.qrCodePayload
          ? { encodedImage: data.qrCode, payload: data.qrCodePayload }
          : null
      );

      if (openImmediately) {
        if (paymentMethod === "CREDIT_CARD" && data.invoiceUrl) {
          window.open(data.invoiceUrl, "_blank", "noopener,noreferrer");
        }
      }

      setMessage(
        paymentMethod === "CREDIT_CARD"
          ? "Pagamento direto de cartao enviado para a Asaas. Acompanhe o status abaixo."
          : "Cobranca de teste criada com sucesso."
      );
    } catch (checkoutError: unknown) {
      setError(checkoutError instanceof Error ? checkoutError.message : "Erro ao criar cobranca.");
    } finally {
      setLoading(false);
    }
  };

  const openPayment = () => {
    if (paymentMethod === "CREDIT_CARD" && invoiceUrl) {
      window.open(invoiceUrl, "_blank", "noopener,noreferrer");
      return;
    }

    if (paymentMethod === "PIX" && qrCodeData) {
      document.getElementById("dev-pix-card")?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }

    setError("Primeiro lance uma cobranca para abrir o pagamento.");
  };

  if (!isLoading && !isAdmin) {
    return (
      <section className="rounded-2xl border border-rose-500/30 bg-rose-500/10 p-6 text-rose-100">
        <div className="flex items-center gap-3">
          <ShieldAlert className="h-5 w-5" />
          <div>
            <h2 className="text-lg font-semibold">Acesso restrito</h2>
            <p className="text-sm text-rose-100/80">
              Esta rota dev de pagamentos de teste fica disponivel apenas para administradores.
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-8">
      <div className="space-y-3">
        <p className="text-sm uppercase tracking-[0.3em] text-emerald-400">Payments Lab</p>
        <h2 className="text-3xl font-semibold text-white">Carrinho de teste da Asaas</h2>
        <p className="max-w-3xl text-slate-300">
          Laboratorio isolado para criar compras de especialidade de teste sem liberar premium.
        </p>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
          <div className="mb-5 flex items-center gap-3">
            <ShoppingCart className="h-5 w-5 text-emerald-400" />
            <h3 className="text-lg font-semibold text-white">Produtos de teste</h3>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            {TEST_PRODUCTS.map((product) => {
              const isSelected = selectedIds.includes(product.id);
              return (
                <button
                  key={product.id}
                  type="button"
                  onClick={() => toggleProduct(product.id)}
                  className={`rounded-2xl border p-4 text-left transition ${
                    isSelected
                      ? "border-emerald-400/60 bg-emerald-500/10"
                      : "border-slate-700 bg-slate-950/60 hover:border-slate-500"
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold uppercase tracking-[0.18em] text-white">
                        {product.name}
                      </p>
                      <p className="mt-2 text-sm text-slate-400">Compra de especialidade para testes internos.</p>
                    </div>
                    <span className="rounded-full border border-emerald-400/20 bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-300">
                      R$ {product.price}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="space-y-5 rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white">Checkout de teste</h3>
            <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-[0.22em] ${
              isApproved ? "bg-emerald-500/15 text-emerald-300" : "bg-red-500/15 text-red-300"
            }`}>
              <span className={`h-2 w-2 rounded-full ${isApproved ? "bg-emerald-400" : "bg-red-400"}`} />
              {isApproved ? "Aprovado" : "Pendente"}
            </span>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-black/30 p-4 text-sm text-slate-300">
            <p className="font-semibold text-white">Resumo</p>
            <p className="mt-2">{selectedProducts.length} item(ns)</p>
            <p className="mt-1 text-slate-400">{description}</p>
            <p className="mt-3 text-lg font-bold text-emerald-300">Total: R$ {total}</p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setPaymentMethod("PIX")}
              className={`rounded-2xl border p-4 text-left transition ${
                paymentMethod === "PIX"
                  ? "border-cyan-400/60 bg-cyan-500/10"
                  : "border-slate-700 bg-slate-950/60 hover:border-slate-500"
              }`}
            >
              <QrCode className="mb-2 h-5 w-5 text-cyan-300" />
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-white">Pix</p>
            </button>
            <button
              type="button"
              onClick={() => setPaymentMethod("CREDIT_CARD")}
              className={`rounded-2xl border p-4 text-left transition ${
                paymentMethod === "CREDIT_CARD"
                  ? "border-emerald-400/60 bg-emerald-500/10"
                  : "border-slate-700 bg-slate-950/60 hover:border-slate-500"
              }`}
            >
              <CreditCard className="mb-2 h-5 w-5 text-emerald-300" />
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-white">Cartão</p>
            </button>
          </div>

          <label className="block text-xs uppercase tracking-[0.22em] text-slate-400">
            CPF de teste
            <input
              value={cpf}
              onChange={(event) => setCpf(event.target.value)}
              className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none focus:border-emerald-400"
              placeholder="12345678909"
            />
          </label>

          {paymentMethod === "CREDIT_CARD" && (
            <div className="rounded-2xl border border-emerald-400/20 bg-emerald-500/5 p-4">
              <p className="mb-4 text-xs font-bold uppercase tracking-[0.22em] text-emerald-300">
                Dados reais do cartao
              </p>
              <DirectCardForm
                value={cardForm}
                onChange={setCardForm}
                disabled={loading}
                compact
              />
            </div>
          )}

          <div className="grid gap-3 sm:grid-cols-2">
            <button
              type="button"
              onClick={() => void createCharge(false)}
              disabled={loading}
              className="rounded-xl border border-violet-400/30 bg-violet-500/10 px-4 py-3 text-xs font-bold uppercase tracking-[0.2em] text-violet-200 transition hover:bg-violet-500/20 disabled:opacity-50"
            >
              {loading ? "Lançando..." : "Lançar na Asaas"}
            </button>

            <button
              type="button"
              onClick={openPayment}
              disabled={loading || (paymentMethod === "CREDIT_CARD" ? !invoiceUrl : !qrCodeData)}
              className="rounded-xl border border-emerald-400/30 bg-emerald-500/10 px-4 py-3 text-xs font-bold uppercase tracking-[0.2em] text-emerald-200 transition hover:bg-emerald-500/20 disabled:opacity-50"
            >
              <span className="inline-flex items-center justify-center gap-2">
                <ExternalLink className="h-4 w-4" />
                {paymentMethod === "CREDIT_CARD" ? "Abrir invoiceUrl" : "Ir para pagamento"}
              </span>
            </button>
          </div>

          {message && <p className="text-sm text-emerald-300">{message}</p>}
          {error && <p className="text-sm text-rose-300">{error}</p>}

          {paymentId && (
            <div className="rounded-xl border border-slate-800 bg-black/30 p-4 text-xs text-slate-400">
              <p>ID: <span className="text-slate-200">{paymentId}</span></p>
              <p className="mt-1">Status: <span className="text-slate-200">{paymentStatus || "aguardando"}</span></p>
              {paymentMethod === "CREDIT_CARD" && !invoiceUrl && (
                <p className="mt-2 text-emerald-300">
                  Fluxo direto ativo: este teste envia os dados completos do cartao sem abrir invoiceUrl.
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {paymentMethod === "PIX" && qrCodeData && (
        <div
          id="dev-pix-card"
          className="rounded-2xl border border-white/10 bg-white p-6 text-center text-black shadow-xl"
        >
          <h3 className="text-xl font-bold">PIX de teste gerado</h3>
          <p className="mt-2 text-sm text-slate-600">Use este QR Code para validar o webhook e a conciliacao.</p>

          <div className="mx-auto mt-5 w-fit rounded-xl bg-slate-100 p-3">
            <img
              src={`data:image/png;base64,${qrCodeData.encodedImage}`}
              alt="PIX QR Code de teste"
              className="h-56 w-56 mix-blend-multiply"
            />
          </div>

          <textarea
            readOnly
            value={qrCodeData.payload}
            className="mt-5 min-h-28 w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs text-slate-700 outline-none"
          />
        </div>
      )}

      <div className="flex">
        <button
          type="button"
          onClick={() => router.push("/dashboard")}
          className="rounded-xl border border-slate-700 px-4 py-3 text-sm text-slate-200 transition hover:border-emerald-400 hover:text-white"
        >
          Voltar para o dashboard
        </button>
      </div>
    </section>
  );
}
