export interface SetKnobValueAction {
	type: '[Keyboard] SetKnobValue';
	knobId: number;
	value: number;
}
