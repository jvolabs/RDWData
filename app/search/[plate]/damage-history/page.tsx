import { DamageHistoryScreen } from "@/components/vehicle/DamageHistoryScreen";

type Props = {
  params: { plate: string };
};

export default function DamageHistoryPage({ params }: Props) {
  return <DamageHistoryScreen plate={params.plate} />;
}
