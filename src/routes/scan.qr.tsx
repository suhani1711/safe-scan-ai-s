import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { ScanProgress } from "@/components/ScanProgress";
import { ScanResultView } from "@/components/ScanResultView";
import { analyzeQr, DEMO, QR_CHECKS, type ScanResult } from "@/lib/scan-engine";
import { recordScan } from "@/lib/store";

export const Route = createFileRoute("/scan/qr")({
  head: () => ({
    meta: [
      { title: "QR Trust Check — ScamShield AI" },
      {
        name: "description",
        content: "Upload or scan a payment QR to verify the merchant identity and UPI handle before you pay.",
      },
      { property: "og:title", content: "QR Trust Check — ScamShield AI" },
      {
        property: "og:description",
        content: "Decode the UPI payment string inside a QR and get a trust score before money leaves your account.",
      },
    ],
  }),
  component: QrScanner,
});

function QrScanner() {
  const [phase, setPhase] = useState<"idle" | "scanning" | "done">("idle");
  const [result, setResult] = useState<ScanResult | null>(null);
  const [payload, setPayload] = useState("");
  const [error, setError] = useState("");
  const [camera, setCamera] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  function run(raw: string) {
    setPayload(raw);
    setResult(analyzeQr(raw));
    setError("");
    setPhase("scanning");
    stopCamera();
  }

  function stopCamera() {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setCamera(false);
  }

  async function decodeFile(file: File) {
    try {
      const jsQR = (await import("jsqr")).default;
      const bitmap = await createImageBitmap(file);
      const canvas = document.createElement("canvas");
      canvas.width = bitmap.width;
      canvas.height = bitmap.height;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("no canvas");
      ctx.drawImage(bitmap, 0, 0);
      const data = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const code = jsQR(data.data, canvas.width, canvas.height);
      if (!code?.data) {
        setError("Could not read a QR code in that image. Try a sharper, closer photo.");
        return;
      }
      run(code.data);
    } catch {
      setError("Could not process that image.");
    }
  }

  useEffect(() => {
    if (!camera) return;
    let raf = 0;
    let cancelled = false;

    (async () => {
      try {
        const jsQR = (await import("jsqr")).default;
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        const video = videoRef.current;
        if (!video) return;
        video.srcObject = stream;
        await video.play();

        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        const tick = () => {
          if (cancelled || !ctx || !video.videoWidth) {
            raf = requestAnimationFrame(tick);
            return;
          }
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          ctx.drawImage(video, 0, 0);
          const img = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const code = jsQR(img.data, canvas.width, canvas.height);
          if (code?.data) {
            run(code.data);
            return;
          }
          raf = requestAnimationFrame(tick);
        };
        raf = requestAnimationFrame(tick);
      } catch {
        setError("Camera unavailable. Upload a QR image instead.");
        setCamera(false);
      }
    })();

    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      streamRef.current?.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    };
  }, [camera]);

  function finish() {
    setPhase("done");
    if (result) recordScan({ kind: "qr", subject: result.subject, score: result.score, level: result.level });
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <PageHeader
        icon="🔳"
        title="QR Trust Check"
        subtitle="Scan or upload a payment QR. We decode the hidden UPI string and check the merchant before any money moves."
      />

      {phase === "idle" && (
        <div className="glass mx-auto max-w-2xl rounded-2xl p-7">
          <div className="scanline mx-auto flex aspect-square w-full max-w-xs items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed border-primary/40 bg-background/40">
            {camera ? (
              <video ref={videoRef} playsInline muted className="h-full w-full object-cover" />
            ) : (
              <div className="text-center">
                <p className="text-4xl">🔳</p>
                <p className="mt-2 font-mono text-xs uppercase tracking-[0.3em] text-muted-foreground">QR Scanner</p>
              </div>
            )}
            <div className="pointer-events-none absolute inset-x-6 top-0 h-16 animate-sweep bg-gradient-to-b from-transparent via-primary/40 to-transparent" />
          </div>

          {error && <p className="mt-4 text-center text-xs text-danger">{error}</p>}

          <div className="mt-6 space-y-3">
            <label className="glow-primary block cursor-pointer rounded-xl bg-primary py-3 text-center font-semibold text-primary-foreground">
              Upload QR Image
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) void decodeFile(f);
                }}
              />
            </label>
            <p className="text-center font-mono text-xs text-muted-foreground">OR</p>
            <button
              onClick={() => (camera ? stopCamera() : setCamera(true))}
              className="w-full rounded-xl border border-border bg-secondary py-3 font-semibold"
            >
              {camera ? "Stop Camera" : "Open Camera"}
            </button>
          </div>

          <div className="mt-6 border-t border-border pt-5">
            <p className="font-mono text-xs uppercase tracking-[0.3em] text-muted-foreground">No QR handy?</p>
            <div className="mt-3 flex flex-wrap gap-3">
              <button
                onClick={() => run(DEMO.qrSafe)}
                className="rounded-xl border border-border px-4 py-2 text-sm text-safe"
              >
                Demo: genuine shop QR
              </button>
              <button
                onClick={() => run(DEMO.qrRisky)}
                className="rounded-xl border border-border px-4 py-2 text-sm text-danger"
              >
                Demo: fake cashback QR
              </button>
            </div>
          </div>
        </div>
      )}

      {phase === "scanning" && (
        <div className="mx-auto max-w-2xl">
          <ScanProgress
            title="QR analysis in progress..."
            checks={QR_CHECKS}
            failing={result && result.level !== "low" ? "Suspicious payment handle detected" : null}
            onDone={finish}
          />
        </div>
      )}

      {phase === "done" && result && (
        <>
          <p className="mb-4 break-all text-center font-mono text-xs text-muted-foreground">
            Decoded payload: {payload}
          </p>
          <ScanResultView
            result={result}
            onReset={() => {
              setPhase("idle");
              setResult(null);
              setPayload("");
            }}
            resetLabel="← Scan Another QR"
          />
        </>
      )}
    </div>
  );
}
