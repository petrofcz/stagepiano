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
export interface MoveEntityActionDecl<T extends Entity> {
	oldIndex: number;   // 0-indexed
	newIndex: number;   // 0-indexed
}

export interface RemoveEntityActionDecl {
	id: string;
}