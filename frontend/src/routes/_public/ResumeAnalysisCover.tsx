import { useNavigate } from "@tanstack/react-router";
import { motion } from "framer-motion";
import type { ComponentType } from "react";
import {
  BarChart3,
  BrainCircuit,
  Lightbulb,
  Target,
  Upload,
} from "lucide-react";

import { Button } from "@/components/ui/button";

type Feature = {
  label: string;
  icon: ComponentType<{ className?: string }>;
};

const features: Feature[] = [
  { label: "ATS Score & Analysis", icon: BarChart3 },
  { label: "Skill Gap Identification", icon: Target },
  { label: "Personalized Recommendations", icon: Lightbulb },
];

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 },
};

export default function ResumeAnalysisCover() {
  const navigate = useNavigate();

  return (
    <main className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_18%_16%,rgba(90,92,255,0.10),transparent_28%),radial-gradient(circle_at_84%_82%,rgba(255,180,59,0.10),transparent_26%),linear-gradient(135deg,#fbfbff_0%,#f4f6ff_100%)] px-5 py-8 text-[#07144a] sm:px-8 lg:px-16 lg:py-12">
      
      <Button
        variant="outline"
        onClick={() => navigate({ to: "/" })}
        className="absolute left-6 top-6 z-20"
      >
        Back
      </Button>

      <DeskPencil />
      <DeskPen />

      <section className="relative z-10 mx-auto grid min-h-[calc(100vh-7rem)] w-full max-w-7xl items-center gap-11 lg:grid-cols-[0.92fr_1.08fr] lg:gap-16 xl:gap-20">
        <motion.div
          className="lg:pl-10"
          initial="hidden"
          animate="visible"
          transition={{ staggerChildren: 0.12 }}
        >
          <motion.div
            variants={fadeUp}
            className="mb-6 inline-flex items-center gap-2.5 rounded-2xl bg-[#e9ebff] px-4 py-3 text-sm font-extrabold uppercase text-[#5a5cff] sm:mb-8"
          >
            <BrainCircuit className="h-5 w-5" />
            AI Powered
          </motion.div>

          <motion.h1
            variants={fadeUp}
            className="max-w-xl text-[clamp(3rem,8vw,5.4rem)] font-black leading-[0.92]"
          >
            Resume
            <br />
            Analysis
          </motion.h1>

          <motion.p
            variants={fadeUp}
            className="mt-7 max-w-lg text-lg font-medium leading-8 text-[#53627e]"
          >
            Get AI-powered insights about your resume, improve your skills, and
            land your dream job faster.
          </motion.p>

          <motion.ul variants={fadeUp} className="mt-8 grid gap-4">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <li
                  className="flex items-center gap-4 text-base font-bold"
                  key={feature.label}
                >
                  <span className="grid h-11 w-11 place-items-center rounded-full bg-[#e9ebff] text-[#5a5cff]">
                    <Icon className="h-5 w-5" />
                  </span>
                  {feature.label}
                </li>
              );
            })}
          </motion.ul>

          <motion.div variants={fadeUp} className="mt-9">
            <Button
              type="button"
              size="lg"
              className="h-14 rounded-xl bg-[#585cff] px-8"
              onClick={() => navigate({ to: "/resume-analysis" })}
            >
              <Upload className="mr-2 h-5 w-5" />
              Upload Resume
            </Button>
          </motion.div>
        </motion.div>

        <motion.div
          className="-translate-x-20"
          initial={{ opacity: 0, scale: 0.96, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
        >
          <ResumeIllustration />
        </motion.div>
      </section>
    </main>
  );
}


