import { Injectable, signal, computed } from "@angular/core";

const LS_COLLAPSE_KEY = "cherry_sidebar_collapsed";

@Injectable({ providedIn: "root" })
export class LayoutService {
  collapsed = signal<boolean>(localStorage.getItem(LS_COLLAPSE_KEY) === "1");

  sidebarWidthClass = computed(() => (this.collapsed() ? "w-20" : "w-72"));
  mainPaddingClass = computed(() => (this.collapsed() ? "md:pl-20" : "md:pl-72"));

  toggleCollapsed() {
    const next = !this.collapsed();
    this.collapsed.set(next);
    localStorage.setItem(LS_COLLAPSE_KEY, next ? "1" : "0");
  }

  setCollapsed(value: boolean) {
    this.collapsed.set(value);
    localStorage.setItem(LS_COLLAPSE_KEY, value ? "1" : "0");
  }
}