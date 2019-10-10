import {State, Action, Selector, StateContext} from '@ngxs/store';
import {UpdateSettingsAction, UpdateSettingsActionDecl} from './settings.actions';

export interface SettingsStateModel {
}

@State<SettingsStateModel>({
	name: 'settings',
	defaults: {
	}
})
export class SettingsState {

	@Selector()
	public static getState(state: SettingsStateModel) {
		return state;
	}

	@Action({type: UpdateSettingsAction.type})
	public update(ctx: StateContext<SettingsStateModel>, action: UpdateSettingsActionDecl) {
		const stateModel = ctx.getState();
		ctx.setState(stateModel);
	}
}