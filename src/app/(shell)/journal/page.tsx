import { JournalScreen } from '@/components/journal/journal-screen';
import { getJournalEntries } from './actions';

export default async function JournalPage() {
  const entries = await getJournalEntries();
  return <JournalScreen initialEntries={entries} />;
}
