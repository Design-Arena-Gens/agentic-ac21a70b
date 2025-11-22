"use client";

import Image from "next/image";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import clsx from "classnames";

const RAVEN_DURATION = 2800;
const BURST_DELAY = 600;
const REVEAL_DELAY = 1100;

type CustomImages = {
  source?: string;
  target?: string;
};

type ImageOption = {
  key: keyof CustomImages;
  label: string;
};

const fallbackImages: Record<keyof CustomImages, { src: string; alt: string }> = {
  source: {
    src: "/images/source-scene.svg",
    alt: "Original frame"
  },
  target: {
    src: "/images/target-scene.svg",
    alt: "Transformed frame"
  }
};

const imageSelectors: ImageOption[] = [
  { key: "source", label: "Set Source Image" },
  { key: "target", label: "Set Target Image" }
];

export function RavenTransition() {
  const [custom, setCustom] = useState<CustomImages>({});
  const [isAnimating, setIsAnimating] = useState(false);
  const [showTarget, setShowTarget] = useState(false);
  const [burstPhase, setBurstPhase] = useState<"idle" | "charge" | "burst">("idle");
  const timers = useRef<number[]>([]);
  const fileInputs = useRef<Record<keyof CustomImages, HTMLInputElement | null>>({
    source: null,
    target: null
  });
  const objectUrls = useRef<Record<string, string>>({});

  const activeImages = useMemo(() => {
    return {
      source: custom.source ?? fallbackImages.source.src,
      target: custom.target ?? fallbackImages.target.src
    };
  }, [custom]);

  const clearTimers = useCallback(() => {
    timers.current.forEach((timer) => window.clearTimeout(timer));
    timers.current = [];
  }, []);

  const playSequence = useCallback(() => {
    clearTimers();
    setIsAnimating(true);
    setShowTarget(false);
    setBurstPhase("charge");

    timers.current.push(
      window.setTimeout(() => {
        setBurstPhase("burst");
      }, BURST_DELAY)
    );

    timers.current.push(
      window.setTimeout(() => {
        setShowTarget(true);
      }, REVEAL_DELAY)
    );

    timers.current.push(
      window.setTimeout(() => {
        setIsAnimating(false);
        setBurstPhase("idle");
      }, RAVEN_DURATION)
    );
  }, [clearTimers]);

  useEffect(() => {
    playSequence();
    return () => {
      clearTimers();
      const urlsToRelease = Object.values(objectUrls.current);
      objectUrls.current = {};
      urlsToRelease.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [clearTimers, playSequence]);

  const handleFileChange = useCallback(
    (key: keyof CustomImages) => (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;

      const previousUrl = custom[key];
      if (previousUrl && objectUrls.current[previousUrl]) {
        URL.revokeObjectURL(objectUrls.current[previousUrl]);
        delete objectUrls.current[previousUrl];
      }

      const url = URL.createObjectURL(file);
      objectUrls.current[url] = url;

      setCustom((prev) => ({
        ...prev,
        [key]: url
      }));

      requestAnimationFrame(() => {
        playSequence();
      });
    },
    [custom, playSequence]
  );

  const handleTrigger = useCallback((key: keyof CustomImages) => {
    fileInputs.current[key]?.click();
  }, []);

  return (
    <div className="relative mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 pb-20 pt-16 md:px-10">
      <header className="relative z-10 flex flex-col gap-3 text-center md:gap-4">
        <h1 className="text-3xl font-semibold leading-tight text-white md:text-5xl">
          Raven Portal Transition
        </h1>
        <p className="mx-auto max-w-2xl text-base text-white/70 md:text-lg">
          Drop two stills to orchestrate a Raven-style portal sweep. The raven silhouette primes the
          scene, then propels a burst that carries you into the next frame.
        </p>
      </header>

      <section className="relative z-10 flex flex-col gap-6 md:flex-row md:items-start">
        <div className="relative flex-1">
          <div className="relative aspect-[16/9] overflow-hidden rounded-3xl border border-white/10 bg-black shadow-[0_32px_70px_rgba(0,0,0,0.65)]">
            <div className="starfield" aria-hidden="true" />

            <div className="absolute inset-0">
              <Image
                src={activeImages.target}
                fill
                alt="Target frame"
                priority
                className={clsx(
                  "object-cover transition-opacity duration-700 ease-out",
                  showTarget ? "opacity-100" : "opacity-0"
                )}
              />
            </div>

            <div className="absolute inset-0">
              <Image
                src={activeImages.source}
                fill
                alt="Source frame"
                priority
                className={clsx(
                  "object-cover transition-opacity duration-700 ease-out",
                  showTarget ? "opacity-0" : "opacity-100"
                )}
              />
            </div>

            <RavenSilhouette animate={isAnimating} />
            <PortalAura phase={burstPhase} animate={isAnimating} />
          </div>
          <div className="mt-5 flex flex-wrap justify-center gap-3 md:justify-start">
            <button
              type="button"
              onClick={playSequence}
              className="rounded-full bg-gradient-to-r from-raven-500 via-raven-600 to-raven-700 px-5 py-2 text-sm font-medium uppercase tracking-widest text-white shadow-raven-core ring-1 ring-white/20 transition hover:shadow-[0_0_70px_rgba(124,95,255,0.6)] hover:ring-white/40"
            >
              Replay Sequence
            </button>
            {imageSelectors.map(({ key, label }) => (
              <button
                key={key}
                type="button"
                onClick={() => handleTrigger(key)}
                className="rounded-full border border-white/20 px-5 py-2 text-sm font-medium uppercase tracking-widest text-white/70 transition hover:border-white/40 hover:text-white"
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <aside className="flex w-full max-w-md flex-col gap-4 rounded-3xl border border-white/10 bg-white/5 p-6 text-sm text-white/70 shadow-[0_12px_40px_rgba(0,0,0,0.4)] backdrop-blur">
          <h2 className="text-lg font-semibold text-white">Quick Controls</h2>
          <p>
            Personalize the sequence with your stills. The raven mask sweeps from left to right,
            pulling a portal wake that bursts open to the target frame.
          </p>
          <ul className="list-disc space-y-1 pl-5">
            <li>Use high-contrast PNG or JPEG images for a clean silhouette trace.</li>
            <li>Horizontal frames (16:9) showcase the flight path best.</li>
            <li>Click &ldquo;Replay&rdquo; to reset timing after swapping imagery.</li>
          </ul>
        </aside>
      </section>

      {imageSelectors.map(({ key }) => (
        <input
          key={key}
          type="file"
          accept="image/*"
          hidden
          ref={(node) => {
            fileInputs.current[key] = node;
          }}
          onChange={handleFileChange(key)}
        />
      ))}
    </div>
  );
}

type AuraProps = {
  phase: "idle" | "charge" | "burst";
  animate: boolean;
};

function RavenSilhouette({ animate }: { animate: boolean }) {
  return (
    <div
      className={clsx(
        "pointer-events-none absolute inset-0 flex items-center justify-center",
        animate ? "opacity-100" : "opacity-0 transition-opacity duration-500"
      )}
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 640 360"
        className={clsx(
          "h-[70%] w-[70%] max-w-[540px] drop-shadow-[0_0_45px_rgba(120,96,255,0.55)]",
          animate && "animate-raven-flight"
        )}
      >
        <defs>
          <linearGradient id="ravenGradient" x1="0%" x2="100%" y1="0%" y2="0%">
            <stop offset="0%" stopColor="#2d1a57" />
            <stop offset="60%" stopColor="#6b4fe2" />
            <stop offset="100%" stopColor="#9e78ff" />
          </linearGradient>
        </defs>
        <path
          d="M562.8 194.3c-27 24.5-54.8 43.8-91.4 51.8-12.3 2.6-21.1 9-26 20.8-1.5 3.5-4.3 7-7.2 9.4-20.6 17-44.1 24.8-70.4 17.3-6.4-1.8-11.8-.8-17.6 1.6-33.2 13.5-65.6 11.6-96.3-7.5-11.1-6.8-18-16.8-24-28.2-14.7-27.8-27.5-56.6-46.9-81.7-15-19.6-33.4-34.3-56.7-41.7-13.9-4.4-27.4-10-40.9-15.8-4.4-1.9-8.6-4.6-12.3-7.6-15.4-12.3-10.8-32.5 8.7-39 4.8-1.6 10.3-2.3 15.3-1.7 24.4 2.8 46.9 11.8 68.8 22.8 3.6 1.8 7.2 3.9 10.7 6 1.5.9 3 .9 3.8-1.1 1.7-4.2 4.2-8.1 5.5-12.4 4.4-15 15.5-21.3 30.1-23 15.7-1.9 31.2.6 46.5 3.2 5.8 1 11.3 3.7 16.8 5.9 2.6 1 4.1.6 5.3-1.9 10.9-22.7 29.5-32.7 54-34.2 17.6-1.1 34.6 1.7 51 8.4 14.1 5.8 26.6 14.5 32.6 29.6 1.4 3.5 3.4 4.3 6.6 3.5 18.4-4.4 34.3 1.1 48.4 12.6 5.5 4.4 10.3 9.6 15.4 14.5 1.3 1.3 2.5 2.6 4.6 4.9-9.5-.4-17.8-.8-26.1-1.1-1.3 0-2.6.5-3.8.8 18.8 25.7 41 47.4 62.5 69.7-5.9 0-11.2-.1-16.4-.1 2.1 18.8 16.7 26 30.9 32.8z"
          fill="url(#ravenGradient)"
          filter="url(#glow)"
        />
        <defs>
          <filter id="glow" height="300%" width="300%" x="-75%" y="-75%">
            <feGaussianBlur stdDeviation="8" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
      </svg>
      <style jsx>{`
        .animate-raven-flight {
          animation: ravenFlight ${RAVEN_DURATION}ms cubic-bezier(0.32, 0.01, 0.15, 0.99) forwards;
        }

        @keyframes ravenFlight {
          0% {
            transform: translate3d(-120%, 10%, 0) scale(0.75) rotate(-6deg);
            opacity: 0;
          }
          20% {
            opacity: 1;
          }
          52% {
            transform: translate3d(-6%, -5%, 0) scale(0.96) rotate(2deg);
          }
          100% {
            transform: translate3d(110%, -18%, 0) scale(1.15) rotate(6deg);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}

function PortalAura({ phase, animate }: AuraProps) {
  return (
    <div
      className={clsx(
        "pointer-events-none absolute inset-0 flex items-center justify-center",
        animate ? "opacity-100" : "opacity-0 transition-opacity duration-500"
      )}
      aria-hidden="true"
    >
      <div
        className={clsx(
          "h-full w-full max-w-4xl rounded-full bg-gradient-to-r from-raven-700/0 via-raven-500/25 to-transparent blur-3xl transition-transform duration-500 ease-out",
          phase === "charge" && "scale-95 opacity-70",
          phase === "burst" && "scale-110 opacity-100",
          phase !== "idle" && "animate-energy-pulse"
        )}
      />
      <div
        className={clsx(
          "absolute h-96 w-96 rounded-full bg-raven-500/25 mix-blend-screen blur-3xl transition-all",
          phase === "burst" ? "scale-125 opacity-70" : "opacity-0"
        )}
      />
    </div>
  );
}
