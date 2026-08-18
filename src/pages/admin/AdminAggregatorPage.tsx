import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { runAggregation } from "../../api/endpoints/aggregator";

const AdminAggregatorPage: React.FC = () => {
  const navigate = useNavigate();
  const [isRunning, setIsRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [dryRun, setDryRun] = useState(true);
  const [warningAccepted, setWarningAccepted] = useState(false);
  const [confirmationOpen, setConfirmationOpen] = useState(false);
  const [lastRunAt, setLastRunAt] = useState<Date | null>(null);
  const [lastRunCount, setLastRunCount] = useState<number | null>(null);
  const [lastRunMode, setLastRunMode] = useState<string | null>(null);
  const [lastRunCandidates, setLastRunCandidates] = useState<number | null>(null);
  const [lastRunRejected, setLastRunRejected] = useState<number | null>(null);
  const [lastRunRejectReasons, setLastRunRejectReasons] = useState<string[]>([]);

  const isValid = warningAccepted;

  const handleRunAggregation = () => {
    setError(null);
    setSuccess(null);
    if (!isValid) return;
    setConfirmationOpen(true);
  };

  const confirmAggregation = async () => {
    setConfirmationOpen(false);
    setIsRunning(true);
    try {
      const response = await runAggregation({
        dryRun,
        triggerMode: "manual",
      });

      const runCount = response.totalBatchesCreated ?? response.batchCount ?? 0;
      const rejectedCount = response.totalRejected ?? 0;
      const reasons = (response.rejectedOrders ?? [])
        .map((item) => item.reason)
        .filter((reason): reason is string => Boolean(reason))
        .slice(0, 5);
      setLastRunAt(new Date());
      setLastRunCount(runCount);
      setLastRunCandidates(response.totalCandidatesFetched ?? 0);
      setLastRunRejected(rejectedCount);
      setLastRunRejectReasons(reasons);
      setLastRunMode(dryRun ? "Preview" : "Live run");
      if (runCount > 0) {
        setSuccess(
          dryRun
            ? `Preview: batch(es) would be created from orders.`
            : `Created batch(es). Open Order Management and Routing handoff.`
        );
      } else {
        setSuccess(null);
        setError(
          rejectedCount > 0
            ? `No batches created. ${rejectedCount} order(s) were rejected${reasons[0] ? `: ${reasons[0]}` : "."}`
            : `No batches created. Fetched ${response.totalCandidatesFetched ?? 0} paid unbatched order(s). Restart the backend if this stays at 0.`
        );
      }
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : typeof err === "object" && err !== null && "message" in err
          ? (err as any).message
          : "Aggregation failed";
      setError(String(message));
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="space-y-6 text-slate-100">
      <header className="rounded-3xl border border-white/10 bg-slate-950/60 p-6">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-400">Admin aggregator</p>
        <h1 className="mt-3 text-3xl font-semibold text-white">Manual batch run</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">
          Batches the  paid, unbatched orders and creates batches when orders are eligible. After a live run, view them on Order Management and open Routing handoff for the route-making person.
        </p>
      </header>

      <section className="grid gap-5 xl:grid-cols-[1.4fr_0.9fr]">
        <div className="rounded-3xl border border-white/10 bg-slate-950/60 p-6">
          <div className="space-y-4">
            <div className="rounded-3xl bg-slate-900/80 p-4 text-sm text-slate-300">
              <p className="font-semibold text-white">Warning</p>
              <p className="mt-2 leading-6">
                This batches the latest paid orders only. Confirm below before running a live write.
              </p>
            </div>

            {lastRunAt && (
              <div className="rounded-3xl border border-slate-700/80 bg-slate-900/80 p-4 text-sm text-slate-300">
                <p className="font-semibold text-white">Last run summary</p>
                <p className="mt-2">
                  <span className="font-medium text-slate-100">Mode:</span> {lastRunMode}
                </p>
                <p>
                  <span className="font-medium text-slate-100">Batches:</span> {lastRunCount ?? 0}
                </p>
                <p>
                  <span className="font-medium text-slate-100">Orders fetched:</span> {lastRunCandidates ?? 0}
                </p>
                <p>
                  <span className="font-medium text-slate-100">Rejected:</span> {lastRunRejected ?? 0}
                </p>
                {lastRunRejectReasons.length > 0 && (
                  <p className="mt-1 text-amber-200">
                    {lastRunRejectReasons.join(" · ")}
                  </p>
                )}
                <p>
                  <span className="font-medium text-slate-100">Ran at:</span> {lastRunAt.toLocaleString()}
                </p>
              </div>
            )}


            <label className="flex items-center gap-3 text-sm text-slate-300">
              <input
                type="checkbox"
                checked={warningAccepted}
                onChange={(e) => setWarningAccepted(e.target.checked)}
                className="h-4 w-4 rounded border-white/20 bg-slate-900 text-primary focus:ring-primary"
              />
              <span>
                I understand this run batches paid orders batches.
              </span>
            </label>

            <label className="flex items-center gap-3 text-sm text-slate-300">
              <input
                type="checkbox"
                checked={dryRun}
                onChange={(e) => setDryRun(e.target.checked)}
                className="h-4 w-4 rounded border-white/20 bg-slate-900 text-primary focus:ring-primary"
              />
              <span>Run preview only (dry run, no route writes)</span>
            </label>

            {error && (
              <div className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                {error}
              </div>
            )}
            {success && (
              <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
                {success}
              </div>
            )}

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <button
                type="button"
                disabled={!isValid || isRunning}
                onClick={handleRunAggregation}
                className="inline-flex items-center justify-center rounded-2xl bg-primary px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:bg-white/10"
              >
                {isRunning ? "Running..." : dryRun ? "Preview aggregation" : "Run batching now"}
              </button>
              <button
                type="button"
                onClick={() => navigate("/admin/orders")}
                className="inline-flex items-center justify-center rounded-2xl border border-white/10 bg-slate-900/80 px-5 py-3 text-sm font-semibold text-white transition hover:border-white/20"
              >
                View batches (Order Management)
              </button>
            </div>
          </div>
        </div>

      </section>

      {confirmationOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/90 px-4">
          <div className="w-full max-w-md rounded-3xl border border-white/10 bg-slate-900 p-6 shadow-[0_30px_80px_rgba(0,0,0,0.7)]">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">
              {dryRun ? "Confirm preview aggregation" : "Confirm manual override"}
            </p>
            <h2 className="mt-4 text-2xl font-semibold text-white">
              Are you sure?
            </h2>
            <p className="mt-3 text-sm leading-6 text-slate-300">
              {dryRun
                ? "This will simulate the batching process without writing any changes."
                : "This will batch eligible paid orders. View them on Order Management and open Routing handoff for the route-making person."}
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={confirmAggregation}
                className="inline-flex flex-1 items-center justify-center rounded-2xl bg-primary px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-primary/90"
              >
                {dryRun ? "Confirm preview" : "Confirm run"}
              </button>
              <button
                type="button"
                onClick={() => setConfirmationOpen(false)}
                className="inline-flex flex-1 items-center justify-center rounded-2xl border border-white/10 bg-slate-900/80 px-5 py-3 text-sm font-semibold text-white transition hover:border-white/20"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminAggregatorPage;