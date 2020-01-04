import {Action, Selector, State, StateContext, Store} from '@ngxs/store';
import {PresetSession} from '../model/presetSession';
import {
	PatchCurrentPresetAction,
	PatchCurrentPresetActionDecl,
	PatchCurrentPresetInitStrategyAction,
	PatchCurrentPresetInitStrategyActionDecl,
	PatchPresetForLayerAction,
	PatchPresetForLayerActionDecl, ReinitPresetAction,
	SelectPresetAction,
	SelectPresetActionDecl,
	SetIgnoreParamsForSessionAction,
	SetIgnoreParamsForSessionActionDecl,
	SetInitSnapshotLearningAction,
	SetInitVstPresetLearningAction,
	SetLearningActionDecl, SetPresetEffectParameterValueForLayerAction,
	SetPresetEffectParameterValueForLayerActionDecl,
	SetPresetParameterValueForLayerAction,
	SetPresetParameterValueForLayerActionDecl
} from './presetSession.actions';
import {SessionState, SessionStateModel} from '../../session/state/session.state';
import {Preset} from '../model/model';
import {PresetState} from './preset.state';

export interface PresetSessionStateModel {
	sessionByLayerId: {[key: string]: PresetSession};
}

@State<PresetSessionStateModel>({
	name: 'presetSession',
	defaults: {
		sessionByLayerId: {}
	}
})
export class PresetSessionState {

	constructor (private store: Store) {
	}

	@Selector()
	public static getSessionsByLayerId(state: PresetSessionStateModel): {[key: string]: PresetSession} {
		return state.sessionByLayerId;
	}

	@Selector([SessionState.getActiveLayerId])
	public static getCurrentPreset(state: PresetSessionStateModel, activeLayerId: string|null): Preset|null {
		if (!(activeLayerId in state.sessionByLayerId)) {
			return null;
		}
		return state.sessionByLayerId[activeLayerId].preset;
	}

	@Selector([SessionState.getActiveLayerId])
	public static getCurrentPresetId(state: PresetSessionStateModel, activeLayerId: string|null): string|null {
		if (!(activeLayerId in state.sessionByLayerId) || !state.sessionByLayerId[activeLayerId].preset) {
			return null;
		}
		return state.sessionByLayerId[activeLayerId].preset.id;
	}

	@Selector([SessionState.getActiveLayerId])
	public static getCurrentHistory(state: PresetSessionStateModel, activeLayerId: string|null): Preset[] {
		if (!(activeLayerId in state.sessionByLayerId) || !state.sessionByLayerId[activeLayerId].preset) {
			return [];
		}
		return state.sessionByLayerId[activeLayerId].lastPresets;
	}

	@Selector([SessionState.getActiveLayerId])
	public static isCurrentInitVstPresetLearning(state: PresetSessionStateModel, activeLayerId: string|null): boolean {
		if (!(activeLayerId in state.sessionByLayerId) || !state.sessionByLayerId[activeLayerId].preset) {
			return false;
		}
		return state.sessionByLayerId[activeLayerId].isInitVstPresetLearning;
	}

	@Selector([SessionState.getActiveLayerId])
	public static isCurrentPresetLearningAnything(state: PresetSessionStateModel, activeLayerId: string|null): boolean {
		if (!(activeLayerId in state.sessionByLayerId) || !state.sessionByLayerId[activeLayerId].preset) {
			return false;
		}
		return state.sessionByLayerId[activeLayerId].isInitVstPresetLearning || state.sessionByLayerId[activeLayerId].isInitSnapshotLearning;
	}

	@Selector([SessionState.getActiveLayerId])
	public static isCurrentInitSnapshotLearning(state: PresetSessionStateModel, activeLayerId: string|null): boolean {
		if (!(activeLayerId in state.sessionByLayerId) || !state.sessionByLayerId[activeLayerId].preset) {
			return false;
		}
		return state.sessionByLayerId[activeLayerId].isInitSnapshotLearning;
	}

	@Action({type: PatchCurrentPresetAction.type})
	public patchCurrentPreset(ctx: StateContext<PresetSessionStateModel>, action: PatchCurrentPresetActionDecl) {
		this.patchPreset(ctx, action.preset, this.getCurrentLayerId());
	}

