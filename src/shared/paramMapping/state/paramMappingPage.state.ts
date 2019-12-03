import {defaultEntityState, EntityStateModel} from '../../ngxs/entity/state-model';
import {Action, Selector, State, StateContext, StateOperator, Store} from '@ngxs/store';
import {ParamMapping, ParamMappingPage} from '../model/model';
import {AddEntityActionDecl, MoveEntityActionDecl, RemoveEntityActionDecl, UpdateEntityActionDecl} from '../../ngxs/entity/actions';
import {addEntity, moveEntity, removeEntity, updateEntity} from '../../ngxs/entity/state-operators';
import {
	AddParamMappingAction,
	LoadParamMappingPageFromEffectAction,
	LoadParamMappingPageFromEffectActionDecl,
	MoveParamMappingAction,
	PatchParamMappingStrategyAction,
	PatchParamMappingStrategyActionDecl,
	RemoveParamMappingAction,
	LoadParamMappingPageAction,
	SelectParamMappingAction,
	SetEndpointLearningAction,
	SetParamMappingValueLearningAction,
	SetParamMappingValueLearningActionDecl,
	UpdateParamMappingAction,
	UpdateParamMappingStrategyAction,
	UpdateParamMappingStrategyActionDecl,
	LoadParamMappingPageActionDecl,
	LoadParamMappingPageFromInstrumentAction,
	LoadParamMappingPageFromInstrumentActionDecl, ResetParamMappingPageAction
} from './paramMappingPage.actions';
import {VSTState} from '../../vst/state/vst.state';
import {Effect, EffectScope} from '../../vst/model/effect';
import {SetEffectDispositionAction, SetKeyboardRouteAction} from '../../session/state/session.actions';
import {KeyboardRoutes} from '../../../backend/keyboard/router/keyboardRoutes';
import {SessionState} from '../../session/state/session.state';
import {ManualState} from '../../manual/state/manual.state';
import {BiduleOscHelper} from '../../bidule/osc/bidule-osc-helper';
import {EffectDisposition} from '../../session/model/effectDisposition';
import {Instrument} from '../../vst/model/instrument';

export interface ParamMappingPageStateModel extends EntityStateModel<ParamMapping> {
	selectedMappingId: string|null;
	isEndpointLearning: boolean;

	// for learning values
	learningMappingItemId: number|null;   // not learning if null
	valueLearningIndex: number|null;    // linear mapping

	// global vst path prefix
	vstPathPrefix: string|null;     // OSC path's prefix for given instance

	// vst path prefix per mapping
	vstPathPrefixes: { [key: string]: string };
}

// this state represents current param page
@State<ParamMappingPageStateModel>({
	name: 'paramMappingPage',
	defaults: Object.assign(
		defaultEntityState<ParamMapping>(), {
			selectedMappingId: null,
			isEndpointLearning: false,
			valueLearningIndex: null,
			vstPathPrefix: null,    // global vst path prefix
			learningMappingItemId: null,
			vstPathPrefixes: {}     // vst path prefix per mapping
		}
	)
})
export class ParamMappingPageState {

	constructor(protected store: Store) {

	}

	@Selector()
	public static getById(state: ParamMappingPageStateModel): (id: string) => ParamMapping|null {
		return (id: string) => {
			return id in state.entities ? state.entities[id] : null;
		};
	}

	@Selector()
	public static getAll(state: ParamMappingPageStateModel) {
		return state.ids.map(id => state.entities[id]);
	}

	@Selector()
	public static getIds(state: ParamMappingPageStateModel) {
		return state.ids;
	}

	@Selector()
	public static getState(state: ParamMappingPageStateModel) {
		return state;
	}

	@Selector()
	public static getPage(state: ParamMappingPageStateModel): ParamMappingPage {
		return {
			ids: state.ids,
			mappings: state.entities
		};
	}

	@Selector()
	public static getMappings(state: ParamMappingPageStateModel): ParamMapping[] {
		return state.ids.map(id => state.entities[id]);
	}

	@Selector()
	public static getSelectedMapping(state: ParamMappingPageStateModel): ParamMapping|null {
		if (!state.selectedMappingId) {
			return null;
		}
		return state.entities[state.selectedMappingId];
	}

	@Selector()
	public static isEndpointLearning(state: ParamMappingPageStateModel): boolean {
		return state.isEndpointLearning;
	}

	@Selector()
	public static getVstPathPrefix(state: ParamMappingPageStateModel): string {
		return state.vstPathPrefix;
	}

	@Selector()
	public static getLearningMappingItemId(state: ParamMappingPageStateModel): number|null {
		return state.learningMappingItemId;
	}

