import { MarketAnalysisScreen } from "@/components/vehicle/MarketAnalysisScreen";

type Props = {
  params: { plate: string };
};

export default function MarketAnalysisPage({ params }: Props) {
  return <MarketAnalysisScreen plate={params.plate} />;
}
