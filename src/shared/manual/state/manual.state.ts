import {State, Action, Selector, StateContext, StateOperator} from '@ngxs/store';
import {Layer} from '../model/layer';
import {Manual} from '../model/manual';
import {
	AddLayerAction,
	AddLayerActionDecl,
	AddManualAction,
	AddManualActionDecl,
} from './manual.actions';
import {SessionState, SessionStateModel} from '../../session/state/session.state';

export interface ManualStateModel {
	manuals: Manual[];
	layers: Layer[];
}

@State<ManualStateModel>({
	name: 'Manual',
	defaults: {
		manuals: [],
		layers: [],
	}
})
export class ManualState {

	@Selector()
	public static getState(state: ManualStateModel) {
		return state;
	}

	@Selector()
	public static getManualById(state: ManualStateModel) {
		return (id: string) => {
			for (const manual of state.manuals) {
				if (manual.id === id) {
					return manual;
				}
			}
			return null;
		};
	}

	@Selector()
	public static getLayerById(state: ManualStateModel) {
		return (id: string) => {
			for (const layer of state.layers) {
				if (layer.id === id) {
					return layer;
				}
			}
			return null;
		};
	}

	@Selector()
	public static getManuals(state: ManualStateModel) {
		return state.manuals;
	}

	@Selector()
	public static getLayers(state: ManualStateModel) {
		return state.layers;
	}

	@Selector([SessionState.getActiveLayerId])
	public static getCurrentLayer(state: ManualStateModel, activeLayerId: string|null): Layer|null {
		if (!activeLayerId) {
			return null;
		}
		return this.getLayerById(state)(activeLayerId);
	}

	@Selector([SessionState.getActiveLayerId])
	public static getCurrentManual(state: ManualStateModel, activeLayerId: string|null): Manual|null {
		if (!activeLayerId) {
			return null;
		}
		return this.getManualById(state)(this.getLayerById(state)(activeLayerId).manualId);
	}

	@Action({type: AddManualAction.type})
	public addManual(ctx: StateContext<ManualStateModel>, action: AddManualActionDecl) {
		const manual: Manual = {
			id: action.id,
			name: action.name,
			position: action.position,
			layerIds: []
		};
		ctx.patchState({
			manuals: [ ...ctx.getState().manuals, manual ]
		});
	}

	@Action({type: AddLayerAction.type})
	public addLayer(ctx: StateContext<ManualStateModel>, action: AddLayerActionDecl) {
		const state = ctx.getState();

		const layer: Layer = {
			id: action.id,
			name: action.name,
			manualId: action.manualId,
			availableVstIds: action.availableVstIds,
			position: action.position
		};

		const manuals = state.manuals;
		for (const manual of manuals) {
			if (manual.id === action.manualId) {
				manual.layerIds.push(action.id);
			}
		}

		ctx.patchState({
			layers: [ ...state.layers, layer ],
			manuals: manuals
		});
	}

}