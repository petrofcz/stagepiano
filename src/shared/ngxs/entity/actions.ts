import {Entity} from '../../common/entity';

export interface SaveEntityActionDecl<T extends Entity> {
	entity: T;
}
export interface SaveEntityPartialActionDecl<T extends Entity> {
	entity: T;
}
export interface AddEntityActionDecl<T extends Entity> {
	entity: T;
}

export interface RemoveEntityActionDecl {
	id: string;
}