import savedPropertyData from '../mockData/savedProperty.json';

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

class SavedPropertyService {
  constructor() {
    this.savedProperties = [...savedPropertyData];
  }

  async getAll() {
    await delay(200);
    return [...this.savedProperties];
  }

  async getById(id) {
    await delay(150);
    const savedProperty = this.savedProperties.find(sp => sp.id === id);
    if (!savedProperty) {
      throw new Error('Saved property not found');
    }
    return { ...savedProperty };
  }

  async isPropertySaved(propertyId) {
    await delay(100);
    return this.savedProperties.some(sp => sp.propertyId === propertyId);
  }

  async create(savedProperty) {
    await delay(250);
    const existing = this.savedProperties.find(sp => sp.propertyId === savedProperty.propertyId);
    if (existing) {
      throw new Error('Property already saved');
    }
    
    const newSavedProperty = {
      ...savedProperty,
      id: Date.now().toString(),
      savedDate: new Date().toISOString()
    };
    this.savedProperties.push(newSavedProperty);
    return { ...newSavedProperty };
  }

  async update(id, data) {
    await delay(200);
    const index = this.savedProperties.findIndex(sp => sp.id === id);
    if (index === -1) {
      throw new Error('Saved property not found');
    }
    this.savedProperties[index] = { ...this.savedProperties[index], ...data };
    return { ...this.savedProperties[index] };
  }

  async delete(id) {
    await delay(200);
    const index = this.savedProperties.findIndex(sp => sp.id === id);
    if (index === -1) {
      throw new Error('Saved property not found');
    }
    this.savedProperties.splice(index, 1);
    return true;
  }

  async deleteByPropertyId(propertyId) {
    await delay(200);
    const index = this.savedProperties.findIndex(sp => sp.propertyId === propertyId);
    if (index === -1) {
      throw new Error('Saved property not found');
    }
    this.savedProperties.splice(index, 1);
    return true;
  }
}

export default new SavedPropertyService();