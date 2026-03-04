import { configureStore } from "@reduxjs/toolkit";
import { vehicleApi } from "@/lib/store/services/vehicleApi";

export const makeStore = () =>
  configureStore({
    reducer: {
      [vehicleApi.reducerPath]: vehicleApi.reducer
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(vehicleApi.middleware)
  });

export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore["getState"]>;
export type AppDispatch = AppStore["dispatch"];

