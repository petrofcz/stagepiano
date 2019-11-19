import {Entity} from '../../common/entity';
import {StateOperator} from '@ngxs/store';
import {EntityStateModel} from './state-model';
import {moveItemInArray} from '@angular/cdk/drag-drop';

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

// remove entity if present
export function removeEntity<T extends Entity>(id: string): StateOperator<EntityStateModel<T>> {
	return (state: Readonly<EntityStateModel<T>>) => {
		if (state.ids.indexOf(id) !== -1) {
			const entities = state.entities;
			delete entities[id];
			return {
				...state,
				entities: entities,
				ids: state.ids.filter(iId => iId !== id)
			};
		} else {
			return state;
		}
	};
}

// changes entities order
export function moveEntity<T extends Entity>(oldIndex: number, newIndex: number): StateOperator<EntityStateModel<T>> {
	return (state: Readonly<EntityStateModel<T>>) => {
		if (oldIndex < 0 || newIndex < 0 || oldIndex >= state.ids.length || newIndex >= state.ids.length || newIndex === oldIndex) {
			return state;
		}
		// const ids = [];
		// ids.push(...state.ids.slice(0, Math.min(newIndex, oldIndex)));
		// if(newIndex > oldIndex)
		// ids.push(state.ids[oldIndex]);
		// ids.push(...state.ids.slice(newIndex, newIndex));
		const ids = state.ids;
		moveItemInArray(ids, oldIndex, newIndex);
		return {
			...state,
			ids: ids
		};
	};
}
