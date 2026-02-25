import NextLink from "next/link";

const LegalLinks = () => (
  <div className="flex absolute right-[15px] bottom-[5px] text-[12px]">
    <NextLink href="/privacy" className="px-[10px] py-[10px]">
      Privacy
    </NextLink>
    <NextLink href="/legal" className="px-[10px] py-[10px]">
      Legal
    </NextLink>
  </div>
);

export default LegalLinks;
