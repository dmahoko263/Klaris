import { inject, Injectable } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { RouterStateSnapshot } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class AppTitleStrategy {
  private readonly title=inject(Title);

  updateTitle(snapshot: RouterStateSnapshot):void{
    const pageTitle=this.title.getTitle();
    this.title.setTitle(`BlockChain - ${pageTitle}`)
  }
}
