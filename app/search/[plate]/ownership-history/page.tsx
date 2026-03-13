import { OwnershipTimelineScreen } from "@/components/vehicle/OwnershipTimelineScreen";

type Props = {
  params: { plate: string };
};

export default function OwnershipHistoryPage({ params }: Props) {
  return <OwnershipTimelineScreen plate={params.plate} />;
}
