import {State, Action, Selector, StateContext, StateOperator, Store} from '@ngxs/store';
import {VST} from '../model/VST';
import {addEntity, updateEntity} from '../../ngxs/entity/state-operators';
import {defaultEntityState, EntityStateModel} from '../../ngxs/entity/state-model';
import {AddEntityActionDecl} from '../../ngxs/entity/actions';
import {AddVSTAction, SaveEffectParamMappingPageAction, SaveEffectParamMappingPageActionDecl} from './vst.actions';
import {Effect} from '../model/effect';
import {ParamMappingPageState} from '../../paramMapping/state/paramMappingPage.state';
import {Navigate} from '@ngxs/router-plugin';

export interface VSTStateModel extends EntityStateModel<VST> {
}

@State<VSTStateModel>({
	name: 'VST',
	defaults: Object.assign(
		defaultEntityState<VST>(), {
		}
	)
})
export class VSTState {

	constructor(protected store: Store) { }

	@Selector()
	public static getState(state: VSTStateModel) {
		return state;
	}

	@Selector()
	public static getInstruments(state: VSTStateModel) {
		return state.ids.map(id => state.entities[id]).filter((vst) => {
			return vst.type === 'instrument';
		});
	}

	@Selector()
	public static getEffects(state: VSTStateModel): Effect[] {
		return <Effect[]> state.ids.map(id => state.entities[id]).filter((vst) => {
			return vst.type === 'effect';
		});
	}

	@Selector()
	public static getVstById(state: VSTStateModel) {
		return (id: string) => {
			return id in state.entities ? state.entities[id] : null;
		};
	}

	@Action({type: AddVSTAction.type})
	public update(ctx: StateContext<VSTStateModel>, action: AddEntityActionDecl<VST>) {
		ctx.setState(
			<StateOperator<VSTStateModel>>addEntity(
				action.entity
			)
		);
	}

	@Action({type: SaveEffectParamMappingPageAction.type})
	public saveEffectParamMapping(ctx: StateContext<VSTStateModel>, action: SaveEffectParamMappingPageActionDecl) {
		ctx.setState(
			<StateOperator<VSTStateModel>>updateEntity(
				<Effect>{
					id: action.effectId,
					paramMappingPage: action.paramMappingPage
				}
			)
		);
		this.store.dispatch(new Navigate(['/effects']));
	}

}