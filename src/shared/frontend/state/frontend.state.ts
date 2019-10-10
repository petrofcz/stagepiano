import {Action, Selector, State, StateContext} from '@ngxs/store';
import {FrontendInitialized} from './frontend.actions';

export interface FrontendStateModel {
	initialized: boolean;
}

@State<FrontendStateModel>({
	name: 'frontend',
	defaults: {
		initialized: false
	}
})
export class FrontendState {
	@Selector()
	public static isInitialized(state: FrontendStateModel): boolean {
		return state.initialized === true;
	}

	@Selector()
	public static isInitializing(state: FrontendStateModel): boolean {
		return state.initialized === false;
	}

	@Action({type: FrontendInitialized.type})
	public update(ctx: StateContext<FrontendStateModel>, action: FrontendInitialized) {
		ctx.patchState({
			initialized: true
		});
	}
}