function ResumeIllustration() {
  return (
    <div
      className="relative min-h-[430px] overflow-hidden rounded-3xl bg-[radial-gradient(circle_at_44%_48%,rgba(255,255,255,0.62)_0_25%,transparent_26%),linear-gradient(135deg,#c8d5ff_0%,#dce5ff_52%,#c9d6ff_100%)] shadow-[0_24px_60px_rgba(58,78,156,0.16)] sm:min-h-[560px] lg:min-h-[min(58vw,610px)]"
      aria-label="Resume analysis illustration"
    >
      <motion.div
        className="absolute right-[14%] top-[9%] aspect-[1.24] w-[24%] rounded-lg bg-white/90 shadow-[0_12px_28px_rgba(33,51,110,0.10)]"
        animate={{ y: [0, -7, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      >
        <div className="absolute left-[12%] top-[13%] aspect-square w-[52%] rounded-full bg-[conic-gradient(#123a8a_0_34%,#ffb33b_34%_58%,#7db1e7_58%_76%,#cad8ef_76%_100%)] after:absolute after:inset-[18%] after:rounded-full after:bg-white" />
        <div className="absolute right-[10%] top-[42%] grid w-[26%] gap-1.5">
          <Line />
          <Line short />
          <Line tiny />
        </div>
      </motion.div>

      <div className="absolute left-[20%] top-[29%] h-[35%] w-[58%] rounded-xl bg-white/95 shadow-[0_18px_42px_rgba(33,51,110,0.13)]">
        <div className="absolute left-[8%] right-[8%] top-[13%] grid gap-2">
          <Line />
          <Line short />
          <Line />
          <Line tiny />
        </div>
        <span className="absolute left-[54%] top-[42%] h-8 w-24 rounded-full bg-[#ffb43b]" />
        <span className="absolute right-[5%] top-[26%] h-8 w-20 rounded-full bg-[#ffb43b]" />
        <span className="absolute left-[31%] top-[49%] h-[24%] w-[48%] skew-x-[-22deg] rounded-br-xl border-b-[22px] border-r-[22px] border-[#ffb43b]" />
      </div>

      <div className="absolute left-[31%] top-[15%] h-14 w-16 rounded-xl bg-white/45 before:absolute before:left-5 before:top-0 before:h-9 before:w-12 before:rounded-md before:bg-[#2f60f6] before:shadow-[inset_13px_10px_0_-8px_rgba(255,255,255,0.85),inset_13px_20px_0_-8px_rgba(255,255,255,0.85)]" />

      <Person variant="mini" />
      <Leaf className="left-[5%] bottom-[26%] rotate-[22deg] bg-[#111f56]" />
      <Leaf className="left-[10%] bottom-[20%] rotate-[10deg] bg-[#ffb43b]" />
      <Leaf className="right-[5%] bottom-[26%] -scale-x-100 rotate-[-22deg] bg-[#111f56]" />
      <Leaf className="right-[10%] bottom-[20%] -scale-x-100 rotate-[-10deg] bg-[#ffb43b]" />
      <span className="absolute bottom-[9%] left-[20%] right-[20%] h-5 rounded-full bg-white/90" />
      <Person variant="left" />
      <Person variant="right" />
    </div>
  );
}

function Line({ short = false, tiny = false }: { short?: boolean; tiny?: boolean }) {
  return (
    <span
      className={[
        "h-2 rounded-full bg-[#bde5c1]",
        short ? "w-[72%]" : "",
        tiny ? "w-[45%]" : "",
      ].join(" ")}
    />
  );
}

function Leaf({ className }: { className: string }) {
  return (
    <span className={`absolute h-[8%] w-[16%] rounded-[100%_0_100%_0] ${className}`} />
  );
}

function Person({ variant }: { variant: "left" | "right" | "mini" }) {
  const isMini = variant === "mini";
  const position =
    variant === "mini"
      ? "left-[16%] top-[17%] h-[31%] w-[13%]"
      : variant === "left"
        ? "bottom-[10%] left-[27%] h-[42%] w-[18%]"
        : "bottom-[10%] right-[27%] h-[42%] w-[18%]";

  return (
    <div className={`absolute ${position}`}>
      <span className="absolute left-[38%] top-0 aspect-square w-[24%] rounded-[45%_45%_50%_50%] bg-[#ff9a4a]" />
      <span className="absolute left-[33%] top-[-4%] aspect-square w-[26%] rounded-[55%_45%_30%_40%] bg-[#08194d]" />
      <span
        className={[
          "absolute left-[22%] top-[23%] h-[44%] w-[56%] rounded-t-[20px] rounded-b-md",
          isMini ? "bg-[#315df4]" : "bg-[linear-gradient(120deg,#0d3f93,#1a63b8)]",
        ].join(" ")}
      />

      {!isMini && (
        <>
          <span className="absolute left-[44%] top-[23%] h-[36%] w-[12%] bg-white [clip-path:polygon(0_0,100%_0,72%_100%,28%_100%)]" />
          <span className="absolute left-[48%] top-[32%] h-[28%] w-[5%] bg-[#ffb43b]" />
          <span
            className={[
              "absolute top-[35%] h-[10%] w-[52%] rounded-full bg-[#ff9a4a]",
              variant === "left"
                ? "right-[-18%] origin-right rotate-[24deg]"
                : "left-[-18%] origin-left rotate-[-24deg]",
            ].join(" ")}
          />
        </>
      )}

      <span className="absolute bottom-0 left-[31%] h-[36%] w-[15%] rotate-[4deg] rounded-b-lg bg-[#08194d]" />
      <span className="absolute bottom-0 right-[31%] h-[36%] w-[15%] rotate-[-4deg] rounded-b-lg bg-[#08194d]" />
    </div>
  );
}

function DeskPencil() {
  return (
    <svg
      className="pointer-events-none absolute left-6 top-8 z-0 hidden h-[min(78vh,760px)] w-14 rotate-[-4deg] drop-shadow-[0_18px_22px_rgba(10,20,60,0.20)] lg:block xl:left-12"
      viewBox="0 0 64 820"
      aria-hidden="true"
    >
      <path fill="#15171d" d="M31 8 48 92 52 730 12 730 17 92z" />
      <path fill="#2a2d34" d="M31 8 35 95 35 730 12 730 17 92z" opacity=".72" />
      <path fill="#f7a84a" d="M24 48h16l8 44H17z" />
      <path fill="#f8dbc5" d="M31 8 24 48h16z" />
      <path fill="#090a0d" d="M31 8 28 25h6z" />
      <path fill="#0b0c10" d="M12 730h40v44H12z" />
      <path fill="#25262c" d="M15 742h34v9H15zm0 17h34v9H15z" />
    </svg>
  );
}

function DeskPen() {
  return (
    <svg
      className="pointer-events-none absolute bottom-6 right-6 z-0 hidden h-[min(64vh,590px)] w-24 rotate-12 drop-shadow-[0_18px_22px_rgba(10,20,60,0.20)] lg:block xl:right-12"
      viewBox="0 0 120 720"
      aria-hidden="true"
    >
      <path fill="#f4f5f7" d="M46 15h28l10 74H36z" />
      <path fill="#121318" d="M35 82h50l13 270-75 12z" />
      <path fill="#2a2b30" d="M47 82h38l8 260-43 7z" opacity=".72" />
      <path fill="#f2f2f3" d="M22 364 98 352 83 646 36 654z" />
      <path fill="#111216" d="M34 654h49l-4 38H39z" />
      <path fill="#cfd2d8" d="m45 383 39-7-44 247-10 2z" opacity=".68" />
      <path fill="none" stroke="#9ea4ad" strokeWidth="4" d="M21 141c-14 18-10 111 16 128" />
      <path fill="#111216" d="M31 124h20v150H31z" />
    </svg>
  );
}
