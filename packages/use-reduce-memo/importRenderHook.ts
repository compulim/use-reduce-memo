type RenderHook = <T, P>(
  render: (props: P) => T,
  options?: { initialProps: P }
) => { rerender: (props: P) => void; result: { current: T } };

async function importRenderHook(): Promise<RenderHook> {
  let renderHook: RenderHook | undefined;

  try {
    // @ts-ignore
    renderHook = (await import('@testing-library/react')).renderHook;
  } catch {}

  if (renderHook) {
    return renderHook;
  }

  // @ts-ignore
  return (await import('@testing-library/react-hooks')).renderHook;
}

export { importRenderHook, type RenderHook };
