"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import NProgress from "nprogress";
import QueryProvider from "./QueryProvider";

NProgress.configure({ showSpinner: false });

function NProgressObserver() {
  const pathname = usePathname();
  const prevPathname = useRef(pathname);

  useEffect(() => {
    if (prevPathname.current !== pathname) {
      NProgress.done();
      prevPathname.current = pathname;
    }
  }, [pathname]);

  return null;
}

export default function ScanProviders({ children }: { children: React.ReactNode }) {
  return (
    <QueryProvider>
      <NProgressObserver />
      {children}
    </QueryProvider>
  );
}
