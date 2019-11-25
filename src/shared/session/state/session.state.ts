import {Action, Selector, State, StateContext, Store} from '@ngxs/store';
import {
	SelectLayerAction,
	SelectLayerActionDecl,
	SelectPresetAction,
	SelectPresetActionDecl,
	SelectPresetCategoryAction,
	SelectPresetCategoryActionDecl,
	SetEffectDispositionAction,
	SetEffectDispositionActionDecl,
	SetKeyboardRouteAction,
	SetKeyboardRouteActionDecl, TakeEffectSnapshotAction, TakeEffectSnapshotActionDecl
} from './session.actions';
import {EffectDisposition} from '../model/effectDisposition';
import {KeyboardRoute} from '../../../backend/keyboard/router/keyboardRoute';

export interface SessionStateModel {
	currentLayerId: string|null;
	presetCategories: {[key: string]: string};      // current category id by layer id
	presets: {[key: string]: string};               // current preset id by layer id
	keyboardRoute: string|null;
	effectDisposition: EffectDisposition|null;
	isEditing: boolean;                             // user is editing mapping / preset in app
	effectSnapshot: {
		effectId: string,
		vstPath: string
	}|null;
}

@State<SessionStateModel>({
	name: 'session',
	defaults: {
		currentLayerId: null,
		presetCategories: {},
		presets: {},
		keyboardRoute: null,
		effectDisposition: null,
		isEditing: false,
		effectSnapshot: null
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

	@Selector()
	public static getKeyboardRoute(state: SessionStateModel): string {
		return state.keyboardRoute;
	}

	@Selector()
	public static getEffectDisposition(state: SessionStateModel): EffectDisposition|null {
		return state.effectDisposition;
	}

	@Selector()
	public static getEffectSnapshot(state: SessionStateModel): {
		effectId: string,
		vstPath: string
	}|null {
		return state.effectSnapshot;
	}

	@Action({type: SelectLayerAction.type})
	public selectLayer(ctx: StateContext<SessionStateModel>, action: SelectLayerActionDecl) {
		ctx.patchState({
			currentLayerId: action.layerId
		});
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

	@Action({type: SetKeyboardRouteAction.type})
	public setKeyboardRoute(ctx: StateContext<SessionStateModel>, action: SetKeyboardRouteActionDecl) {
		const state = {
			keyboardRoute: action.route
		};
		if (action.route !== KeyboardRoute.EFFECT_DETAIL && action.route !== KeyboardRoute.EFFECT_OVERVIEW) {
			state['effectDisposition'] = null;
		}
		ctx.patchState(state);
	}

	@Action({type: SetEffectDispositionAction.type})
	public setEffectDisposition(ctx: StateContext<SessionStateModel>, action: SetEffectDispositionActionDecl) {
		ctx.patchState({
			effectDisposition: action.disposition
		});
	}

	@Action({type: TakeEffectSnapshotAction.type})
	public takeEffectSnapshot(ctx: StateContext<SessionStateModel>, action: TakeEffectSnapshotActionDecl) {
		ctx.patchState({
			effectSnapshot: action.id === null ? null : {
				effectId: action.id,
				vstPath: action.vstPath
			}
		});
	}


	// @Action({type: ResetLayoutAction.type})
	// public clear(ctx: StateContext<SessionStateModel>, action) {
	// 	ctx.setState({
	// 		presetCategories: {},
	// 		presets: {},
	// 		currentLayerId: null,
	// 		keyboardRoute: null,
	// 		effectDisposition: null,
	// 		isEditing: false
	// 	});
	// }


}