/* @flow */

import deindent from 'de-indent'
import { parseHTML } from 'compiler/parser/html-parser'
import { makeMap } from 'shared/util'

const splitRE = /\r?\n/g
const isSpecialTag = makeMap('script,style,template', true)

type Attribute = {
  name: string,
  value: string
}

/**
 * Parse a single-file component (*.vue) file into an SFC Descriptor Object.
 */
export function parseComponent (
  content: string,
  options?: Object = {}
 ): SFCDescriptor {
  const sfc: SFCDescriptor = {
    template: null,
    script: null,
    styles: []
  }
  let depth = 0
  let currentBlock: ?SFCBlock = null

  function start (
    tag: string,
    attrs: Array<Attribute>,
    unary: boolean,
    start: number,
    end: number
  ) {
    if (isSpecialTag(tag) && depth === 0) {
      currentBlock = {
        type: tag,
        content: '',
        start: end
      }
      checkAttrs(currentBlock, attrs)
      if (tag === 'style') {
        sfc.styles.push(currentBlock)
      } else {
        sfc[tag] = currentBlock
      }
    }
    if (!unary) {
      depth++
    }
  }

  function checkAttrs (block: SFCBlock, attrs: Array<Attribute>) {
    for (let i = 0; i < attrs.length; i++) {
      const attr = attrs[i]
      if (attr.name === 'lang') {
        block.lang = attr.value
      }
      if (attr.name === 'scoped') {
        block.scoped = true
      }
      if (attr.name === 'module') {
        block.module = attr.value || true
      }
      if (attr.name === 'src') {
        block.src = attr.value
      }
    }
  }

  function end (tag: string, start: number, end: number) {
    if (isSpecialTag(tag) && depth === 1 && currentBlock) {
      currentBlock.end = start
      let text = deindent(content.slice(currentBlock.start, currentBlock.end))
      // pad content so that linters and pre-processors can output correct
      // line numbers in errors and warnings
      if (currentBlock.type !== 'template' && options.pad) {
        text = padContent(currentBlock) + text
      }
      currentBlock.content = text
      currentBlock = null
    }
    depth--
  }

  function padContent (block: SFCBlock) {
    const offset = content.slice(0, block.start).split(splitRE).length
    const padChar = block.type === 'script' && !block.lang
      ? '//\n'
      : '\n'
    return Array(offset).join(padChar)
  }

  parseHTML(content, {
    start,
    end,
    sfc: true
  })

  return sfc
}
