import {Entity} from '../../common/entity';
import {StateOperator} from '@ngxs/store';
import {EntityStateModel} from './state-model';

export function saveEntity<T extends Entity>(entity: T): StateOperator<EntityStateModel<T>> {
	return (state: Readonly<EntityStateModel<T>>) => {
		return {
			...state,
			entities: { ...state.entities, [entity.id]: entity },
			ids: state.ids.indexOf(entity.id) === -1 ? [...state.ids, entity.id] : state.ids
		};
	};
}