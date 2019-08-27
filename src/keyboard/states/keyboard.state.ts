import {State, Selector, Action, StateContext} from '@ngxs/store';
import {SetKnobValueAction} from '../actions/set-knob-value.actions';

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
    static knobValues(model: KeyboardStateModel) {
        return model.knobValues;
    }

    @Action(SetKnobValueAction)
    public setKnobValue(ctx: StateContext<KeyboardStateModel>, { knobId, value }: SetKnobValueAction) {
        const state = ctx.getState();
        const kvo = {...state.knobValues};
        kvo[knobId] = value;
        ctx.patchState({
            ... state,
            'knobValues': kvo
        });
    }

}
