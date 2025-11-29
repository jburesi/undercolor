export interface NuxtModuleMaintainer {
  name: string;
  github: string;
  twitter?: string;
  bluesky?: string;
  avatar?: string;
  modules: string[];
}

export interface NuxtModuleContributor {
  id: number;
  username: string;
  contributions: number;
}

export interface NuxtModuleStats {
  version: string;
  downloads: number;
  stars: number;
  watchers: number;
  forks: number;
  defaultBranch: string;
  publishedAt: number;
  createdAt: number;
}

export interface NuxtModuleCompatibility {
  nuxt: string;
  requires?: Record<string, unknown>;
}

export interface NuxtModule {
  name: string;
  description: string;
  repo: string;
  npm: string;
  icon?: string;
  github: string;
  website: string;
  learn_more?: string;
  category: string;
  type: string;
  maintainers: NuxtModuleMaintainer[];
  compatibility: NuxtModuleCompatibility;
  stats: NuxtModuleStats;
  contributors: NuxtModuleContributor[];
}

export interface NuxtModulesRoot {
  version: string;
  category: string | null;
  generatedAt: string;
  stats: {
    downloads: number;
    stars: number;
    maintainers: number;
    contributors: number;
    modules: number;
  };
  maintainers: NuxtModuleMaintainer[];
  modules: NuxtModule[];
}
