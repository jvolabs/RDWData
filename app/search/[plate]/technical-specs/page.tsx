import { TechnicalSpecsScreen } from "@/components/vehicle/TechnicalSpecsScreen";

type Props = {
  params: { plate: string };
};

export default function TechnicalSpecsPage({ params }: Props) {
  return <TechnicalSpecsScreen plate={params.plate} />;
}
