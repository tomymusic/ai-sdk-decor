export type ProviderKey = "replicate";

export const PROVIDERS: Record<
  ProviderKey,
  {
    displayName: string;
    iconPath: string;
    color: string;
    models: string[];
  }
> = {
  replicate: {
    displayName: "Replicate",
    iconPath: "/provider-icons/replicate.svg",
    color: "from-purple-500 to-blue-500",
    models: ["controlnet-hough"],
  },
};

export const MODEL_CONFIGS: Record<string, Record<ProviderKey, string>> = {
  default: {
    replicate:
      "854e8727697a057c525cdb45ab037f64ecca770a1769cc52287c2e56472a247b",
  },
};

export const PROVIDER_ORDER: ProviderKey[] = ["replicate"];

export const initializeProviderRecord = <T>(defaultValue?: T) =>
  Object.fromEntries(PROVIDER_ORDER.map((key) => [key, defaultValue])) as Record<
    ProviderKey,
    T
  >;