	@Selector()
	public static getValueLearningIndex(state: ParamMappingPageStateModel): number|null {
		return state.valueLearningIndex;
	}

	@Selector()
	public static getGivenVstPathPrefixByIndex(state: ParamMappingPageStateModel) {
		return (index) => {
			const mappings = this.getAll(state);
			if (index >= mappings.length) {
				return state.vstPathPrefix;
			}
			if (mappings[index] && mappings[index].id in state.vstPathPrefixes) {
				return state.vstPathPrefix + state.vstPathPrefixes[mappings[index].id];
			}
			return state.vstPathPrefix;
		};
	}

	@Action({type: LoadParamMappingPageFromEffectAction.type})
	public loadFromEffect(ctx: StateContext<ParamMappingPageStateModel>, action: LoadParamMappingPageFromEffectActionDecl) {
		const effect = (<Effect> this.store.selectSnapshot(VSTState.getVstById)(action.effectId));
		const effectDisposition = this.store.selectSnapshot(SessionState.getEffectDisposition);
		const page = effect.paramMappingPage;
		let vstPathPrefix: string;

		if (effectDisposition && effectDisposition.scope === EffectScope.Global) {
			vstPathPrefix = BiduleOscHelper.getGlobalEffectPrefix();
			//if (!effectDisposition) {
				this.store.dispatch(new SetEffectDispositionAction(<EffectDisposition>{
					scope: EffectScope.Global,
					placement: effect.placement
				}, true));
			//}
		} else {
			const currentLayer = this.store.selectSnapshot(ManualState.getCurrentLayer);
			vstPathPrefix = BiduleOscHelper.getLocalVstPrefix(currentLayer);
			//if (!effectDisposition) {
				this.store.dispatch(new SetEffectDispositionAction(<EffectDisposition>{
					scope: EffectScope.Local,
					placement: effect.placement
				}, true));
			//}
		}
		vstPathPrefix += effect.id + '/';

		ctx.setState({
			ids: page.ids,
			entities: page.mappings,
			selectedMappingId: null,
			isEndpointLearning: false,
			valueLearningIndex: null,
			vstPathPrefix: vstPathPrefix,
			learningMappingItemId: null,
			vstPathPrefixes: { }
		});

		// todo maybe add nr flag? (no retransmit - both states on back and front transmits)
		// ctx.dispatch(new SetKeyboardRouteAction(KeyboardRoutes.EFFECT_DETAIL));
	}

	@Action({type: LoadParamMappingPageFromInstrumentAction.type})
	public loadFromInstrument(ctx: StateContext<ParamMappingPageStateModel>, action: LoadParamMappingPageFromInstrumentActionDecl) {
		const instrument = (<Instrument> this.store.selectSnapshot(VSTState.getVstById)(action.instrumentId));
		const page = action.paramMappingGroupId in instrument.paramMappingGroups ? instrument.paramMappingGroups[action.paramMappingGroupId].paramMappingPage :
			(instrument.defaultParamMappingGroupId && instrument.defaultParamMappingGroupId in instrument.paramMappingGroups ? instrument.paramMappingGroups[instrument.defaultParamMappingGroupId].paramMappingPage : {
				ids: [],
				mappings: { }
			})


		let vstPathPrefix: string;

		const currentLayer = this.store.selectSnapshot(ManualState.getCurrentLayer);
		vstPathPrefix = BiduleOscHelper.getLocalVstPrefix(currentLayer);

		vstPathPrefix += instrument.id + '/';

		ctx.setState({
			ids: page.ids,
			entities: page.mappings,
			selectedMappingId: null,
			isEndpointLearning: false,
			valueLearningIndex: null,
			vstPathPrefix: vstPathPrefix,
			learningMappingItemId: null,
			vstPathPrefixes: { }
		});

		// todo maybe add nr flag? (no retransmit - both states on back and front transmits)
		// ctx.dispatch(new SetKeyboardRouteAction(KeyboardRoutes.EFFECT_DETAIL));
	}

	@Action({type: ResetParamMappingPageAction.type})
	public resetPage(ctx: StateContext<ParamMappingPageStateModel>, action) {
		ctx.setState({
			ids: [],
			entities: { },
			selectedMappingId: null,
			isEndpointLearning: false,
			valueLearningIndex: null,
			vstPathPrefix: null,
			learningMappingItemId: null,
			vstPathPrefixes: { }
		});
	}

