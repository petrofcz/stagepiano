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
	RemoveParamMappingAction,
	SelectParamMappingAction,
	SetEndpointLearningAction,
	UpdateParamMappingAction
} from './paramMappingPage.actions';
import {VSTState} from '../../vst/state/vst.state';
import {Effect, EffectScope} from '../../vst/model/effect';
import {SetKeyboardRouteAction} from '../../session/state/session.actions';
import {KeyboardRoute} from '../../../backend/keyboard/router/keyboardRoute';
import {SessionState} from '../../session/state/session.state';
import {ManualState} from '../../manual/state/manual.state';
import {BiduleOscHelper} from '../../bidule/osc/bidule-osc-helper';

export interface ParamMappingPageStateModel extends EntityStateModel<ParamMapping> {
	selectedMappingId: string|null;
	isEndpointLearning: boolean;
	vstPathPrefix: string|null;
}

// this state represents current param page
@State<ParamMappingPageStateModel>({
	name: 'paramMappingPage',
	defaults: Object.assign(
		defaultEntityState<ParamMapping>(), {
			selectedMappingId: null,
			isEndpointLearning: false,
			vstPathPrefix: null
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

	@Action({type: LoadParamMappingPageFromEffectAction.type})
	public loadFromEffect(ctx: StateContext<ParamMappingPageStateModel>, action: LoadParamMappingPageFromEffectActionDecl) {
		const effect = (<Effect> this.store.selectSnapshot(VSTState.getVstById)(action.effectId));
		const effectDisposition = this.store.selectSnapshot(SessionState.getEffectDisposition);
		const page = effect.paramMappingPage;
		let vstPathPrefix: string;

		if (effectDisposition && effectDisposition.scope === EffectScope.Global) {
			vstPathPrefix = BiduleOscHelper.getGlobalEffectPrefix();
		} else {
			const currentLayer = this.store.selectSnapshot(ManualState.getCurrentLayer);
			vstPathPrefix = BiduleOscHelper.getLocalVstPrefix(currentLayer);
		}
		vstPathPrefix += effect.id + '/';

		ctx.setState({
			ids: page.ids,
			entities: page.mappings,
			selectedMappingId: null,
			isEndpointLearning: false,
			vstPathPrefix: vstPathPrefix
		});

		// todo maybe add nr flag? (no retransmit - both states on back and front transmits)
		ctx.dispatch(new SetKeyboardRouteAction(KeyboardRoute.PARAM_MAPPING));
	}

	@Action({type: UpdateParamMappingAction.type})
	public update(ctx: StateContext<ParamMappingPageStateModel>, action: UpdateEntityActionDecl<ParamMapping>) {
		ctx.setState(
			<StateOperator<ParamMappingPageStateModel>>updateEntity(
				action.entity
			)
		);
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
			isEndpointLearning: false
		});
	}

	@Action({type: SetEndpointLearningAction.type})
	public setLastEndpointUsed(ctx: StateContext<ParamMappingPageStateModel>, action: SetEndpointLearningAction) {
		ctx.patchState({
			isEndpointLearning: action.isLearning
		});
	}

}