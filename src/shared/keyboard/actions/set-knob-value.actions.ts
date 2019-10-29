export namespace keyboard {

	export interface SetKnobValueActionDecl {
		readonly knobId: number;
		readonly value: number;
	}

	export class SetKnobValueAction implements SetKnobValueActionDecl {
		static readonly type = '[Keyboard] SetKnobValue';

		constructor(
			public readonly knobId: number,
			public readonly value: number
		) { }
	}

	export interface UpdateKnobValueActionDecl {
		readonly knobId: number;
		readonly value: number;
	}

	export class UpdateKnobValueAction implements UpdateKnobValueActionDecl {
		static readonly type = '[Keyboard] UpdateKnobValue';

		constructor(
			public readonly knobId: number,
			public readonly value: number
		) { }
	}
}


export class TestAction {
	static readonly type = '[Keyboard] Test Action';
}
