import {VST} from './vst';
import {ParamMappingRecord} from '../../paramMapping/model/model';

export interface Instrument extends VST {
	paramMappingRecords: ParamMappingRecord[];
	defaultParamMappingRecordId: number;
	type: 'instrument';
}