export interface Layer {
	// ids are 00 - mn
	id: string;
	name: string;
	manualId: string;
	position: number;
	availableVstIds: string[];
}