import 'framer-motion';

declare module 'framer-motion' {
  export interface HTMLMotionProps<T extends keyof JSX.IntrinsicElements> {
    variants?: any;
    initial?: any;
    animate?: any;
    exit?: any;
    whileHover?: any;
    whileTap?: any;
    whileInView?: any;
    viewport?: any;
    transition?: any;
  }
}
