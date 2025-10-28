import { createBrowserRouter } from "react-router-dom";
import React, { Suspense, lazy } from "react";
import Layout from "@/components/organisms/Layout";

const Dashboard = lazy(() => import('@/components/pages/Dashboard'));
const Contacts = lazy(() => import('@/components/pages/Contacts'));
const Companies = lazy(() => import('@/components/pages/Companies'));
const Pipeline = lazy(() => import('@/components/pages/Pipeline'));
const NotFound = lazy(() => import('@/components/pages/NotFound'));

const mainRoutes = [
  {
    path: '',
    index: true,
    element: (
      <Suspense fallback={<div>Loading.....</div>}>
        <Dashboard />
      </Suspense>
    )
  },
  {
    path: 'contacts',
    element: (
      <Suspense fallback={<div>Loading.....</div>}>
        <Contacts />
      </Suspense>
    )
  },
  {
    path: 'companies',
    element: (
      <Suspense fallback={<div>Loading.....</div>}>
        <Companies />
      </Suspense>
    )
  },
  {
    path: 'pipeline',
    element: (
      <Suspense fallback={<div>Loading.....</div>}>
        <Pipeline />
      </Suspense>
    )
  },
  {
    path: '*',
    element: (
      <Suspense fallback={<div>Loading.....</div>}>
        <NotFound />
      </Suspense>
    )
  }
];

const routes = [
  {
    path: '/',
    element: <Layout />,
    children: mainRoutes
  }
];

export const router = createBrowserRouter(routes);