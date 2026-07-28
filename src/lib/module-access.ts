export type ModuleAccess = {
  ibadah: boolean;
  qala: boolean;
  sponsorship: boolean;
  charity: boolean;
  reports: boolean;
};

export const DEFAULT_MODULE_ACCESS: ModuleAccess = {
  ibadah: true,
  qala: false,
  sponsorship: false,
  charity: false,
  reports: true,
};
