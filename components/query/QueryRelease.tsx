"use client";

import React, { useRef, useState } from "react";
import Head from "next/head";
import Link from "next/link";
import { IoIosSearch } from "react-icons/io";
import { MdClose } from "react-icons/md";
import compact from "lodash/compact";
import { trackEvent } from "../../lib/analytics";
import NoResultsIcon from "../icons/NoResultsIcon";
import LogoIcon from "../icons/LogoIcon";
import Loading from "../layout/Loading";
import { useSearch } from "../../client/hooks/useSearch";

export default function QueryRelease() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [searched, setSearched] = useState(false);

  const { data: results = [], isFetching } = useSearch(query, searched);

  const reset = () => {
    setQuery("");
    setSearched(false);
  };

  const handleOpen = () => {
    reset();
    trackEvent("Detect", "Query Release");
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSearched(false);
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    inputRef.current?.blur();
    setSearched(true);
  };

  let content = (
    <div className="flex flex-1 flex-col items-center justify-center">
      <LogoIcon color="#F4F4F4" className="w-[50%] h-auto" />
    </div>
  );
  if (isFetching) {
    content = (
      <div className="flex flex-1 flex-col items-center justify-center">
        <div className="relative w-full h-0 pb-[100%]">
          <Loading />
        </div>
      </div>
    );
  } else if (results.length) {
    content = (
      <div className="pt-[10px] overflow-auto [-webkit-overflow-scrolling:touch]">
        {results.map(({ id, title, thumb, country, year, format = [] }: any) => (
          <Link key={id} href={`/detected/id:${id}`} className="flex w-full mb-[10px] text-dark no-underline">
            <div className="block flex-none w-[60px] h-[60px] mr-[10px]">
              <img src={thumb} alt={title} width={60} height={60} className="w-[60px] h-[60px] object-cover" />
            </div>
            <div className="flex flex-col flex-grow">
              <div className="max-h-[2.3em] overflow-hidden font-semibold">
                {title}
                {year && ` (${year})`}
              </div>
              <div className="h-[1.15em] mt-[8px] overflow-hidden text-[13px]">
                {compact([country, (format || []).join(", ")]).join(" · ")}
              </div>
            </div>
          </Link>
        ))}
      </div>
    );
  } else if (searched && !isFetching) {
    content = (
      <div className="flex flex-1 flex-col items-center justify-center text-center">
        <NoResultsIcon className="mb-5" />
        No results were found
        <br />
        for your query
      </div>
    );
  }

  return (
    <div className="relative w-[500px] max-w-[80%] h-full mx-auto">
      <button
        onClick={handleOpen}
        className="absolute z-10 bottom-0 left-0 w-[15%] p-[2.5%] appearance-none translate-y-full border-0 bg-transparent text-inherit cursor-pointer"
      >
        <IoIosSearch className="w-full h-auto" />
      </button>
      {open && (
        <div className="fixed inset-0 z-10 flex items-center justify-center overflow-auto bg-black/70 backdrop-blur-[10px] [-webkit-overflow-scrolling:touch]">
          <Head>
            <link rel="preconnect" href="https://img.discogs.com" />
          </Head>
          <div className="relative flex flex-col w-full max-w-[600px] h-[calc(100%-60px)] m-[40px_20px_20px] p-5 rounded-[3px] bg-white text-dark">
            <button
              onClick={handleClose}
              className="absolute top-[-40px] right-0 py-[5px] appearance-none border-0 bg-transparent text-inherit cursor-pointer"
            >
              <MdClose size="30" color="#d4d4dc" />
            </button>
            <form
              onSubmit={onSubmit}
              className="relative flex-none h-[38px] -mx-5 -mt-5 overflow-hidden border-b border-dark"
            >
              {}
              <input
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Search release..."
                autoFocus
                ref={inputRef}
                className="w-full m-0 p-[10px_45px_10px_10px] border-0 rounded-[3px] shadow-none text-[16px] leading-none text-center outline-none"
              />
              {}
              <button
                type="submit"
                className="flex absolute top-0 right-0 items-center justify-center w-[45px] h-[38px] border-0 bg-transparent cursor-pointer appearance-none"
              >
                <IoIosSearch size={30} />
              </button>
            </form>
            {content}
          </div>
        </div>
      )}
    </div>
  );
}
