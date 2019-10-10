import {Entity} from '../../common/entity';

export interface SaveEntityActionDecl<T extends Entity> {
	entity: T;
}

export interface RemoveEntityActionDecl {
	id: string;
}