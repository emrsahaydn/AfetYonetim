import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { helpRequestsAPI, distanceAPI } from '../services/api';

const HelpRequestsList = ({ helpRequests }) => {
  const dispatch = useDispatch();
  const { resources } = useSelector((state) => state.dashboard);
  const [distances, setDistances] = useState({});
  const [selectedProviders, setSelectedProviders] = useState({});

  const getStatusColor = (status) => {
    if (status === 'Kritik') return 'bg-red-100 border-red-500';
    if (status === 'Yardım Gönderiliyor') return 'bg-orange-100 border-orange-500';
    if (status === 'Güvende') return 'bg-green-100 border-green-500';
    return 'bg-gray-100 border-gray-500';
  };

  const getStatusTextColor = (status) => {
    if (status === 'Kritik') return 'text-red-700';
    if (status === 'Yardım Gönderiliyor') return 'text-orange-700';
    if (status === 'Güvende') return 'text-green-700';
    return 'text-gray-700';
  };

  const getStatusBadgeColor = (status) => {
    if (status === 'Kritik') return 'bg-red-500 text-white';
    if (status === 'Yardım Gönderiliyor') return 'bg-orange-500 text-white';
    if (status === 'Güvende') return 'bg-green-500 text-white';
    return 'bg-gray-500 text-white';
  };

  // Her yardım talebi için en yakın provider mesafesini hesapla
  useEffect(() => {
    const fetchDistances = async () => {
      const distanceMap = {};
      for (const request of helpRequests) {
        try {
          const response = await distanceAPI.getNearestProviders(request.id);
          if (response.data && response.data.length > 0) {
            distanceMap[request.id] = response.data[0].distance;
          }
        } catch (error) {
          console.error(`Mesafe hesaplama hatası (${request.id}):`, error);
        }
      }
      setDistances(distanceMap);
    };

    if (helpRequests.length > 0) {
      fetchDistances();
    }
  }, [helpRequests]);

  // En yakın provider'ları getir
  const fetchNearestProviders = async (requestId) => {
    try {
      const response = await distanceAPI.getNearestProviders(requestId);
      return response.data || [];
    } catch (error) {
      console.error('Provider getirme hatası:', error);
      return [];
    }
  };

  const deleteRequest = async (id) => {
    if (!window.confirm('Bu yardım talebini silmek istediğinizden emin misiniz?')) {
      return;
    }
    
    try {
      await helpRequestsAPI.delete(id);
      dispatch({
        type: 'DELETE_HELP_REQUEST',
        payload: id,
      });
      
      // Kaynakları yeniden yükle
      setTimeout(() => {
        window.dispatchEvent(new Event('refreshResources'));
      }, 500);
    } catch (error) {
      console.error('Yardım talebi silme hatası:', error);
      alert('Yardım talebi silinirken bir hata oluştu.');
    }
  };

  const updateStatus = async (id, newStatus) => {
    try {
      const request = helpRequests.find((r) => r.id === id);
      if (!request) return;

      // Eğer durum "Yardım Gönderiliyor" veya "Güvende" olacaksa, provider seç
      let resourceId = selectedProviders[id];
      
      if (newStatus === 'Yardım Gönderiliyor' && !resourceId) {
        // En yakın provider'ı otomatik seç
        const nearestProviders = await fetchNearestProviders(id);
        if (nearestProviders.length > 0) {
          resourceId = nearestProviders[0].Id;
          setSelectedProviders(prev => ({ ...prev, [id]: resourceId }));
        }
      }

      if (newStatus === 'Güvende' && !resourceId) {
        // En yakın provider'ı otomatik seç
        const nearestProviders = await fetchNearestProviders(id);
        if (nearestProviders.length > 0) {
          resourceId = nearestProviders[0].Id;
          setSelectedProviders(prev => ({ ...prev, [id]: resourceId }));
        }
      }

      const updatedRequest = { ...request, status: newStatus };
      await helpRequestsAPI.update(id, {
        title: request.title,
        description: request.description,
        location: request.location,
        latitude: request.lat,
        longitude: request.lon,
        status: newStatus,
        priority: request.priority || 'Kritik',
        categories: request.categories || [],
        needs: request.needs || [],
        resourceId: resourceId, // Provider ID'yi gönder
      });
      
      dispatch({
        type: 'UPDATE_HELP_REQUEST',
        payload: updatedRequest,
      });

      // Kaynakları yeniden yükle (güncel sayılar için)
      if (newStatus === 'Güvende') {
        // Dashboard'dan resources'ları yeniden yüklemek için event tetikle
        setTimeout(() => {
          window.dispatchEvent(new Event('refreshResources'));
        }, 500);
      }
    } catch (error) {
      console.error('Durum güncelleme hatası:', error);
      alert('Durum güncellenirken bir hata oluştu.');
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">Aktif Yardım Talepleri</h2>
      <div className="space-y-3">
        {helpRequests.map((request) => (
          <div
            key={request.id}
            className={`p-4 rounded-lg border-2 ${getStatusColor(request.status)} shadow-sm hover:shadow-md transition-shadow`}
          >
            <div className="flex items-start justify-between mb-2">
              <h3 className="font-semibold text-gray-800">{request.title}</h3>
              <span
                className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusBadgeColor(request.status)}`}
              >
                {request.status}
              </span>
            </div>
            <p className="text-sm text-gray-600 mb-2">
              <span className="font-medium">Konum:</span> {request.location}
            </p>
            {distances[request.id] !== undefined && (
              <div className="mb-2 p-2 bg-blue-50 rounded border border-blue-200">
                <p className="text-xs text-blue-700">
                  <span className="font-semibold">📍 En yakın yardım sağlayıcı:</span>{' '}
                  <span className="font-bold">{distances[request.id]} km</span>
                </p>
              </div>
            )}
            {request.needs && request.needs.length > 0 && (
              <div className="mb-2">
                <p className="text-xs text-gray-600 mb-1">
                  <span className="font-medium">İhtiyaçlar:</span>
                </p>
                <div className="flex flex-wrap gap-1">
                  {request.needs.map((need, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 bg-amber-100 text-amber-700 text-xs rounded"
                    >
                      {need}
                    </span>
                  ))}
                </div>
              </div>
            )}
            <p className="text-sm text-gray-700 mb-3">{request.description}</p>
            {request.categories && request.categories.length > 0 && (
              <div className="mb-3">
                <p className="text-xs text-gray-600 mb-1">
                  <span className="font-medium">Kategoriler:</span>
                </p>
                <div className="flex flex-wrap gap-1">
                  {request.categories.map((cat, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded"
                    >
                      {cat}
                    </span>
                  ))}
                </div>
              </div>
            )}
            <div className="flex gap-2 mt-3">
              {request.status === 'Kritik' && (
                <button
                  onClick={() => updateStatus(request.id, 'Yardım Gönderiliyor')}
                  className="flex-1 bg-orange-500 text-white text-xs py-2 px-3 rounded-lg hover:bg-orange-600 transition-colors font-semibold shadow-md"
                >
                  📤 Yardım Gönder
                </button>
              )}
              {request.status === 'Yardım Gönderiliyor' && (
                <button
                  onClick={() => updateStatus(request.id, 'Güvende')}
                  className="flex-1 bg-green-500 text-white text-xs py-2 px-3 rounded-lg hover:bg-green-600 transition-colors font-semibold shadow-md"
                >
                  ✅ Yardım Gitti
                </button>
              )}
              {request.status === 'Güvende' && (
                <div className="w-full py-2 px-3 bg-green-100 text-green-700 text-xs rounded-lg text-center font-semibold">
                  ✓ Yardım Tamamlandı
                </div>
              )}
              <button
                onClick={() => deleteRequest(request.id)}
                className="bg-red-500 text-white text-xs py-2 px-3 rounded-lg hover:bg-red-600 transition-colors font-semibold shadow-md"
                title="Talebi Sil"
              >
                🗑️
              </button>
            </div>
          </div>
        ))}
        {helpRequests.length === 0 && (
          <div className="text-center text-gray-500 py-8">
            Aktif yardım talebi bulunmamaktadır.
          </div>
        )}
      </div>
    </div>
  );
};

export default HelpRequestsList;
