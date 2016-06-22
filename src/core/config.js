/* @flow */

import { no } from 'shared/util'

export type Config = {
  // user
  optionMergeStrategies: { [key: string]: Function },
  silent: boolean,
  devtools: boolean,
  errorHandler: ?Function,
  ignoredElements: ?Array<string>,
  keyCodes: { [key: string]: number },
  // platform
  isReservedTag: (x?: string) => boolean,
  isUnknownElement: (x?: string) => boolean,
  mustUseProp: (x?: string) => boolean,
  // internal
  _assetTypes: Array<string>,
  _lifecycleHooks: Array<string>,
  _maxUpdateCount: number,
  _isServer: boolean,
  _ctors: Array<Function>
}

const config: Config = {
  /**
   * Option merge strategies (used in core/util/options)
   */
  optionMergeStrategies: Object.create(null),

  /**
   * Whether to suppress warnings.
   */
  silent: false,

  /**
   * Whether to enable devtools
   */
  devtools: process.env.NODE_ENV !== 'production',

  /**
   * Error handler for watcher errors
   */
  errorHandler: null,

  /**
   * Ignore certain custom elements
   */
  ignoredElements: null,

  /**
   * Custom user key aliases for v-on
   */
  keyCodes: Object.create(null),

  /**
   * Check if a tag is reserved so that it cannot be registered as a
   * component. This is platform-dependent and may be overwritten.
   */
  isReservedTag: no,

  /**
   * Check if a tag is an unknown element.
   * Platform-dependent.
   */
  isUnknownElement: no,

  /**
   * Check if an attribute must be bound using property, e.g. value
   * Platform-dependent.
   */
  mustUseProp: no,

  /**
   * List of asset types that a component can own.
   */
  _assetTypes: [
    'component',
    'directive',
    'transition',
    'filter'
  ],

  /**
   * List of lifecycle hooks.
   */
  _lifecycleHooks: [
    'init',
    'created',
    'beforeMount',
    'mounted',
    'beforeUpdate',
    'updated',
    'beforeDestroy',
    'destroyed',
    'activated',
    'deactivated'
  ],

  /**
   * Max circular updates allowed in a scheduler flush cycle.
   */
  _maxUpdateCount: 100,

  /**
   * Server rendering?
   */
  _isServer: process.env.VUE_ENV === 'server',

  /**
   * Keeping track of all extended Component constructors
   * so that we can update them in the case of global mixins being applied
   * after their creation.
   */
  _ctors: []
}

export default config
