import { VehicleResultScreen } from "@/components/vehicle/VehicleResultScreen";

type Props = {
  params: { plate: string };
};

export default function PlateResultPage({ params }: Props) {
  return <VehicleResultScreen plate={params.plate} />;
}
