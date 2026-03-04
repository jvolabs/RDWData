import { NextResponse } from "next/server";
import { getVehicleProfile } from "@/lib/rdw/service";
import { parsePlateOrThrow } from "@/lib/api/plate";
import { errorResponse } from "@/lib/api/errors";

type Params = { params: { plate: string } };

export async function GET(_: Request, { params }: Params) {
  try {
    const plate = parsePlateOrThrow(params.plate);
    const profile = await getVehicleProfile(plate);
    return NextResponse.json(profile);
  } catch (error) {
    return errorResponse(error, "Unknown lookup error.");
  }
}
