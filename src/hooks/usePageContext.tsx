import {
  createContext,
  ReactNode,
  useContext,
  useLayoutEffect,
} from 'react';

export type PageHeaderState = {
  title: string | null;
  description?: string | null;
};

type PageContextType = PageHeaderState & {
  setPageContext: (context: PageHeaderState) => void;
  clearPageContext: () => void;
};

const noop = () => undefined;

const PageContext = createContext<PageContextType>({
  title: null,
  description: null,
  setPageContext: noop,
  clearPageContext: noop,
});

type PageContextProviderProps = {
  children: ReactNode;
  value: PageContextType;
};

export function PageContextProvider({
  children,
  value,
}: PageContextProviderProps) {
  return <PageContext.Provider value={value}>{children}</PageContext.Provider>;
}

export function usePageContext() {
  return useContext(PageContext);
}

export function usePageHeader(context: PageHeaderState) {
  const { setPageContext, clearPageContext } = usePageContext();

  useLayoutEffect(() => {
    setPageContext({
      title: context.title ?? null,
      description: context.description ?? null,
    });

    return () => clearPageContext();
  }, [clearPageContext, context.description, context.title, setPageContext]);
}
