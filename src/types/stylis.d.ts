declare module 'stylis-plugin-rtl' {
  import { Plugin } from 'stylis';
  const stylisRTLPlugin: Plugin;
  export default stylisRTLPlugin;
}

declare module 'stylis' {
  export type Plugin = (
    element: { type: string; props: string; children: string; line: number; column: number; length: number; return: string },
    index: number,
    children: any[],
    callback: (element: any) => any
  ) => string | void;

  export const prefixer: Plugin;
}
