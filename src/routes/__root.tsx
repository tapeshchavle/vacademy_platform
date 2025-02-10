// import { QueryClient } from "@tanstack/react-query";
// import { createRootRouteWithContext, Outlet, redirect } from "@tanstack/react-router";
// import React, { Suspense } from "react";
// import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

// const TanStackRouterDevtools =
//     process.env.NODE_ENV === "production"
//         ? () => null // Render nothing in production
//         : React.lazy(() =>
//               // Lazy load in development
//               import("@tanstack/router-devtools").then((res) => ({
//                   default: res.TanStackRouterDevtools,
//               })),
//           );

// export const Route = createRootRouteWithContext<{
//     queryClient: QueryClient;
// }>()({
//     beforeLoad: ({ location }) => {
//         if (location.pathname === "/") {
//             throw redirect({
//                 to: "/login",
//             });
//         }
//     },

//     component: () => (
//         <>
//             <Outlet />

//             {/* Development tools */}
//             <Suspense>
//                 <TanStackRouterDevtools />
//             </Suspense>
//             <ReactQueryDevtools initialIsOpen={false} />
//         </>
//     ),
// });




import { QueryClient } from "@tanstack/react-query";
import { createRootRouteWithContext, Outlet, redirect } from "@tanstack/react-router";
import React, { Suspense, useEffect } from "react";
import { AppUpdate, AppUpdateAvailability } from "@capawesome/capacitor-app-update";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { toast } from "sonner";
import { useUpdate } from "@/stores/useUpdate";
// import { AppUpdate } from "@capawesome/capacitor-app-update";

const TanStackRouterDevtools =
    process.env.NODE_ENV === "production"
        ? () => null
        : React.lazy(() =>
              import("@tanstack/router-devtools").then((res) => ({
                  default: res.TanStackRouterDevtools,
              }))
          );

// const checkForUpdates = async () => {
//     try {
//         const updateInfo = await AppUpdate.getAppUpdateInfo();
//         console.log("Update Info:", updateInfo); // Debugging

//         if (updateInfo?.available) {
//             await AppUpdate.performImmediateUpdate();
//         }
//     } catch (error) {
//         console.error("App update check failed:", error);
//     }
// };

// Define the component separately with an uppercase name
const RootComponent = () => {
    // useEffect(() => {
    //     checkForUpdates();
    // }, []);

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
    component: RootComponent, // Use the properly named component
});
