import { createBrowserRouter } from "react-router-dom";
import { lazy, Suspense } from "react";
import Layout from "@/components/organisms/Layout";

// Lazy load page components
const Dashboard = lazy(() => import("@/components/pages/Dashboard"));
const Products = lazy(() => import("@/components/pages/Products"));
const Categories = lazy(() => import("@/components/pages/Categories"));
const Suppliers = lazy(() => import("@/components/pages/Suppliers"));
const NotFound = lazy(() => import("@/components/pages/NotFound"));

// Define main routes
const mainRoutes = [
  {
    path: "",
    index: true,
    element: (
      <Suspense fallback={<div>Loading.....</div>}>
        <Dashboard />
      </Suspense>
    )
  },
  {
    path: "products",
    element: (
      <Suspense fallback={<div>Loading.....</div>}>
        <Products />
      </Suspense>
    )
  },
  {
    path: "categories",
    element: (
      <Suspense fallback={<div>Loading.....</div>}>
        <Categories />
      </Suspense>
    )
  },
  {
    path: "suppliers",
    element: (
      <Suspense fallback={<div>Loading.....</div>}>
        <Suppliers />
      </Suspense>
    )
  },
  {
    path: "*",
    element: (
      <Suspense fallback={<div>Loading.....</div>}>
        <NotFound />
      </Suspense>
    )
  }
];

// Create routes array
const routes = [
  {
    path: "/",
    element: <Layout />,
    children: [...mainRoutes]
  }
];

export const router = createBrowserRouter(routes);