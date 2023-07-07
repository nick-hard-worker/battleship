class InMemoryRepository {
  entities;
  constructor() {
    this.entities = [];
  }

  getAll() {
    return this.entities;
  }

  getById(id) {
    return this.entities.find(entity => entity.id === id);
  }

  create(entity) {
    const id = this.entities.length + 1;
    const entityWithId = { ...entity, id };
    this.entities.push(entityWithId);
    return entityWithId;
  }

  update(id, updatedEntity) {
    const index = this.entities.findIndex(entity => entity.id === id);
    if (index !== -1) {
      this.entities[index] = { ...updatedEntity, id };
      return updatedEntity;
    }
  }

  delete(id) {
    const index = this.entities.findIndex(entity => entity.id === id);
    if (index !== -1) {
      this.entities.splice(index, 1);
      return true;
    }
  }

  static createRepository() {
    return new InMemoryRepository();
  }
}

export { InMemoryRepository };
