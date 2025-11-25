"use client";

import { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

interface LabelValuePairProps {
  label: string;
  value: string | ReactNode;
  labelClassName?: string;
  valueClassName?: string;
  containerClassName?: string;
  showBorder?: boolean;
}

export function LabelValuePair({
  label,
  value,
  labelClassName,
  valueClassName,
  containerClassName,
  showBorder = true,
}: LabelValuePairProps) {
  return (
    <div
      className={cn(
        "flex items-center justify-between flex-1",
        showBorder && "border-b border-gray-200 pb-2",
        containerClassName
      )}
    >
      <span
        className={cn(
          "text-sm font-bold text-black min-w-24",
          labelClassName
        )}
      >
        {label}
      </span>
      <span
        className={cn(
          "text-sm text-gray-500",
          valueClassName
        )}
      >
        {value}
      </span>
    </div>
  );
}

