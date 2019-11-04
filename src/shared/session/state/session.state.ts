import {Action, Selector, State, StateContext, Store} from '@ngxs/store';
import {ManualState} from '../../manual/state/manual.state';
import {Layer} from '../../manual/model/layer';
import {PresetCategoryState} from '../../preset/state/preset-category.state';
import {PresetCategory} from '../../preset/model/model';
import {
	SelectLayerAction,
	SelectLayerActionDecl,
	SelectPresetAction, SelectPresetActionDecl,
	SelectPresetCategoryAction,
	SelectPresetCategoryActionDecl
} from './session.actions';
import {ResetLayoutAction} from '../../layout/state/layout.actions';
import {Manual} from '../../manual/model/manual';

export interface SessionStateModel {
	currentLayerId: string|null;
	presetCategories: {[key: string]: string};      // current category id by layer id
	presets: {[key: string]: string};               // current preset id by layer id
}

@State<SessionStateModel>({
	name: 'Session',
	defaults: {
		currentLayerId: null,
		presetCategories: {},
		presets: {}
	}
})
export class SessionState {

	constructor(private store: Store) { }

	@Selector()
	public static getState(state: SessionStateModel) {
		return state;
	}

	@Selector()
	public static getActiveLayerId(state: SessionStateModel) {
		return state.currentLayerId;
	}

	@Selector()
	public static getCurrentPresetCategoryId(state: SessionStateModel): string|null {
		if (state.currentLayerId && state.currentLayerId in state.presetCategories) {
			return state.presetCategories[state.currentLayerId];
		}
		return null;
	}

	@Selector()
	public static getCurrentPresetId(state: SessionStateModel): string|null {
		if (state.currentLayerId && state.currentLayerId in state.presets) {
			return state.presets[state.currentLayerId];
		}
		return null;
	}

	@Action({type: SelectLayerAction.type})
	public selectLayer(ctx: StateContext<SessionStateModel>, action: SelectLayerActionDecl) {
		if (this.store.selectSnapshot(ManualState.getLayerById)(action.layerId)) {
			ctx.patchState({
				currentLayerId: action.layerId
			});
		}
	}

	@Action({type: SelectPresetCategoryAction.type})
	public selectPresetCategory(ctx: StateContext<SessionStateModel>, action: SelectPresetCategoryActionDecl) {
		const state = ctx.getState();
		const items = state.presetCategories;
		items[SessionState.getActiveLayerId(state)] = action.presetCategoryId;
		ctx.patchState({
			presetCategories: items
		});
	}

	@Action({type: SelectPresetAction.type})
	public selectPreset(ctx: StateContext<SessionStateModel>, action: SelectPresetActionDecl) {
		const state = ctx.getState();
		const items = state.presets;
		items[SessionState.getActiveLayerId(state)] = action.presetId;
		ctx.patchState({
			presets: items
		});
	}

	@Action({type: ResetLayoutAction.type})
	public clear(ctx: StateContext<SessionStateModel>, action) {
		ctx.setState({
			presetCategories: {},
			presets: {},
			currentLayerId: null
		});
	}


}