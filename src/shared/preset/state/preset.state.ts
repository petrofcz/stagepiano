import {defaultEntityState, EntityStateModel} from '../../ngxs/entity/state-model';
import {Action, Selector, State, StateContext, StateOperator} from '@ngxs/store';
import {Preset} from '../model/model';
import {AddEntityActionDecl, UpdateEntityActionDecl} from '../../ngxs/entity/actions';
import {addEntity, updateEntity} from '../../ngxs/entity/state-operators';
import {
	AddPresetAction,
	UpdatePresetAction
} from './preset.actions';
import {SessionState} from '../../session/state/session.state';

export interface PresetStateModel extends EntityStateModel<Preset> {
}

@State<PresetStateModel>({
	name: 'preset',
	defaults: defaultEntityState<Preset>()
})
export class PresetState {

	@Selector()
	public static getById(state: PresetStateModel): (id: string) => Preset|null {
		return (id: string) => {
			return id in state.entities ? state.entities[id] : null;
		};
	}

	@Selector()
	public static getAll(state: PresetStateModel) {
		return state.ids.map(id => state.entities[id]);
	}

	@Selector()
	public static getIds(state: PresetStateModel) {
		return state.ids;
	}

	@Selector()
	public static getState(state: PresetStateModel) {
		return state;
	}

	@Selector()
	public static getEntities(state: PresetStateModel) {
		return state.entities;
	}

	@Selector([SessionState.getCurrentPresetId])
	public static getCurrent(state: PresetStateModel, id: string): Preset|null {
		if (!id) {
			return null;
		}
		return this.getById(state)(id);
	}

	@Action({type: UpdatePresetAction.type})
	public update(ctx: StateContext<PresetStateModel>, action: UpdateEntityActionDecl<Preset>) {
		ctx.setState(
			<StateOperator<PresetStateModel>>updateEntity(
				action.entity
			)
		);
	}

	@Action({type: AddPresetAction.type})
	public add(ctx: StateContext<PresetStateModel>, action: AddEntityActionDecl<Preset>) {
		ctx.setState(
			<StateOperator<PresetStateModel>>addEntity(
				action.entity
			)
		);
	}

}