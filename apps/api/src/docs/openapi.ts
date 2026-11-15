import {
  adminDashboardPaths,
  adminDashboardSchemas,
  adminDashboardTags,
} from './definitions/admin-dashboard.openapi.js';
import {
  adminMerchandisingPaths,
  adminMerchandisingSchemas,
  adminMerchandisingTags,
} from './definitions/admin-merchandising.openapi.js';
import {
  adminOrdersPaths,
  adminOrdersSchemas,
  adminOrdersTags,
} from './definitions/admin-orders.openapi.js';
import {
  adminProductsPaths,
  adminProductsSchemas,
  adminProductsTags,
} from './definitions/admin-products.openapi.js';
import {
  adminUsersPaths,
  adminUsersSchemas,
  adminUsersTags,
} from './definitions/admin-users.openapi.js';
import {
  adminVendorsPaths,
  adminVendorsSchemas,
  adminVendorsTags,
} from './definitions/admin-vendors.openapi.js';
import { authSchemas, authPaths, authTags } from './definitions/auth.openapi.js';
import {
  bulkImportPaths,
  bulkImportSchemas,
  bulkImportTags,
} from './definitions/bulk-import.openapi.js';
import { cartSchemas, cartPaths, cartTags } from './definitions/cart.openapi.js';
import { catalogSchemas, catalogPaths, catalogTags } from './definitions/catalog.openapi.js';
import {
  categoriesSchemas,
  categoriesPaths,
  categoriesTags,
} from './definitions/categories.openapi.js';
import { commonSchemas, commonResponses } from './definitions/common.openapi.js';
import {
  customerAccountSchemas,
  customerAccountPaths,
  customerAccountTags,
} from './definitions/customer-account.openapi.js';
import {
  customerOrdersPaths,
  customerOrdersSchemas,
  customerOrdersTags,
} from './definitions/customer-orders.openapi.js';
import { healthSchemas, healthPaths, healthTags } from './definitions/health.openapi.js';
import { locationsPaths, locationsTags } from './definitions/locations.openapi.js';
import { mediaSchemas, mediaPaths, mediaTags } from './definitions/media.openapi.js';
import {
  merchandisingSchemas,
  merchandisingPaths,
  merchandisingTags,
} from './definitions/merchandising.openapi.js';
import { reviewsSchemas, reviewsPaths } from './definitions/reviews.openapi.js';
import {
  vendorDashboardPaths,
  vendorDashboardSchemas,
  vendorDashboardTags,
} from './definitions/vendor-dashboard.openapi.js';
import {
  vendorOrdersPaths,
  vendorOrdersSchemas,
  vendorOrdersTags,
} from './definitions/vendor-orders.openapi.js';
import {
  vendorProductsSchemas,
  vendorProductsPaths,
  vendorProductsTags,
} from './definitions/vendor-products.openapi.js';
import {
  vendorProfilePaths,
  vendorProfileSchemas,
  vendorProfileTags,
} from './definitions/vendor-profile.openapi.js';
import { wishlistSchemas, wishlistPaths, wishlistTags } from './definitions/wishlist.openapi.js';

export const openapiSpec = {
  openapi: '3.1.0',
  info: {
    title: 'Perigee REST API',
    version: '1.0.0',
    description:
      'REST API for the Perigee multi-vendor commerce platform. Defines request and response contracts, access requirements, and error responses.',
  },
  servers: [
    {
      url: 'http://localhost:4000',
      description: 'Local development server',
    },
  ],
  tags: [
    ...healthTags,
    ...authTags,
    ...vendorDashboardTags,
    ...vendorProductsTags,
    ...bulkImportTags,
    ...mediaTags,
    ...vendorProfileTags,
    ...categoriesTags,
    ...catalogTags,
    ...wishlistTags,
    ...customerAccountTags,
    ...locationsTags,
    ...merchandisingTags,
    ...cartTags,
    ...adminVendorsTags,
    ...adminDashboardTags,
    ...adminMerchandisingTags,
    ...adminOrdersTags,
    ...adminProductsTags,
    ...adminUsersTags,
    ...customerOrdersTags,
    ...vendorOrdersTags,
  ],
  components: {
    responses: commonResponses,
    securitySchemes: {
      cookieAuth: {
        type: 'apiKey',
        in: 'cookie',
        name: 'auth_token',
        description: 'HTTP-only session JWT cookie issued upon signin or OAuth completion.',
      },
    },
    schemas: {
      ...mediaSchemas,
      ...healthSchemas,
      ...categoriesSchemas,
      ...commonSchemas,
      ...reviewsSchemas,
      ...wishlistSchemas,
      ...customerAccountSchemas,
      ...catalogSchemas,
      ...cartSchemas,
      ...authSchemas,
      ...vendorProductsSchemas,
      ...merchandisingSchemas,
      ...adminDashboardSchemas,
      ...adminMerchandisingSchemas,
      ...adminOrdersSchemas,
      ...adminProductsSchemas,
      ...adminUsersSchemas,
      ...adminVendorsSchemas,
      ...bulkImportSchemas,
      ...customerOrdersSchemas,
      ...vendorOrdersSchemas,
      ...vendorProfileSchemas,
      ...vendorDashboardSchemas,
    },
  },
  paths: {
    ...mediaPaths,
    ...healthPaths,
    ...categoriesPaths,
    ...reviewsPaths,
    ...wishlistPaths,
    ...customerAccountPaths,
    ...catalogPaths,
    ...cartPaths,
    ...authPaths,
    ...vendorProductsPaths,
    ...merchandisingPaths,
    ...vendorDashboardPaths,
    ...bulkImportPaths,
    ...vendorProfilePaths,
    ...adminVendorsPaths,
    ...locationsPaths,
    ...adminDashboardPaths,
    ...adminMerchandisingPaths,
    ...adminOrdersPaths,
    ...adminProductsPaths,
    ...adminUsersPaths,
    ...customerOrdersPaths,
    ...vendorOrdersPaths,
  },
};
