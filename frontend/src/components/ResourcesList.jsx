const ResourcesList = ({ resources, helpRequests }) => {
  const getTypeColor = (type) => {
    const colors = {
      Gıda: 'bg-yellow-100 border-yellow-500',
      Tıbbi: 'bg-blue-100 border-blue-500',
      Barınma: 'bg-purple-100 border-purple-500',
      Ulaşım: 'bg-indigo-100 border-indigo-500',
      Provider: 'bg-green-100 border-green-500',
    };
    return colors[type] || 'bg-gray-100 border-gray-500';
  };

  // Aktif yardım taleplerinin olduğu şehirleri bul
  const activeRequestCities = helpRequests
    .filter(request => request.status === 'Kritik' || request.status === 'Yardım Gönderiliyor')
    .map(request => request.location);

  // Backend'den gelen resources zaten filtrelenmiş (sadece aktif taleplere yakın provider'lar)
  // Ama yine de frontend'de de filtreleme yapalım
  const filteredResources = resources.filter(resource => resource.type === 'Provider');

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">Yardım Sağlayıcılar</h2>
      {activeRequestCities.length > 0 && (
        <p className="text-xs text-gray-500 mb-2 bg-blue-50 p-2 rounded">
          <span className="font-semibold">Aktif talepler olan şehirler:</span> {[...new Set(activeRequestCities)].join(', ')}
        </p>
      )}
      <div className="space-y-3">
        {filteredResources.map((resource) => (
          <div
            key={resource.id}
            className={`p-4 rounded-lg border-2 ${getTypeColor(resource.type)} shadow-sm hover:shadow-md transition-shadow`}
          >
            <div className="flex items-start justify-between mb-2">
              <h3 className="font-semibold text-gray-800">{resource.name}</h3>
              <span className="px-2 py-1 rounded text-xs font-bold bg-gray-200 text-gray-700">
                {resource.type}
              </span>
            </div>
            <p className="text-sm text-gray-600 mb-2">
              <span className="font-medium">Konum:</span> {resource.location}
            </p>
            {(resource.waterCount > 0 || resource.blanketCount > 0 || resource.foodCount > 0) && (
              <div className="mt-2 space-y-1">
                {resource.waterCount > 0 && (
                  <div className="flex items-center text-sm">
                    <span className="text-blue-600 mr-2">💧</span>
                    <span className="text-gray-700">
                      <span className="font-medium">Su:</span> {resource.waterCount} adet
                    </span>
                  </div>
                )}
                {resource.blanketCount > 0 && (
                  <div className="flex items-center text-sm">
                    <span className="text-purple-600 mr-2">🛏️</span>
                    <span className="text-gray-700">
                      <span className="font-medium">Battaniye:</span> {resource.blanketCount} adet
                    </span>
                  </div>
                )}
                {resource.foodCount > 0 && (
                  <div className="flex items-center text-sm">
                    <span className="text-yellow-600 mr-2">🍞</span>
                    <span className="text-gray-700">
                      <span className="font-medium">Yemek:</span> {resource.foodCount} adet
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
        {filteredResources.length === 0 && (
          <div className="text-center text-gray-500 py-8">
            {activeRequestCities.length === 0 
              ? 'Aktif yardım talebi bulunmadığı için yardım sağlayıcı görünmüyor.'
              : 'Bu şehirlerde yardım sağlayıcı bulunmamaktadır.'}
          </div>
        )}
      </div>
    </div>
  );
};

export default ResourcesList;

