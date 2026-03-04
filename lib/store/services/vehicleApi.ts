import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { VehicleProfile } from "@/lib/rdw/types";

export const vehicleApi = createApi({
  reducerPath: "vehicleApi",
  baseQuery: fetchBaseQuery({ baseUrl: "/api" }),
  endpoints: (builder) => ({
    getVehicleByPlate: builder.query<VehicleProfile, string>({
      query: (plate) => `/vehicle/${encodeURIComponent(plate)}`
    })
  })
});

export const { useGetVehicleByPlateQuery } = vehicleApi;