	protected patchPreset(ctx: StateContext<PresetSessionStateModel>, preset: Partial<Preset>|null, layerId: string) {
		const state = ctx.getState();
		if (!layerId) {
			return;
		}
		let entity;
		if (layerId in state.sessionByLayerId) {
			entity = {
				... state.sessionByLayerId[layerId],
				preset: {
					... state.sessionByLayerId[layerId].preset,
					... preset,
				},
				ignoreParams: true
			};
		} else {
			entity = <PresetSession>{
				preset: preset,
				lastPresets: [],
				ignoreParams: true
			};
		}
		const sessionsByLayerId = {
			... state.sessionByLayerId,
			[layerId]: entity
		};
		ctx.patchState({
			sessionByLayerId: sessionsByLayerId
		});
	}

	@Action({type: PatchCurrentPresetInitStrategyAction.type})
	public patchCurrentPresetInitStrategy(ctx: StateContext<PresetSessionStateModel>, action: PatchCurrentPresetInitStrategyActionDecl) {
		const state = ctx.getState();
		const currentLayerId = this.getCurrentLayerId();
		if (!currentLayerId) {
			return;
		}
		let entity;
		if (!(currentLayerId in state.sessionByLayerId)) {
			return;
		}
		entity = {
			... state.sessionByLayerId[currentLayerId],
			preset: <Partial<Preset>>{
				... state.sessionByLayerId[currentLayerId].preset,
				initStrategy: {
					... state.sessionByLayerId[currentLayerId].preset.initStrategy,
					... action.initStrategy
				}
			}
		};
		const sessionsByLayerId = {
			... state.sessionByLayerId,
			[currentLayerId]: entity
		};
		ctx.patchState({
			sessionByLayerId: sessionsByLayerId
		});
	}

	protected patchCurrentPresetSession(ctx: StateContext<PresetSessionStateModel>, patch: Partial<PresetSession>) {
		return this.patchPresetSession(ctx, patch, this.getCurrentLayerId());
	}

	protected patchPresetSession(ctx: StateContext<PresetSessionStateModel>, patch: Partial<PresetSession>, layerId: string) {
		const state = ctx.getState();
		if (!layerId) {
			return;
		}
		let entity;
		if (layerId in state.sessionByLayerId) {
			entity = {
				... state.sessionByLayerId[layerId],
				... patch
			};
		} else {
			entity = patch;
		}
		const sessionsByLayerId = {
			... state.sessionByLayerId,
			[layerId]: entity
		};
		ctx.patchState({
			sessionByLayerId: sessionsByLayerId
		});
	}

	@Action({type: SelectPresetAction.type})
	public selectPresetForCurrentLayer(ctx: StateContext<PresetSessionStateModel>, action: SelectPresetActionDecl) {
		this.selectPreset(ctx, action.presetId, action.forcePresetData, action.layerId ? action.layerId : this.getCurrentLayerId());
	}

	protected selectPreset(ctx: StateContext<PresetSessionStateModel>, presetId: string|null, forcePresetData: Preset|null, layerId: string) {
		let history = PresetSessionState.getCurrentHistory(ctx.getState(), layerId);
		const currentPreset = PresetSessionState.getCurrentPreset(ctx.getState(), layerId);
		if (currentPreset && currentPreset.id !== presetId) {
			history = history.filter(historyPreset => historyPreset.id !== presetId);
			history.unshift(currentPreset);
		}
		const maxHistoryLength = 6;
		if (history.length > maxHistoryLength) {
			history = history.slice(0, maxHistoryLength);
		}
		if (!presetId) {
			this.patchCurrentPresetSession(
				ctx,
				{
					preset: null,
					presetChangeTimestamp: Date.now(),
					lastPresets: history
				}
			);
		} else {
			const preset = forcePresetData ? forcePresetData : this.store.selectSnapshot(PresetState.getById)(presetId);
			this.patchCurrentPresetSession(
				ctx,
				{
					preset: Object.assign({}, preset),
					ignoreParams: true,
					presetChangeTimestamp: Date.now(),
					lastPresets: history
				}
			);
		}
	}

