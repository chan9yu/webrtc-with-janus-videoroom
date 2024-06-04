import { RouterProvider, createBrowserRouter, type RouteObject } from 'react-router-dom';

import * as P from './pages';

export enum RouterPath {
	ROOT = '/'
}

const appObject: RouteObject[] = [
	{
		path: RouterPath.ROOT,
		element: <P.Home />
	}
];

const routeObject: RouteObject[] = [
	{
		path: RouterPath.ROOT,
		children: appObject,
		errorElement: <div>Error</div>
	}
];

export default function Router() {
	return <RouterProvider router={createBrowserRouter(routeObject)} />;
}
