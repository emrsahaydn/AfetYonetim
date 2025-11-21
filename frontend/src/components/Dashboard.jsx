import { useEffect, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import HelpRequestsList from './HelpRequestsList';
import ResourcesList from './ResourcesList';
import Map from './Map';
import { helpRequestsAPI, resourcesAPI } from '../services/api';

const Dashboard = () => {
  const { helpRequests, resources } = useSelector((state) => state.dashboard);
  const dispatch = useDispatch();

  const fetchResources = useCallback(async () => {
    try {
      const resourcesResponse = await resourcesAPI.getAll();
      const formattedResources = resourcesResponse.data.map((item) => ({
        id: item.Id,
        name: item.Name,
        type: item.Type,
        description: item.Description,
        location: item.Location,
        lat: item.Latitude,
        lon: item.Longitude,
        quantity: item.Quantity,
        available: item.Available,
        waterCount: item.WaterCount || 0,
        blanketCount: item.BlanketCount || 0,
        foodCount: item.FoodCount || 0,
        status: item.Status,
      }));
      dispatch({ type: 'SET_RESOURCES', payload: formattedResources });
    } catch (error) {
      console.error('Kaynaklar yüklenirken hata:', error);
    }
  }, [dispatch]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Yardım taleplerini getir
        const helpRequestsResponse = await helpRequestsAPI.getAll();
        const formattedHelpRequests = helpRequestsResponse.data.map((item) => ({
          id: item.Id,
          title: item.Title,
          description: item.Description,
          location: item.Location,
          status: item.Status,
          priority: item.Priority,
          lat: item.Latitude,
          lon: item.Longitude,
          categories: item.Categories ? JSON.parse(item.Categories) : [],
          needs: item.Needs ? JSON.parse(item.Needs) : [],
          createdAt: item.CreatedAt,
        }));
        dispatch({ type: 'SET_HELP_REQUESTS', payload: formattedHelpRequests });

        // Kaynakları getir
        await fetchResources();
      } catch (error) {
        console.error('Veri yükleme hatası:', error);
      }
    };

    fetchData();
  }, [dispatch, fetchResources]);

  // Refresh resources listener
  useEffect(() => {
    const handleRefresh = () => {
      fetchResources();
    };
    
    // Custom event listener for resource refresh
    window.addEventListener('refreshResources', handleRefresh);
    
    return () => {
      window.removeEventListener('refreshResources', handleRefresh);
    };
  }, [fetchResources]);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-gray-100">
      <div className="w-1/4 bg-white shadow-lg overflow-y-auto">
        <HelpRequestsList helpRequests={helpRequests} />
      </div>

      <div className="flex-1 bg-gray-50">
        <Map helpRequests={helpRequests} resources={resources} />
      </div>

      <div className="w-1/4 bg-white shadow-lg overflow-y-auto">
        <ResourcesList resources={resources} helpRequests={helpRequests} />
      </div>
    </div>
  );
};

export default Dashboard;
