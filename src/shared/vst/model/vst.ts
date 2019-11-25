import {Entity} from '../../common/entity';

export interface VST extends Entity {
	id: string;	 // = bidule name
	name: string;   // = trimmed bidule name (GEDelay -> Delay)
	type: string;
	snapshot: object|null;
}