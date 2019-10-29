export enum RotationDirection {
	FORWARD,
	BACKWARD
}

export class SlMkII {
	public static readonly SYSEX_HEADER = [0xF0, 0x00, 0x20, 0x29, 0x03, 0x03, 0x12, 0x00, 0x02, 0x00];
	public static readonly SYSEX_FOOTER = [0xF7];

	public static buildSysex(bytes: number[]) {
		return this.SYSEX_HEADER.concat(bytes).concat(this.SYSEX_FOOTER);
	}
}