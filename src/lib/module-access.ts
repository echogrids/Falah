export type ModuleAccess = {
  ibadah: boolean;
  qala: boolean;
  sponsorship: boolean;
  reports: boolean;
};

export const DEFAULT_MODULE_ACCESS: ModuleAccess = {
  ibadah: true,
  qala: false,
  sponsorship: false,
  reports: true,
};
