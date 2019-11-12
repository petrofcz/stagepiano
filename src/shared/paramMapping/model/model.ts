export interface ParamMappingGroup {
	id: number;
	name: string;
	paramMappings: ParamMapping[];
}

export interface ParamMapping {
	name: string;
	items: ParamMappingItem[];
	mainItemId: number;	 // This mapping will be displayed if multiple mapping items are available
}

export interface ParamMappingItem {
	endpoint: string;   // VST's parameter name
	mappingStrategy: ParamMappingStrategy;
}

export interface ParamMappingStrategy {
	type: string;
}