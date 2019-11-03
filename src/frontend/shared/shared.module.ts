import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';

import {TranslateModule} from '@ngx-translate/core';

import {PageNotFoundComponent} from './components/';
import {WebviewDirective} from './directives/';
import {NamedEntityDialogComponent} from './dialogs/named/named-entity-dialog.component';
import {MaterialModule} from '../material';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';

@NgModule({
	declarations: [PageNotFoundComponent, WebviewDirective, NamedEntityDialogComponent],
	imports: [CommonModule, TranslateModule, MaterialModule, FormsModule, ReactiveFormsModule],
	exports: [TranslateModule, WebviewDirective]
})
export class SharedModule {
}
