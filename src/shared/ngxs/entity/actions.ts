import {Entity} from '../../common/entity';

export interface SaveEntityActionDecl<T extends Entity> {
	entity: T;
}
export interface UpdateEntityActionDecl<T extends Entity> {
	entity: Partial<T>;
}
export interface AddEntityActionDecl<T extends Entity> {
	entity: T;
}

export interface RemoveEntityActionDecl {
	id: string;
}