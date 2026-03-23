import { Component, inject, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ThemeService } from './core/services/theme.service';
import { ThemeSwitcher } from './components/theme-switcher/theme-switcher';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet,ThemeSwitcher],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('missCherryui');
    private theme = inject(ThemeService);
  constructor() {
    this.theme.init(); // ✅ apply saved/system theme before UI renders
  }
}
