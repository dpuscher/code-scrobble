"use client";

import React, { useRef, useState } from "react";
import Head from "next/head";
import Link from "next/link";
import { IoIosSearch } from "react-icons/io";
import { MdClose } from "react-icons/md";
import compact from "lodash/compact";
import { trackEvent } from "../../lib/analytics";
import { silver } from "../../lib/colors";
import NoResultsIcon from "../icons/NoResultsIcon";
import Loading from "../layout/Loading";
import { useSearch } from "../../client/hooks/useSearch";
import {
  Button,
  CloseButton,
  Content,
  FallbackIcon,
  FallbackWrapper,
  HeadWrapper,
  Icon,
  Input,
  LoadingWrapper,
  Meta,
  Overlay,
  Result,
  ResultInfo,
  ResultWrapper,
  Submit,
  Thumbnail,
  ThumbnailWrapper,
  Title,
  Wrapper,
} from "./styles/QueryRelease.styles";

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
    <FallbackWrapper>
      <FallbackIcon color="#F4F4F4" />
    </FallbackWrapper>
  );
  if (isFetching) {
    content = (
      <FallbackWrapper>
        <LoadingWrapper>
          <Loading />
        </LoadingWrapper>
      </FallbackWrapper>
    );
  } else if (results.length) {
    content = (
      <ResultWrapper>
        {results.map(({ id, title, thumb, country, year, format = [] }: any) => (
          <Link key={id} href={`/detected/id:${id}`} passHref legacyBehavior>
            <Result>
              <ThumbnailWrapper>
                <Thumbnail src={thumb} alt={title} width={60} height={60} />
              </ThumbnailWrapper>
              <ResultInfo>
                <Title>
                  {title}
                  {year && ` (${year})`}
                </Title>
                <Meta>{compact([country, (format || []).join(", ")]).join(" · ")}</Meta>
              </ResultInfo>
            </Result>
          </Link>
        ))}
      </ResultWrapper>
    );
  } else if (searched && !isFetching) {
    content = (
      <FallbackWrapper css="text-align:center">
        <NoResultsIcon {...({ css: "margin-bottom:20px" } as any)} />
        No results were found
        <br />
        for your query
      </FallbackWrapper>
    );
  }

  return (
    <Wrapper>
      <Button onClick={handleOpen}>
        <Icon />
      </Button>
      {open && (
        <Overlay>
          <Head>
            <link rel="preconnect" href="https://img.discogs.com" />
          </Head>
          <Content>
            <CloseButton onClick={handleClose}>
              <MdClose size="30" color={silver} />
            </CloseButton>
            <HeadWrapper onSubmit={onSubmit}>
              {/* eslint-disable jsx-a11y/no-autofocus */}
              <Input
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Search release..."
                autoFocus
                ref={inputRef}
              />
              {/* eslint-enable jsx-a11y/no-autofocus */}
              <Submit type="submit">
                <IoIosSearch size={30} />
              </Submit>
            </HeadWrapper>
            {content}
          </Content>
        </Overlay>
      )}
    </Wrapper>
  );
}
