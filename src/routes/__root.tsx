import { QueryClient } from "@tanstack/react-query";
import { createRootRouteWithContext, Outlet, redirect } from "@tanstack/react-router";
import React, { Suspense, useEffect } from "react";
import { AppUpdate, AppUpdateAvailability } from "@capawesome/capacitor-app-update";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { toast } from "sonner";
import { useUpdate } from "@/stores/useUpdate";

const TanStackRouterDevtools =
    process.env.NODE_ENV === "production"
        ? () => null
        : React.lazy(() =>
              import("@tanstack/router-devtools").then((res) => ({
                  default: res.TanStackRouterDevtools,
              }))
          );


const RootComponent = () => {
    
    const { setUpdateAvailable } = useUpdate();
    useEffect(() => {
        (async () => {
            const result = await AppUpdate.getAppUpdateInfo();
            if (result.updateAvailability === AppUpdateAvailability.UPDATE_AVAILABLE) {
                toast.warning("Update available, please update app...");
                setUpdateAvailable(true);
                if (result.immediateUpdateAllowed) {
                    await AppUpdate.performImmediateUpdate();
                }
            }
        })();
    }, []);

    return (
        <>
            <Outlet />
            {/* Development tools */}
            <Suspense>
                <TanStackRouterDevtools />
            </Suspense>
            <ReactQueryDevtools initialIsOpen={false} />
        </>
    );
};

export const Route = createRootRouteWithContext<{
    queryClient: QueryClient;
}>()({
    beforeLoad: ({ location }) => {
        if (location.pathname === "/") {
            throw redirect({
                to: "/login",
            });
        }
    },
    component: RootComponent, 
});
