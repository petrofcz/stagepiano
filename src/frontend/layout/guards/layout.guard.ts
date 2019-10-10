import {Injectable} from '@angular/core';
import {ActivatedRouteSnapshot, CanActivate} from '@angular/router';
import {Observable} from 'rxjs';

import {Select} from '@ngxs/store';
import {LayoutState} from '../../../shared/layout/state/layout.state';
import {map} from 'rxjs/operators';


@Injectable()
export class LayoutGuard implements CanActivate {

	@Select(LayoutState.isLayoutLoaded) isLayoutLoaded: Observable<boolean>;

	canActivate(route: ActivatedRouteSnapshot): Observable<boolean> {
		return this.isLayoutLoaded;
	}
}