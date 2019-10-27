import {Action, Selector, State, StateContext} from '@ngxs/store';
import {ResetLayoutAction} from '../layout/state/layout.actions';
import {ManualStateModel} from '../manual/state/manual.state';
import {SetAvailableGlobalEffectsAction, SetAvailableGlobalEffectsActionDecl} from './bidule.actions';

export interface BiduleStateModel {
	availableGlobalEffectIds: string[];
}

@State<BiduleStateModel>({
	name: 'Bidule',
	defaults: {
		availableGlobalEffectIds: []
	}
})
export class BiduleState {

	@Selector()
	public static getAvailableGlobalEffectIds(state: BiduleStateModel) {
		return state.availableGlobalEffectIds;
	}

	@Action({type: SetAvailableGlobalEffectsAction.type})
	public setGlobalAvailableEffects(ctx: StateContext<BiduleStateModel>, action: SetAvailableGlobalEffectsActionDecl) {
		ctx.patchState({
			availableGlobalEffectIds: action.effectIds
		});
	}

	// todo mabybe refactor to use plugin for clear states?
	@Action({type: ResetLayoutAction.type})
	public clear(ctx: StateContext<BiduleStateModel>, action) {
		ctx.patchState({
			availableGlobalEffectIds: []
		});
	}
}