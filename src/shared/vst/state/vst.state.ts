import {State, Action, Selector, StateContext, StateOperator} from '@ngxs/store';
import {VST} from '../model/VST';
import {addEntity} from '../../ngxs/entity/state-operators';
import {defaultEntityState, EntityStateModel} from '../../ngxs/entity/state-model';
import {AddEntityActionDecl} from '../../ngxs/entity/actions';
import {AddVSTAction} from './vst.actions';
import {ResetLayoutAction} from '../../layout/state/layout.actions';

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

	@Selector()
	public static getInstruments(state: VSTStateModel) {
		return state.ids.map(id => state.entities[id]).filter((vst) => {
			return vst.type === 'instrument';
		});
	}

	@Selector()
	public static getEffects(state: VSTStateModel) {
		return state.ids.map(id => state.entities[id]).filter((vst) => {
			return vst.type === 'effect';
		});
	}

	@Action({type: AddVSTAction.type})
	public update(ctx: StateContext<VSTStateModel>, action: AddEntityActionDecl<VST>) {
		ctx.setState(
			<StateOperator<VSTStateModel>>addEntity(
				action.entity
			)
		);
	}

	// todo mabybe refactor to use plugin for clear states?
	@Action({type: ResetLayoutAction.type})
	public clear(ctx: StateContext<VSTStateModel>, action) {
		ctx.setState(
			defaultEntityState<VST>()
		);
	}

}