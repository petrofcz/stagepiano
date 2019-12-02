import {defaultEntityState, EntityStateModel} from '../../ngxs/entity/state-model';
import {Action, Selector, State, StateContext, StateOperator, Store} from '@ngxs/store';
import {Preset} from '../model/model';
import {AddEntityActionDecl, UpdateEntityActionDecl} from '../../ngxs/entity/actions';
import {addEntity, saveEntity, updateEntity} from '../../ngxs/entity/state-operators';
import {
	AddPresetAction, DuplicatePresetAction, DuplicatePresetActionDecl, SavePresetAction,
	UpdatePresetAction
} from './preset.actions';
import {SessionState} from '../../session/state/session.state';
import {PresetSessionState} from './presetSession.state';

export interface PresetStateModel extends EntityStateModel<Preset> {
}

@State<PresetStateModel>({
	name: 'preset',
	defaults: defaultEntityState<Preset>()
})
export class PresetState {

	constructor(private store: Store) { }

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

	// @Selector([SessionState.getCurrentPresetId])
	// public static getCurrent(state: PresetStateModel, id: string): Preset|null {
	// 	if (!id) {
	// 		return null;
	// 	}
	// 	return this.getById(state)(id);
	// }

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

	@Action({type: SavePresetAction.type})
	public save(ctx: StateContext<PresetStateModel>, action) {
		const currentPreset = this.store.selectSnapshot(PresetSessionState.getCurrentPreset);
		if (!currentPreset || !currentPreset.id) {
			return;
		}
		ctx.setState(
			<StateOperator<PresetStateModel>>saveEntity(currentPreset)
		);
	}

	@Action({type: DuplicatePresetAction.type})
	public duplicate(ctx: StateContext<PresetStateModel>, action: DuplicatePresetActionDecl) {
		const currentPreset = this.store.selectSnapshot(PresetSessionState.getCurrentPreset);
		if (!currentPreset) {
			return;
		}
		const newPreset = Object.assign({}, currentPreset);
		newPreset.id = action.newPresetId;
		newPreset.name = this.getUniquePresetName(currentPreset);
		ctx.setState(
			<StateOperator<PresetStateModel>>addEntity(newPreset)
		);
	}

	private getUniquePresetName(currentPreset: Preset) {
		const allPresets = this.store.selectSnapshot(PresetState.getAll);
		const nameBase = currentPreset.name.replace(/ \(\d+\)$/, '');
		let name = nameBase;
		let i = 0;
		while (allPresets.filter(preset => preset.name === name).length > 0) {
			i++;
			name = nameBase + ' (' + i + ')';
		}
		return name;
	}
}