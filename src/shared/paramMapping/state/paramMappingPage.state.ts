import {defaultEntityState, EntityStateModel} from '../../ngxs/entity/state-model';
import {Action, Selector, State, StateContext, StateOperator, Store} from '@ngxs/store';
import {ParamMapping, ParamMappingPage} from '../model/model';
import {
	AddEntityActionDecl,
	MoveEntityActionDecl,
	RemoveEntityActionDecl,
	SaveEntityActionDecl,
	UpdateEntityActionDecl
} from '../../ngxs/entity/actions';
import {addEntity, moveEntity, removeEntity, saveEntity, updateEntity} from '../../ngxs/entity/state-operators';
import {
	AddParamMappingAction, LoadParamMappingPageFromEffectAction,
	LoadParamMappingPageFromEffectActionDecl,
	MoveParamMappingAction, RemoveParamMappingAction,
	UpdateParamMappingAction
} from './paramMappingPage.actions';
import {VSTState} from '../../vst/state/vst.state';
import {Effect} from '../../vst/model/effect';
import {SetKeyboardRouteAction} from '../../session/state/session.actions';
import {KeyboardRouter} from '../../../backend/keyboard/router/keyboardRouter';
import {KeyboardRoute} from '../../../backend/keyboard/router/keyboardRoute';

export interface ParamMappingPageStateModel extends EntityStateModel<ParamMapping> {
}

// this state represents current param page
@State<ParamMappingPageStateModel>({
	name: 'paramMappingPage',
	defaults: defaultEntityState<ParamMapping>()
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

	@Action({type: LoadParamMappingPageFromEffectAction.type})
	public loadFromEffect(ctx: StateContext<ParamMappingPageStateModel>, action: LoadParamMappingPageFromEffectActionDecl) {
		const page = (<Effect> this.store.selectSnapshot(VSTState.getVstById)(action.effectId)).paramMappingPage;
		ctx.setState({
			ids: page.ids,
			entities: page.mappings
		});
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
		ctx.setState(
			<StateOperator<ParamMappingPageStateModel>>removeEntity(
				action.id
			)
		);
	}

}