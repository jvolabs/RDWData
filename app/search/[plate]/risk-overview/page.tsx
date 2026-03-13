import { RiskOverviewScreen } from "@/components/vehicle/RiskOverviewScreen";

type Props = {
  params: { plate: string };
};

export default function RiskOverviewPage({ params }: Props) {
  return <RiskOverviewScreen plate={params.plate} />;
}
