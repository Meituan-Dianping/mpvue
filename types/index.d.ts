import * as V from "./vue";
import * as Options from "./options";
import * as Plugin from "./plugin";
import * as VNode from "./vnode";

// `Vue` in `export = Vue` must be a namespace
// All available types are exported via this namespace
declare namespace Vue {
  export type CreateElement = V.CreateElement;

  export type Component = Options.Component;
  export type AsyncComponent = Options.AsyncComponent;
  export type ComponentOptions<V extends Vue> = Options.ComponentOptions<V>;
  export type FunctionalComponentOptions = Options.FunctionalComponentOptions;
  export type RenderContext = Options.RenderContext;
  export type PropOptions = Options.PropOptions;
  export type ComputedOptions<V extends Vue> = Options.ComputedOptions<V>;
  export type WatchHandler<V extends Vue> = Options.WatchHandler<V>;
  export type WatchOptions = Options.WatchOptions;
  export type DirectiveFunction = Options.DirectiveFunction;
  export type DirectiveOptions = Options.DirectiveOptions;

  export type PluginFunction<T> = Plugin.PluginFunction<T>;
  export type PluginObject<T> = Plugin.PluginObject<T>;

  export type VNodeChildren = VNode.VNodeChildren;
  export type VNodeChildrenArrayContents = VNode.VNodeChildrenArrayContents;
  export type VNode = VNode.VNode;
  export type VNodeComponentOptions = VNode.VNodeComponentOptions;
  export type VNodeData = VNode.VNodeData;
  export type VNodeDirective = VNode.VNodeDirective;
}

// TS cannot merge imported class with namespace, declare a subclass to bypass
declare class Vue extends V.Vue {}

export = Vue;
