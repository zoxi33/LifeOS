import { FinanceScreen } from '@/components/finance/finance-screen';
import { getFinanceData } from './actions';

export default async function FinancePage() {
  const data = await getFinanceData();
  return <FinanceScreen data={data} />;
}
