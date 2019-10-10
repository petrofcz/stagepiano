// todo zkontroluj navrh - jedna uroven asi chybi (vice endpointu pro 1 knob)

export interface ParamMappingRecord {
	id: number;
	name: string;
	paramMappings: ParamMapping[];
}

export interface ParamMapping {
	name: string;
	items: ParamMappingItem[];
	mainItemId: boolean;	 // This mapping will be displayed if multiple mapping items are available
}

export interface ParamMappingItem {
	endpoint: string;   // VST's parameter name
	mappingStrategy: ParamMappingStrategy;
}

export interface ParamMappingStrategy {
	type: string;
}