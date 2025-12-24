import React from "react";

export default function Card({
  children,
  className = ""
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={
        "rounded-3xl bg-white shadow-soft border border-slate-100 " + className
      }
    >
      {children}
    </div>
  );
}
