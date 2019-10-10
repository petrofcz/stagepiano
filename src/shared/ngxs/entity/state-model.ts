import {Entity} from '../../common/entity';

export function defaultEntityState<T extends Entity>(
	defaults: Partial<EntityStateModel<T>> = {}
): EntityStateModel<T> {
	return {
		entities: {},
		ids: [],
		...defaults
	};
}

export interface EntityStateModel<T extends Entity> {
	entities: {[key: string]: T};
	ids: string[];
}