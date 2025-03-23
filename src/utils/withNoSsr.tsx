import { useReducer, useEffect } from "react";

export function withNoSsr<Props extends Record<string, unknown>>(
  Component: React.ComponentType<Props>
) {
  function ComponentWithNoSsr(props: Props) {
    const [shouldRender, readyToRender] = useReducer(() => true, false);

    useEffect(() => {
      readyToRender();
    }, []);

    if (!shouldRender) {
      return null;
    }

    return <Component {...props} />;
  }

  ComponentWithNoSsr.displayName =
    Component.displayName ?? Component.name ?? ComponentWithNoSsr.name;

  return ComponentWithNoSsr;
}
