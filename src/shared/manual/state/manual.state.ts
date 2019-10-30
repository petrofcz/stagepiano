import {State, Action, Selector, StateContext, StateOperator} from '@ngxs/store';
import {Layer} from '../model/layer';
import {Manual} from '../model/manual';
import {
	AddLayerAction,
	AddLayerActionDecl,
	AddManualAction,
	AddManualActionDecl,
	SelectLayerAction,
	SelectLayerActionDecl
} from './manual.actions';
import {ResetLayoutAction} from '../../layout/state/layout.actions';

export interface ManualStateModel {
	manuals: Manual[];
	layers: Layer[];
	currentLayerId: string|null;
}

@State<ManualStateModel>({
	name: 'Manual',
	defaults: {
		manuals: [],
		layers: [],
		currentLayerId: null
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
	public static getCurrentLayer(state: ManualStateModel) {
		for (const layer of state.layers) {
			if (layer.id === state.currentLayerId) {
				return layer;
			}
		}
		return null;
	}

	@Selector()
	public static getActiveLayerId(state: ManualStateModel) {
		return state.currentLayerId;
	}

	@Selector()
	public static getManuals(state: ManualStateModel) {
		return state.manuals;
	}

	@Selector()
	public static getLayers(state: ManualStateModel) {
		return state.layers;
	}

	@Action({type: AddManualAction.type})
	public addManual(ctx: StateContext<ManualStateModel>, action: AddManualActionDecl) {
		const manual: Manual = {
			id: action.id,
			name: action.name,
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

	@Action({type: SelectLayerAction.type})
	public selectLayer(ctx: StateContext<ManualStateModel>, action: SelectLayerActionDecl) {
		ctx.patchState({
			currentLayerId: action.layerId
		});
	}

	// todo mabybe refactor to use plugin for clear states?
	@Action({type: ResetLayoutAction.type})
	public clear(ctx: StateContext<ManualStateModel>, action) {
		ctx.setState({
			manuals: [],
			layers: [],
			currentLayerId: null
		});
	}
}