import propertyData from '../mockData/property.json';

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

class PropertyService {
  constructor() {
    this.properties = [...propertyData];
  }

  async getAll() {
    await delay(300);
    return [...this.properties];
  }

  async getById(id) {
    await delay(200);
    const property = this.properties.find(p => p.id === id);
    if (!property) {
      throw new Error('Property not found');
    }
    return { ...property };
  }

  async searchByLocation(location) {
    await delay(400);
    if (!location) return [...this.properties];
    
    const filtered = this.properties.filter(property => 
      property.address?.city?.toLowerCase().includes(location.toLowerCase()) ||
      property.address?.state?.toLowerCase().includes(location.toLowerCase()) ||
      property.address?.street?.toLowerCase().includes(location.toLowerCase())
    );
    return [...filtered];
  }

  async filterProperties(filters = {}) {
    await delay(350);
    let filtered = [...this.properties];

    if (filters.priceMin !== undefined) {
      filtered = filtered.filter(p => p.price >= filters.priceMin);
    }

    if (filters.priceMax !== undefined) {
      filtered = filtered.filter(p => p.price <= filters.priceMax);
    }

    if (filters.propertyTypes && filters.propertyTypes.length > 0) {
      filtered = filtered.filter(p => filters.propertyTypes.includes(p.propertyType));
    }

    if (filters.bedroomsMin !== undefined) {
      filtered = filtered.filter(p => p.bedrooms >= filters.bedroomsMin);
    }

    if (filters.bathroomsMin !== undefined) {
      filtered = filtered.filter(p => p.bathrooms >= filters.bathroomsMin);
    }

    if (filters.squareFeetMin !== undefined) {
      filtered = filtered.filter(p => p.squareFeet >= filters.squareFeetMin);
    }

    if (filters.amenities && filters.amenities.length > 0) {
      filtered = filtered.filter(p => 
        filters.amenities.some(amenity => p.amenities?.includes(amenity))
      );
    }

    return [...filtered];
  }

  async create(property) {
    await delay(400);
    const newProperty = {
      ...property,
      id: Date.now().toString(),
      listingDate: new Date().toISOString()
    };
    this.properties.push(newProperty);
    return { ...newProperty };
  }

  async update(id, data) {
    await delay(300);
    const index = this.properties.findIndex(p => p.id === id);
    if (index === -1) {
      throw new Error('Property not found');
    }
    this.properties[index] = { ...this.properties[index], ...data };
    return { ...this.properties[index] };
  }

  async delete(id) {
    await delay(250);
    const index = this.properties.findIndex(p => p.id === id);
    if (index === -1) {
      throw new Error('Property not found');
    }
    this.properties.splice(index, 1);
    return true;
  }
}

export default new PropertyService();