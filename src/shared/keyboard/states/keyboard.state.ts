import {State, Selector, Action, StateContext} from '@ngxs/store';
import {keyboard, TestAction} from '../actions/set-knob-value.actions';
import SetKnobValueAction = keyboard.SetKnobValueAction;
import SetKnobValueActionDecl = keyboard.SetKnobValueActionDecl;
import UpdateKnobValueAction = keyboard.UpdateKnobValueAction;
import UpdateKnobValueActionDecl = keyboard.UpdateKnobValueActionDecl;

export interface KeyboardStateModel {
	knobValues: object;
}

@State<KeyboardStateModel>({
	name: 'keyboard',
	defaults: {
		knobValues: {
			0: 0,
			1: 0,
			2: 0,
			3: 0,
			4: 0,
			5: 0,
			6: 0,
			7: 0
		}
	}
})
export class KeyboardState {
	@Selector()
	public static getState(state: KeyboardStateModel) {
		return state;
	}

	@Selector()
	public static knobValues(state: KeyboardStateModel) {
		return state.knobValues;
	}

	@Selector()
	public static knobValue(state: KeyboardStateModel) {
		return (knobId) => {
			return state.knobValues[knobId];
		};
	}

	@Action({type: SetKnobValueAction.type})
	public setKnobValue(ctx: StateContext<KeyboardStateModel>, action: SetKnobValueActionDecl) {
		// console.log('HANDLING KNOBS');
		const {knobId, value} = action;
		const state = ctx.getState();
		const kvo = {...state.knobValues};
		kvo[knobId] = value;
		ctx.patchState({
			...state,
			'knobValues': kvo
		});
	}

	@Action({type: UpdateKnobValueAction.type})
	public updateKnobValue(ctx: StateContext<KeyboardStateModel>, action: UpdateKnobValueActionDecl) {
		const {knobId, value} = action;
		const state = ctx.getState();
		const kvo = {...state.knobValues};
		kvo[knobId] += value;
		kvo[knobId] = Math.min(Math.max(kvo[knobId], 0), 127);
		ctx.patchState({
			...state,
			'knobValues': kvo
		});
	}

	// todo remove
	@Action(TestAction)
	public handleTestAction(ctx: StateContext<KeyboardStateModel>, action: TestAction) {
		// console.log('HANDLING TEST');
		// console.log(action);
	}


}
