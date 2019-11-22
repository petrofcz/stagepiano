export interface Layer {
	// ids are "0-0" - "m-n"
	id: string;
	name: string;
	manualId: string;
	position: number;
	availableVstIds: string[];
}