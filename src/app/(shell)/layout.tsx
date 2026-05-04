import { ShellClient } from '@/components/layout/shell-client';

export default function ShellLayout({ children }: { children: React.ReactNode }) {
  return <ShellClient>{children}</ShellClient>;
}
