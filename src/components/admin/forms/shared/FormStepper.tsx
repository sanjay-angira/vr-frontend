"use client";

import { Check } from "lucide-react";
import { Fragment } from "react";

export type FormStep = {
  id: number;
  label: string;
};

type FormStepperProps = {
  steps: FormStep[];
  currentStep: number;
  onStepClick?: (step: number) => void;
  fullWidth?: boolean;
};

export function FormStepper({
  steps,
  currentStep,
  onStepClick,
  fullWidth = true,
}: FormStepperProps) {
  if (!fullWidth) {
    return (
      <div className="mb-8">
        <div className="flex flex-wrap items-center gap-2">
          {steps.map((step, index) => {
            const isActive = step.id === currentStep;
            const isCompleted = step.id < currentStep;
            const isLast = index === steps.length - 1;

            return (
              <div key={step.id} className="flex items-center gap-2">
                <StepButton
                  step={step}
                  isActive={isActive}
                  isCompleted={isCompleted}
                  onStepClick={onStepClick}
                />
                {!isLast && (
                  <div className="hidden h-px w-8 bg-zinc-200 sm:block" aria-hidden="true" />
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="mb-8 w-full">
      <div className="flex w-full items-center">
        {steps.map((step, index) => {
          const isActive = step.id === currentStep;
          const isCompleted = step.id < currentStep;
          const isLast = index === steps.length - 1;

          return (
            <Fragment key={step.id}>
              <StepButton
                step={step}
                isActive={isActive}
                isCompleted={isCompleted}
                onStepClick={onStepClick}
                className="shrink-0"
              />
              {!isLast && (
                <div
                  className={`mx-3 h-px flex-1 ${
                    isCompleted ? "bg-emerald-300" : "bg-zinc-200"
                  }`}
                  aria-hidden="true"
                />
              )}
            </Fragment>
          );
        })}
      </div>
    </div>
  );
}

function StepButton({
  step,
  isActive,
  isCompleted,
  onStepClick,
  className = "",
}: {
  step: FormStep;
  isActive: boolean;
  isCompleted: boolean;
  onStepClick?: (step: number) => void;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={() => onStepClick?.(step.id)}
      disabled={!onStepClick}
      className={`inline-flex h-10 items-center gap-2 rounded-full px-4 text-sm font-medium transition-colors ${
        isActive
          ? "bg-zinc-100 text-zinc-800"
          : isCompleted
            ? "bg-emerald-50 text-emerald-700"
            : "bg-white text-zinc-500 hover:bg-zinc-50"
      } ${onStepClick ? "cursor-pointer" : "cursor-default"} ${className}`}
    >
      <span
        className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${
          isCompleted
            ? "bg-emerald-600 text-white"
            : isActive
              ? "bg-admin-primary text-white"
              : "bg-zinc-200 text-zinc-600"
        }`}
      >
        {isCompleted ? <Check className="h-3.5 w-3.5" /> : step.id}
      </span>
      <span className="whitespace-nowrap">{step.label}</span>
    </button>
  );
}
