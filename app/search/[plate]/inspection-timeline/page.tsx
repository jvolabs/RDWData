import { InspectionTimelineScreen } from "@/components/vehicle/InspectionTimelineScreen";

type Props = {
  params: { plate: string };
};

export default function InspectionTimelinePage({ params }: Props) {
  return <InspectionTimelineScreen plate={params.plate} />;
}
