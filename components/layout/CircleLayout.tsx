"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import LogoSmall from "../assets/LogoSmall";
import Session from "../session/Session";
import LegalLinks from "../ui/LegalLinks";

interface CircleLayoutProps {
  children?: React.ReactNode;
  header?: React.ReactNode;
  footer?: React.ReactNode;
}

const CircleLayout = ({ children = null, header = null, footer = null }: CircleLayoutProps) => {
  useEffect(() => {
    document.body.classList.add("scroll-lock");
    return () => document.body.classList.remove("scroll-lock");
  }, []);

  return (
    <div className="flex items-center justify-center w-full h-full py-[15px]">
      <div className="flex flex-col justify-around w-full h-full">
        <div className="flex-1 relative">
          <div className="absolute z-10 top-5 right-5">
            <Session />
          </div>
          <div className="absolute z-10 top-5 left-5 h-[8vw] max-h-[50px]">
            <Link href="/">
              <LogoSmall className="w-auto h-full" />
            </Link>
          </div>
          {header}
        </div>
        <div className="relative flex-none w-[500px] max-w-[80%] mx-auto overflow-hidden rounded-full bg-grey [mask-image:radial-gradient(white,black)]">
          <div className="w-full h-0 pb-[100%]">{children}</div>
        </div>
        <div className="flex flex-1 flex-col items-center justify-start">
          <LegalLinks />
          {footer}
        </div>
      </div>
    </div>
  );
};

export default CircleLayout;
