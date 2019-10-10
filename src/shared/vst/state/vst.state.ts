import {State, Action, Selector, StateContext, StateOperator} from '@ngxs/store';
import {VST} from '../model/VST';
import {addEntity} from '../../ngxs/entity/state-operators';
import {defaultEntityState, EntityStateModel} from '../../ngxs/entity/state-model';
import {AddEntityActionDecl} from '../../ngxs/entity/actions';
import {AddVSTAction} from './vst.actions';

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

	@Selector()
	public static getState(state: VSTStateModel) {
		return state;
	}

	@Action({type: AddVSTAction.type})
	public update(ctx: StateContext<VSTStateModel>, action: AddEntityActionDecl<VST>) {
		ctx.setState(
			<StateOperator<VSTStateModel>>addEntity(
				action.entity
			)
		);
	}

}