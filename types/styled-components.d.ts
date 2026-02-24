import type { CSSProp } from "styled-components";

declare module "react" {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface DOMAttributes<T> {
    css?: CSSProp;
  }
}
