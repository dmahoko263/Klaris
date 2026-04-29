import { Injectable, signal, computed } from "@angular/core";

const LS_COLLAPSE_KEY = "cherry_sidebar_collapsed";

@Injectable({
  providedIn: "root",
})
export class LayoutService {
  collapsed = signal<boolean>(
    localStorage.getItem(LS_COLLAPSE_KEY) === "1"
  );

  /*
   BEFORE
   expanded = w-72
   collapsed = w-20

   AFTER
   expanded = w-64
   collapsed = w-16

   This reduces excessive left padding
   and gives more space to content.
  */

  sidebarWidthClass = computed(() =>
    this.collapsed()
      ? "w-16"
      : "w-64"
  );

  mainPaddingClass = computed(() =>
    this.collapsed()
      ? "md:pl-16"
      : "md:pl-64"
  );

  toggleCollapsed() {
    const next = !this.collapsed();

    this.collapsed.set(next);

    localStorage.setItem(
      LS_COLLAPSE_KEY,
      next ? "1" : "0"
    );
  }

  setCollapsed(value: boolean) {
    this.collapsed.set(value);

    localStorage.setItem(
      LS_COLLAPSE_KEY,
      value ? "1" : "0"
    );
  }
}