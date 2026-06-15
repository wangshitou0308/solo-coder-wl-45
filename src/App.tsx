import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import Home from '@/pages/Home';
import ReceiptList from '@/pages/ReceiptList';
import ReceiptDetail from '@/pages/ReceiptDetail';
import ReceiptNew from '@/pages/ReceiptNew';
import ItemList from '@/pages/ItemList';
import ItemDetail from '@/pages/ItemDetail';
import ItemNew from '@/pages/ItemNew';
import Manuals from '@/pages/Manuals';
import Dashboard from '@/pages/Dashboard';
import Export from '@/pages/Export';

const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      {
        path: '',
        element: <Home />,
      },
      {
        path: 'receipts',
        children: [
          {
            path: '',
            element: <ReceiptList />,
          },
          {
            path: 'new',
            element: <ReceiptNew />,
          },
          {
            path: ':id',
            element: <ReceiptDetail />,
          },
        ],
      },
      {
        path: 'items',
        children: [
          {
            path: '',
            element: <ItemList />,
          },
          {
            path: 'new',
            element: <ItemNew />,
          },
          {
            path: ':id',
            element: <ItemDetail />,
          },
          {
            path: ':id/edit',
            element: <ItemNew />,
          },
        ],
      },
      {
        path: 'manuals',
        element: <Manuals />,
      },
      {
        path: 'dashboard',
        element: <Dashboard />,
      },
      {
        path: 'export',
        element: <Export />,
      },
    ],
  },
]);

export default function App() {
  return <RouterProvider router={router} />;
}
