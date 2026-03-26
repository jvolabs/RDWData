import { MileageTimelineScreen } from "@/components/vehicle/MileageTimelineScreen";

type Props = {
  params: { plate: string };
};

export default function MileageHistoryPage({ params }: Props) {
  return <MileageTimelineScreen plate={params.plate} />;
}
