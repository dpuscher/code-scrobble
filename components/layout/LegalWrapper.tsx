"use client";

import React from "react";

export function Wrapper({ children }: { children: React.ReactNode }) {
  return (
    <div className="w-full max-w-[768px] mx-auto pt-[72px] px-5 pb-5 leading-[1.4] break-words [&_h2]:mt-[1.5em] [&_h2]:mb-[0.5em] [&_h3]:mt-[1.5em] [&_h3]:mb-[0.5em] [&_hr]:my-[3em]">
      {children}
    </div>
  );
}

export function Anchor({ id }: { id?: string }) {
  return <div id={id} className="relative -top-[75px]" />;
}
