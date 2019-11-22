import {Mapping} from '../../../../.node_modules/source-map';

export interface ParamMappingGroup {
	// todo move to preset namespace (and rename) ?
	id: number;
	name: string;
	paramMappingPage: ParamMappingPage;
}

export interface ParamMappingPage {
	mappings: {[key: string]: ParamMapping};
	ids: string[];
}

export interface ParamMapping {
	id: string; // 0 .. 8
	name: string;
	items: ParamMappingItem[];
	mainItemId: number|null;	 // This mapping will be displayed if multiple mapping items are available
}

export interface ParamMappingItem {
	endpoint: string;   // VST's parameter name
	mappingStrategy: ParamMappingStrategy|null;
}

export interface ParamMappingStrategy {
	type: string;
}