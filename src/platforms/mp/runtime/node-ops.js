/* @flow */

// import { namespaceMap } from 'mp/util/index'

const obj = {}

export function createElement (tagName: string, vnode: VNode) {
  return obj
}

export function createElementNS (namespace: string, tagName: string) {
  return obj
}

export function createTextNode (text: string) {
  return obj
}

export function createComment (text: string) {
  return obj
}

export function insertBefore (parentNode: Node, newNode: Node, referenceNode: Node) {}

export function removeChild (node: Node, child: Node) {}

export function appendChild (node: Node, child: Node) {}

export function parentNode (node: Node) {
  return obj
}

export function nextSibling (node: Node) {
  return obj
}

export function tagName (node: Element): string {
  return 'div'
}

export function setTextContent (node: Node, text: string) {
  return obj
}

export function setAttribute (node: Element, key: string, val: string) {
  return obj
}
