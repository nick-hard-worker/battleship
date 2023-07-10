type Entity = {
  id: number;
  [key: string]: any;
}
type NoIdEntity = Omit<Entity, 'id'>;

export class InMemoryRepository<T1 extends Entity, T2 extends NoIdEntity> {
  protected entities: T1[];

  constructor() {
    this.entities = [];
  }

  getAll() {
    return this.entities;
  }

  getById(id: number) {
    return this.entities.find(entity => entity.id === id);
  }

  add(entity: T2) {
    const id = this.entities.length + 1;
    const entityWithId: T1 = { ...entity, id } as unknown as T1;
    this.entities.push(entityWithId);
    return entityWithId;
  }

  update(updatedEntity: T1) {
    const index = this.entities.findIndex(entity => entity.id === updatedEntity.id);
    if (index !== -1) {
      this.entities[index] = updatedEntity;
      return updatedEntity;
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
