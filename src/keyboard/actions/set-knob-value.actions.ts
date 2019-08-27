export class SetKnobValueAction {
    public static readonly type = '[Keyboard] SetKnobValue';
    constructor(public knobId: number, public value: number) { }
}
