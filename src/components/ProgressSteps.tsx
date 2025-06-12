"use client";

import { BookmarkPlus, Wand2, Send, Check } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface Step {
  id: string;
  title: string;
  href: string;
  icon: React.ElementType;
}

const steps: Step[] = [
  {
    id: "links",
    title: "Collect",
    href: "/links",
    icon: BookmarkPlus,
  },
  {
    id: "builder",
    title: "Create",
    href: "/builder",
    icon: Wand2,
  },
  {
    id: "export",
    title: "Share",
    href: "/export",
    icon: Send,
  },
];

interface ProgressStepsProps {
  currentStep?: string;
  completedSteps?: string[];
  className?: string;
}

export default function ProgressSteps({
  currentStep,
  completedSteps = [],
  className = "",
}: ProgressStepsProps) {
  const pathname = usePathname();

  // Auto-detect current step from pathname if not provided
  const detectedStep =
    currentStep || steps.find((step) => pathname.includes(step.id))?.id;

  const getStepStatus = (stepId: string) => {
    if (completedSteps.includes(stepId)) return "completed";
    if (stepId === detectedStep) return "current";
    return "upcoming";
  };

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div className="flex items-center gap-2">
        {steps.map((step, index) => {
          const Icon = step.icon;
          const status = getStepStatus(step.id);
          const isLast = index === steps.length - 1;

          return (
            <div key={step.id} className="flex items-center">
              <Link
                href={step.href}
                className={`
                  group flex items-center gap-3 px-4 py-2 rounded-lg transition-all
                  ${
                    status === "current"
                      ? "bg-neutral-900 text-white"
                      : status === "completed"
                      ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                      : "text-neutral-500 hover:text-neutral-700 hover:bg-neutral-50"
                  }
                `}
              >
                <div
                  className={`
                  flex items-center justify-center w-6 h-6 rounded-full text-xs font-medium
                  ${
                    status === "current"
                      ? "bg-white text-neutral-900"
                      : status === "completed"
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-neutral-200 text-neutral-500 group-hover:bg-neutral-300"
                  }
                `}
                >
                  {status === "completed" ? (
                    <Check className="w-3 h-3" />
                  ) : (
                    <Icon className="w-3 h-3" />
                  )}
                </div>
                <span className="text-sm font-medium">{step.title}</span>
              </Link>

              {!isLast && (
                <div
                  className={`
                  w-8 h-px mx-2
                  ${
                    completedSteps.includes(step.id) &&
                    completedSteps.includes(steps[index + 1].id)
                      ? "bg-emerald-300"
                      : "bg-neutral-200"
                  }
                `}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
