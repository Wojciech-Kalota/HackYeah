import type { ComponentPropsWithoutRef } from 'react';

export function PageMain({
  children,
  ...props
}: ComponentPropsWithoutRef<'main'>) {
  return (
    <main id="main-content" tabIndex={-1} {...props}>
      {children}
    </main>
  );
}
