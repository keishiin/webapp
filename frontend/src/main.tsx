import React from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import "./index.css";
import Home from "./pages/Home.tsx";
import SignIn from "./pages/SignIn.tsx";
import SignUp from "./pages/SignUp.tsx";
import ErrorPage from "./pages/Error.tsx";
import UserProfile from "./pages/UserProfile.tsx";
import Trophies from "./pages/Trophies.tsx";
import { QueryClient, QueryClientProvider } from "react-query";
import UpdateUserInfo from "./pages/UpdateUserInfo.tsx";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      refetchOnReconnect: false,
      retry: false,
      staleTime: 5 * 60 * 1000,
    },
  },
});

const router = createBrowserRouter([
  {
    path: "/",
    element: <Home />,
    errorElement: <ErrorPage />,
  },
  {
    path: "/login",
    element: <SignIn />,
  },
  {
    path: "/signup",
    element: <SignUp />,
  },
  {
    path: "userProfile",
    element: <UserProfile />,
  },
  {
    path: "/psn",
    element: <Trophies platform="psn" />,
  },
  {
    path: "/xbox",
    element: <Trophies platform="xbox" />,
  },
  {
    path: "/steam",
    element: <Trophies platform="steam" />,
  },
  {
    path: "/updateInfo",
    element: <UpdateUserInfo />,
  },
]);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  </React.StrictMode>,
);
