import React from 'react';
import { Route } from 'react-router-dom';
import ErrorBoundaryRoutes from 'app/shared/error/error-boundary-routes';

import Product from '../../entities/product/product';
import ProductDetail from '../../entities/product/product-detail';
import ProductUpdate from '../../entities/product/product-update';
import ProductDeleteDialog from '../../entities/product/product-delete-dialog';

const ProductManagementRoutes = () => (
  <div>
    <ErrorBoundaryRoutes>
      <Route index element={<Product />} />
      <Route path=":id">
        <Route index element={<ProductDetail />} />
        <Route path="edit" element={<ProductUpdate />} />
        <Route path="delete" element={<ProductDeleteDialog />} />
      </Route>
      <Route path="new" element={<ProductUpdate />} />
    </ErrorBoundaryRoutes>
  </div>
);

export default ProductManagementRoutes;

