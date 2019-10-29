import {MidiAdapter} from '../../automap/midi-adapter';

export class Buttons {
	public static readonly BUTTON_ROW1_1 = 24;
	public static readonly BUTTON_ROW1_2 = 25;
	public static readonly BUTTON_ROW1_3 = 26;
	public static readonly BUTTON_ROW1_4 = 27;
	public static readonly BUTTON_ROW1_5 = 28;
	public static readonly BUTTON_ROW1_6 = 29;
	public static readonly BUTTON_ROW1_7 = 30;
	public static readonly BUTTON_ROW1_8 = 31;
	public static readonly BUTTON_ROW2_1 = 32;
	public static readonly BUTTON_ROW2_2 = 33;
	public static readonly BUTTON_ROW2_3 = 34;
	public static readonly BUTTON_ROW2_4 = 35;
	public static readonly BUTTON_ROW2_5 = 36;
	public static readonly BUTTON_ROW2_6 = 37;
	public static readonly BUTTON_ROW2_7 = 38;
	public static readonly BUTTON_ROW2_8 = 39;

	constructor(protected midiAdapter: MidiAdapter) { }
}