	@Action({type: ReinitPresetAction.type})
	public reinitPreset(ctx: StateContext<PresetSessionStateModel>, action) {
		this.patchCurrentPresetSession(ctx, {
			presetChangeTimestamp: Date.now()
		});
	}

	@Action({type: SetInitSnapshotLearningAction.type})
	public setInitSnapshotLearning(ctx: StateContext<PresetSessionStateModel>, action: SetLearningActionDecl) {
		this.patchCurrentPresetSession(ctx, {
			isInitSnapshotLearning: action.isLearning
		});
	}

	@Action({type: SetInitVstPresetLearningAction.type})
	public setInitVstPresetLearning(ctx: StateContext<PresetSessionStateModel>, action: SetLearningActionDecl) {
		this.patchCurrentPresetSession(ctx, {
			isInitVstPresetLearning: action.isLearning
		});
	}

	// Deprecated?
	@Action({type: PatchPresetForLayerAction.type})
	public patchPresetForLayerAction(ctx: StateContext<PresetSessionStateModel>, action: PatchPresetForLayerActionDecl) {
		const state = ctx.getState();
		if (!(action.layerId in state.sessionByLayerId) || !state.sessionByLayerId[action.layerId].preset) {
			return;
		}
		ctx.patchState({
			sessionByLayerId: {
				... state.sessionByLayerId,
				[action.layerId]: {
					... state.sessionByLayerId[action.layerId],
					preset: {
						... state.sessionByLayerId[action.layerId].preset,
						... action.preset
					}
				}
			}
		});
	}

	@Action({type: SetIgnoreParamsForSessionAction.type})
	public setIgnoreParamsForSessionAction(ctx: StateContext<PresetSessionStateModel>, action: SetIgnoreParamsForSessionActionDecl) {
		const state = ctx.getState();
		if (!(action.layerId in state.sessionByLayerId)) {
			return;
		}
		ctx.patchState({
			sessionByLayerId: {
				... state.sessionByLayerId,
				[action.layerId]: {
					... state.sessionByLayerId[action.layerId],
					ignoreParams: action.ignoreParams
				}
			}
		});
	}

	@Action({type: SetPresetParameterValueForLayerAction.type})
	public setPresetParameterValueForLayerAction(ctx: StateContext<PresetSessionStateModel>, action: SetPresetParameterValueForLayerActionDecl) {
		const state = ctx.getState();
		if (!(action.layerId in state.sessionByLayerId) || !state.sessionByLayerId[action.layerId].preset) {
			return;
		}
		ctx.patchState({
			sessionByLayerId: {
				... state.sessionByLayerId,
				[action.layerId]: {
					... state.sessionByLayerId[action.layerId],
					preset: {
						... state.sessionByLayerId[action.layerId].preset,
						paramValues: {
							... state.sessionByLayerId[action.layerId].preset.paramValues,
							[action.endpoint]: action.value
						}
					}
				}
			}
		});
	}

	@Action({type: SetPresetEffectParameterValueForLayerAction.type})
	public setPresetEffectParameterValueForLayerAction(ctx: StateContext<PresetSessionStateModel>, action: SetPresetEffectParameterValueForLayerActionDecl) {
		const state = ctx.getState();
		if (!(action.layerId in state.sessionByLayerId) || !state.sessionByLayerId[action.layerId].preset) {
			return;
		}
		ctx.patchState({
			sessionByLayerId: {
				... state.sessionByLayerId,
				[action.layerId]: {
					... state.sessionByLayerId[action.layerId],
					preset: {
						... state.sessionByLayerId[action.layerId].preset,
						effectParamValues: {
							... state.sessionByLayerId[action.layerId].preset.effectParamValues,
							[action.effectId]: {
								... (action.effectId in state.sessionByLayerId[action.layerId].preset.effectParamValues ? state.sessionByLayerId[action.layerId].preset.effectParamValues[action.effectId] : {}),
								[action.endpoint]: action.value
							}
						}
					}
				}
			}
		});
	}

	protected getCurrentLayerId() {
		return this.store.selectSnapshot(SessionState.getActiveLayerId);
	}
}
