import { ShellClient } from '@/components/layout/shell-client';
import { getSidebarXP } from './actions';

export default async function ShellLayout({ children }: { children: React.ReactNode }) {
  const xp = await getSidebarXP();
  return <ShellClient xp={xp}>{children}</ShellClient>;
}
