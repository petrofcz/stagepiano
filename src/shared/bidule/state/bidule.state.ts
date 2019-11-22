import {Action, Selector, State, StateContext} from '@ngxs/store';
import {ManualStateModel} from '../../manual/state/manual.state';
import {SetAvailableGlobalEffectsAction, SetAvailableGlobalEffectsActionDecl} from './bidule.actions';

export interface BiduleStateModel {
	availableGlobalEffectIds: string[];
	openUIOscPath: string|null;
}

@State<BiduleStateModel>({
	name: 'Bidule',
	defaults: {
		availableGlobalEffectIds: [],
		openUIOscPath: null,
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

}