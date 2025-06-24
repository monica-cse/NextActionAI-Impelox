// src/action-registry/action-registry.repository.ts
import { DataSource, Repository } from 'typeorm';
import { ActionRegistory } from './entities/action-registry.entity';
import { Injectable } from '@nestjs/common';

@Injectable()
export class ActionRegistoryRepository extends Repository<ActionRegistory> {
    constructor(private readonly dataSource: DataSource) {
        super(ActionRegistory, dataSource.createEntityManager());
    }

}
