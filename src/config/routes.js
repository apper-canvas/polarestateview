import Browse from '@/components/pages/Browse';
import PropertyDetail from '@/components/pages/PropertyDetail';
import MapView from '@/components/pages/MapView';
import SavedProperties from '@/components/pages/SavedProperties';

export const routes = {
  browse: {
    id: 'browse',
    label: 'Browse Properties',
    path: '/',
    icon: 'Grid3X3',
    component: Browse
  },
  map: {
    id: 'map',
    label: 'Map View',
    path: '/map',
    icon: 'Map',
    component: MapView
  },
  saved: {
    id: 'saved',
    label: 'Saved Properties',
    path: '/saved',
    icon: 'Heart',
    component: SavedProperties
  },
  propertyDetail: {
    id: 'propertyDetail',
    label: 'Property Detail',
    path: '/property/:id',
    icon: 'Home',
    component: PropertyDetail,
    hideInNav: true
  }
};

export const routeArray = Object.values(routes);
export default routes;