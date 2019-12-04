import {Action, Selector, State, StateContext, Store} from '@ngxs/store';
import {PresetSession} from '../model/presetSession';
import {
	PatchCurrentPresetAction, PatchCurrentPresetActionDecl, PatchCurrentPresetInitStrategyAction, PatchCurrentPresetInitStrategyActionDecl,
	SelectPresetAction,
	SelectPresetActionDecl, SetInitSnapshotLearningAction, SetInitVstPresetLearningAction, SetLearningActionDecl
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
		const state = ctx.getState();
		const currentLayerId = this.getCurrentLayerId();
		if (!currentLayerId) {
			return;
		}
		let entity;
		if (currentLayerId in state.sessionByLayerId) {
			entity = {
				... state.sessionByLayerId[currentLayerId],
				preset: {
					... state.sessionByLayerId[currentLayerId].preset,
					... action.preset,
				},
				ignoreParams: true
			};
		} else {
			entity = <PresetSession>{
				preset: action.preset,
				lastPresets: [],
				ignoreParams: true
			};
		}
		const sessionsByLayerId = state.sessionByLayerId;
		sessionsByLayerId[currentLayerId] = entity;
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
		const sessionsByLayerId = state.sessionByLayerId;
		sessionsByLayerId[currentLayerId] = entity;
		ctx.patchState({
			sessionByLayerId: sessionsByLayerId
		});
	}

	protected patchPresetSession(ctx: StateContext<PresetSessionStateModel>, patch: Partial<PresetSession>) {
		const state = ctx.getState();
		const currentLayerId = this.getCurrentLayerId();
		if (!currentLayerId) {
			return;
		}
		let entity;
		if (currentLayerId in state.sessionByLayerId) {
			entity = {
				... state.sessionByLayerId[currentLayerId],
				... patch
			};
		} else {
			entity = patch;
		}
		const sessionsByLayerId = state.sessionByLayerId;
		sessionsByLayerId[currentLayerId] = entity;
		ctx.patchState({
			sessionByLayerId: sessionsByLayerId
		});
	}

	@Action({type: SelectPresetAction.type})
	public selectPreset(ctx: StateContext<PresetSessionStateModel>, action: SelectPresetActionDecl) {
		let history = PresetSessionState.getCurrentHistory(ctx.getState(), this.getCurrentLayerId());
		const currentPreset = PresetSessionState.getCurrentPreset(ctx.getState(), this.getCurrentLayerId());
		if (currentPreset) {
			history = history.filter(historyPreset => historyPreset.id !== action.presetId);
			history.unshift(currentPreset);
		}
		const maxHistoryLength = 6;
		if (history.length > maxHistoryLength) {
			history = history.slice(0, maxHistoryLength);
		}
		if (!action.presetId) {
			this.patchPresetSession(
				ctx,
				{
					preset: null,
					lastPresets: history
				}
			);
		} else {
			const preset = action.forcePresetData ? action.forcePresetData : this.store.selectSnapshot(PresetState.getById)(action.presetId);
			this.patchPresetSession(
				ctx,
				{
					preset: Object.assign({}, preset),
					ignoreParams: true,     // todo: register debouncer service which automatically reverts to false after 300ms
					lastPresets: history
				}
			);
		}
	}

	@Action({type: SetInitSnapshotLearningAction.type})
	public setInitSnapshotLearning(ctx: StateContext<PresetSessionStateModel>, action: SetLearningActionDecl) {
		this.patchPresetSession(ctx, {
			isInitSnapshotLearning: action.isLearning
		});
	}

	@Action({type: SetInitVstPresetLearningAction.type})
	public setInitVstPresetLearning(ctx: StateContext<PresetSessionStateModel>, action: SetLearningActionDecl) {
		this.patchPresetSession(ctx, {
			isInitVstPresetLearning: action.isLearning
		});
	}

	protected getCurrentLayerId() {
		return this.store.selectSnapshot(SessionState.getActiveLayerId);
	}
}
