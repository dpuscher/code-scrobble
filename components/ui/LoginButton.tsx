import React from "react";
import LastfmIcon from "../icons/LastfmIcon";

const LoginButton = (props: React.ButtonHTMLAttributes<HTMLButtonElement>) => (
  <button
    type="button"
    title="Login with Last.fm"
    className="inline-flex flex-col items-start px-[25px] py-[10px] transition-[box-shadow,transform] duration-[250ms] border border-[#d51007] rounded-[5px] bg-lastfm shadow-[0px_2px_0px_#d51007] text-white text-[13px] cursor-pointer active:translate-y-[3px] active:shadow-none"
    {...props}
  >
    <span className="mb-[5px]">Login with</span>
    <LastfmIcon alt="Last.fm" />
  </button>
);

export default LoginButton;
