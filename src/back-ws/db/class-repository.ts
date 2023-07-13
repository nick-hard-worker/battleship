export class InMemoryRepository<T extends { id?: number }> {
  protected entities: T[];
  private nextId: number;

  constructor() {
    this.entities = [];
    this.nextId = 0;
  }

  getAll() {
    return this.entities;
  }

  getById(id: number): T | undefined {
    return this.entities.find(entity => entity.id === id);
  }

  add(entity: T): T {
    const entityWithId = { ...entity, id: this.nextId++ };
    this.entities.push(entityWithId);
    return entityWithId;
  }

  update(updatedEntity: T) {
    const index = this.entities.findIndex(entity => entity.id === updatedEntity.id);
    if (index !== -1) {
      this.entities[index] = updatedEntity;
      return this.entities[index];
    }
  }

  delete(id: number) {
    const index = this.entities.findIndex(entity => entity.id === id);
    if (index !== -1) {
      this.entities.splice(index, 1);
      return true;
    }
  }
}