	@Action({type: UpdateParamMappingAction.type})
	public update(ctx: StateContext<ParamMappingPageStateModel>, action: UpdateEntityActionDecl<ParamMapping>) {
		ctx.setState(
			<StateOperator<ParamMappingPageStateModel>>updateEntity(
				action.entity
			)
		);
	}

	@Action({type: UpdateParamMappingStrategyAction.type})
	public updateStrategy(ctx: StateContext<ParamMappingPageStateModel>, action: UpdateParamMappingStrategyActionDecl) {
		const state = ctx.getState();
		if (!state.selectedMappingId) {
			return state;
		}
		const entities = state.entities;
		entities[state.selectedMappingId] = {
			...(entities[state.selectedMappingId]),
			items: entities[state.selectedMappingId].items.map((item, index) => index !== action.itemId ? item : {...item, mappingStrategy: action.strategy})
		};

		ctx.setState({
			...state,
			entities: entities
		});
	}

	@Action({type: PatchParamMappingStrategyAction.type})
	public patchStrategy(ctx: StateContext<ParamMappingPageStateModel>, action: PatchParamMappingStrategyActionDecl) {
		const state = ctx.getState();
		if (!state.selectedMappingId || action.itemId === null) {
			return state;
		}
		const entities = state.entities;
		entities[state.selectedMappingId] = {
			...(entities[state.selectedMappingId]),
			items: entities[state.selectedMappingId].items.map((item, index) => index !== action.itemId ? item : {...item, mappingStrategy: { ...item.mappingStrategy, ... action.strategy }})
		};

		ctx.setState({
			...state,
			entities: entities
		});
	}

	@Action({type: AddParamMappingAction.type})
	public add(ctx: StateContext<ParamMappingPageStateModel>, action: AddEntityActionDecl<ParamMapping>) {
		ctx.setState(
			<StateOperator<ParamMappingPageStateModel>>addEntity(
				action.entity
			)
		);
	}

	@Action({type: MoveParamMappingAction.type})
	public move(ctx: StateContext<ParamMappingPageStateModel>, action: MoveEntityActionDecl<ParamMapping>) {
		ctx.setState(
			<StateOperator<ParamMappingPageStateModel>>moveEntity(
				action.oldIndex, action.newIndex
			)
		);
	}

	@Action({type: RemoveParamMappingAction.type})
	public remove(ctx: StateContext<ParamMappingPageStateModel>, action: RemoveEntityActionDecl) {
		if (action.id === ctx.getState().selectedMappingId) {
			ctx.patchState({
				selectedMappingId: null
			});
		}
		ctx.setState(
			<StateOperator<ParamMappingPageStateModel>>removeEntity(
				action.id
			)
		);
	}

	@Action({type: SelectParamMappingAction.type})
	public selectMapping(ctx: StateContext<ParamMappingPageStateModel>, action: SelectParamMappingAction) {
		ctx.patchState({
			selectedMappingId: action.paramMappingId,
			isEndpointLearning: false,
			learningMappingItemId: null,
			valueLearningIndex: null
		});
	}

	@Action({type: SetEndpointLearningAction.type})
	public setEndpointLearning(ctx: StateContext<ParamMappingPageStateModel>, action: SetEndpointLearningAction) {
		ctx.patchState({
			isEndpointLearning: action.isLearning
		});
	}

	@Action({type: SetParamMappingValueLearningAction.type})
	public setParamMappingValueLearning(ctx: StateContext<ParamMappingPageStateModel>, action: SetParamMappingValueLearningActionDecl) {
		ctx.patchState({
			learningMappingItemId: action.paramMappingItemId,
			valueLearningIndex: action.learningIndex,
			isEndpointLearning: false
		});
	}

	@Action({type: LoadParamMappingPageAction.type})
	public loadPage(ctx: StateContext<ParamMappingPageStateModel>, action: LoadParamMappingPageActionDecl) {
		let vstPathPrefix: string;
		const effectDisposition = this.store.selectSnapshot(SessionState.getEffectDisposition);

		if (effectDisposition && effectDisposition.scope === EffectScope.Global) {
			vstPathPrefix = BiduleOscHelper.getGlobalEffectPrefix();
		} else {
			const currentLayer = this.store.selectSnapshot(ManualState.getCurrentLayer);
			vstPathPrefix = BiduleOscHelper.getLocalVstPrefix(currentLayer);
		}

		ctx.setState({
			ids: action.page.ids,
			entities: action.page.mappings,
			selectedMappingId: null,
			isEndpointLearning: false,
			valueLearningIndex: null,
			vstPathPrefix: vstPathPrefix,
			learningMappingItemId: null,
			vstPathPrefixes: action.vstPrefixes
		});
	}

}