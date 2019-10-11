import {Entity} from '../../common/entity';
import {StateOperator} from '@ngxs/store';
import {EntityStateModel} from './state-model';

// save entity, overwrites whole entity if exists
export function saveEntity<T extends Entity>(entity: T): StateOperator<EntityStateModel<T>> {
	return (state: Readonly<EntityStateModel<T>>) => {
		return {
			...state,
			entities: { ...state.entities, [entity.id]: entity },
			ids: state.ids.indexOf(entity.id) === -1 ? [...state.ids, entity.id] : state.ids
		};
	};
}

// save entity, values that are not set are kept if already exists (1st level)
export function updateEntity<T extends Entity>(entity: Partial<T>): StateOperator<EntityStateModel<T>> {
	return (state: Readonly<EntityStateModel<T>>) => {
		if (state.ids.indexOf(entity.id) !== -1) {
			return {
				...state,
				entities: {...state.entities, [entity.id]: {...(state.entities[entity.id]), ...entity}},
			};
		}
	};
}

// adds entity if not present yet
export function addEntity<T extends Entity>(entity: T): StateOperator<EntityStateModel<T>> {
	return (state: Readonly<EntityStateModel<T>>) => {
		if (state.ids.indexOf(entity.id) === -1) {
			return {
				...state,
				entities: {...state.entities, [entity.id]: entity},
				ids: [...state.ids, entity.id]
			};
		} else {
			return state;
		}
	};
}
