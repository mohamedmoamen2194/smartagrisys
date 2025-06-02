import { ReactNode } from 'react'

declare module 'react' {
  export = React;
  export as namespace React;
  interface JSX {
    IntrinsicElements: {
      [elemName: string]: any;
    }
  }
}

declare module 'react-dom' {
  export = ReactDOM;
  export as namespace ReactDOM;
}

declare module 'sonner' {
  export * from 'sonner';
  export const toast: {
    error: (message: string) => void;
    success: (message: string) => void;
  };
}

declare module 'lucide-react' {
  export * from 'lucide-react';
  export const Package: (props: any) => ReactNode;
  export const Plus: (props: any) => ReactNode;
  export const Search: (props: any) => ReactNode;
  export const Edit: (props: any) => ReactNode;
  export const Trash2: (props: any) => ReactNode;
}

declare module '@/*' {
  const content: any;
  export default content;
} 