import astMap from '../config/astMap'

export default function (ast) {
  const { iterator1, for: forText, key, alias, attrsMap } = ast

  if (forText) {
    attrsMap[astMap['v-for']] = `{{${forText}}}`
    if (iterator1) {
      attrsMap[astMap['iterator1']] = iterator1
    }
    if (key) {
      attrsMap[astMap['key']] = key
    }
    if (alias) {
      attrsMap[astMap['alias']] = alias
    }

    delete attrsMap['v-for']
  }

  return ast
}
