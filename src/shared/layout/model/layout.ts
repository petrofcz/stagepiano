import {Entity} from '../../common/entity';

export interface Layout extends Entity {
	name: string;
	biduleFile: string;
	lastOpened?: number;
}