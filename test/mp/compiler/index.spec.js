const { compile, compileToWxml } = require('../../../packages/mpvue-template-compiler')
// const { strToRegExp } = require('../helpers/index')

function assertCodegen (template, assertTemplate, options, parmas = {}) {
  const { errors = [], mpErrors = [], slots = {}} = parmas
  const compiled = compile(template, {})
  const output = compileToWxml(compiled, options)
  expect(output.compiled.mpErrors).toEqual(mpErrors)
  expect(output.compiled.errors).toEqual(errors)
  // console.log(JSON.stringify(output.slots))
  expect(JSON.stringify(output.slots)).toEqual(JSON.stringify(slots))
  expect(output.code).toEqual(assertTemplate)
  // expect(output.code.replace(/\n/g, '')).toMatch(strToRegExp(assertTemplate))
}

describe('a', () => {
  it('tag a', () => {
    assertCodegen(
      `<a></a>`,
      `<template name="a"><view class="_a"></view></template>`,
      { name: 'a' }
    )
  })
  it('tag a href', () => {
    assertCodegen(
      `<a href="s"></a>`,
      `<template name="a"><navigator url="s" class="_a"></navigator></template>`,
      { name: 'a' }
    )
  })
  it('tag a :href', () => {
    assertCodegen(
      `<a :href="s"></a>`,
      `<template name="a"><navigator url="{{s}}" class="_a"></navigator></template>`,
      { name: 'a' }
    )
  })

  it('input type', () => {
    assertCodegen(
      `<input type="button" value="Click me"></input>`,
      `<template name="a"><button class="_input">Click me</button></template>`,
      { name: 'a' }
    )
    assertCodegen(
      `<input type="radio"></input>`,
      `<template name="a"><radio class="_input" /></template>`,
      { name: 'a' }
    )
    assertCodegen(
      `<input type="checkbox" ></input>`,
      `<template name="a"><checkbox class="_input" /></template>`,
      { name: 'a' }
    )
  })
})

describe('指令', () => {
  it('v-if', () => {
    assertCodegen(
      `<div v-if="ss"></div>`,
      `<template name="a"><view wx:if="{{ss}}" class="_div"></view></template>`,
      { name: 'a' }
    )
  })

  it('v-for', () => {
    assertCodegen(
      `<div><div v-for="(item, indexx) in ss" :key="indexx"></div></div>`,
      `<template name="a"><view class="_div"><view wx:key="indexx" key="{{indexx}}" wx:for="{{ss}}" wx:for-index="indexx" wx:for-item="item" class="_div"></view></view></template>`,
      { name: 'a' }
    )
    // bug mpcomid="'0-'+index"
    assertCodegen(
      `<div><my-component v-for="item in items" :key="item.id"></my-component></div>`,
      `<import src="/components/card" /><template name="a"><view class="_div hashValue"><template wx:key="item.id" data="{{...$root[$kk+'0-'+index], $root}}" is="my-component" wx:for="{{items}}" wx:for-index="index" wx:for-item="item"></template></view></template>`,
      {
        name: 'a',
        components: {
          'my-component': {
            name: 'my-component',
            src: '/components/card'
          }
        },
        moduleId: 'hashValue'
      }
    )
  })

  it('v-bind', () => {
    assertCodegen(
      `<div :a="s"></div>`,
      `<template name="a"><view a="{{s}}" class="_div"></view></template>`,
      { name: 'a' }
    )
  })

  it('v-bind', () => {
    assertCodegen(
      `<div v-bind:a="s"></div>`,
      `<template name="a"><view a="{{s}}" class="_div"></view></template>`,
      { name: 'a' }
    )
  })

  it('v-bind', () => {
    assertCodegen(
      `<div v-bind:a="a + 1"></div>`,
      `<template name="a"><view a="{{a + 1}}" class="_div"></view></template>`,
      { name: 'a' }
    )
  })

  it('v-bind:class', () => {
    assertCodegen(
      `<div v-bind:class="{ active: isActive }"></div>`,
      `<template name="a"><view class="_div {{( isActive )? 'active' : ' '}}"></view></template>`,
      { name: 'a' }
    )
    assertCodegen(
      `<div class="static"  v-bind:class="{ active: isActive, 'textDanger': hasError }"></div>`,
      `<template name="a"><view class="_div static {{( isActive)? 'active' : ' '}} {{( hasError )? 'text-danger' : ' '}}"></view></template>`,
      { name: 'a' }
    )
    assertCodegen(
      `<my-component class="baz boo"></my-component>`,
      `<import src="/components/card" /><template name="a"><template data="{{...$root[$kk+'0'], $root}}" is="my-component"></template></template>`,
      {
        name: 'a',
        components: {
          'my-component': {
            name: 'my-component',
            src: '/components/card'
          }
        },
        moduleId: 'hashValue'
      },
      {
        mpTips: ['template 不支持此属性-> class="baz boo"'],
        mpErrors: []
      }
    )
  })

  it('v-text', () => {
    assertCodegen(
      `<div v-text="s"></div>`,
      `<template name="a"><view class="_div">{{s}}</view></template>`,
      { name: 'a' }
    )
  })

  it('v-if', () => {
    assertCodegen(
      `<div v-if="s"></div>`,
      `<template name="a"><view wx:if="{{s}}" class="_div"></view></template>`,
      { name: 'a' }
    )
    assertCodegen(
      `<div v-if="ok" class="classa" style="line-height: 100rpx"><a></a></div>`,
      `<template name="a"><view wx:if="{{ok}}" class="_div classa" style="line-height: 100rpx"><view class="_a"></view></view></template>`,
      { name: 'a' }
    )
  })

  it('v-if', () => {
    assertCodegen(
      `<div v-else-if="s"></div>`,
      `<template name="a"><view wx:elif="{{s}}" class="_div"></view></template>`,
      { name: 'a' }
    )
  })

  it('v-else', () => {
    assertCodegen(
      `<div v-else></div>`,
      `<template name="a"><view wx:else class="_div"></view></template>`,
      { name: 'a' }
    )
  })
  it('v-show', () => {
    assertCodegen(
      `<div v-show="ddd"></div>`,
      `<template name="a"><view hidden="{{!(ddd)}}" class="_div"></view></template>`,
      { name: 'a' }
    )
  })
})

describe('事件', () => {
  it('@click', () => {
    assertCodegen(
      `<a @click="ddd"></a>`,
      `<template name="a"><view bindtap="handleProxy" data-eventid="{{'0'}}" data-comkey="{{$k}}" class="_a"></view></template>`,
      { name: 'a' }
    )
  })

  it('@load', () => {
    assertCodegen(
      `<a @load="ddd"></a>`,
      `<template name="a"><view bindload="handleProxy" data-eventid="{{'0'}}" data-comkey="{{$k}}" class="_a"></view></template>`,
      { name: 'a' }
    )
  })

  it('v-on:click', () => {
    assertCodegen(
      `<a v-on:click="ddd"></a>`,
      `<template name="a"><view bindtap="handleProxy" data-eventid="{{'0'}}" data-comkey="{{$k}}" class="_a"></view></template>`,
      { name: 'a' }
    )
  })
  it('v-on', () => {
    assertCodegen(
      `<button v-on:click="say('hi')">Say hi</button>`,
      `<template name="a"><button bindtap="handleProxy" data-eventid="{{'0'}}" data-comkey="{{$k}}" class="_button">Say hi</button></template>`,
      { name: 'a' }
    )
  })
  it('v-once', () => {
    assertCodegen(
      `<button v-once>Say hi</button>`,
      `<template name="a"><button class="_button">Say hi</button></template>`,
      { name: 'a' }
    )
  })
  it('bindmarkertap', () => {
    assertCodegen(
      `<map @markertap="markertap"></map>`,
      `<template name="a"><map bindmarkertap="handleProxy" data-eventid="{{'0'}}" data-comkey="{{$k}}" class="_map"></map></template>`,
      { name: 'a' }
    )
  })
})

describe('表单', () => {
  it('textarea', () => {
    assertCodegen(
      `<textarea v-model="message" placeholder="add multiple lines"></textarea>`,
      `<template name="a"><textarea value="{{message}}" bindinput="handleProxy" placeholder="add multiple lines" data-eventid="{{'0'}}" data-comkey="{{$k}}" class="_textarea" /></template>`,
      { name: 'a' }
    )
  })
  // it('checkbox', () => {
  //   assertCodegen(
  //     `<input type="checkbox" id="checkbox" v-model="checked">`,
  //     `<template name="a"><input value="{{message}}" bindinput="handleProxy" placeholder="edit me" data-eventid="{{'0'}}" data-comkey="{{$k}}" class="_input" /></template>`,
  //     { name: 'a' }
  //   )
  // })
  // 需要核实是否支持
  it('select', () => {
    assertCodegen(
      `<select v-model="selected" multiple style="width: 50px"></select>`,
      `<template name="a"><picker value="{{selected}}" bindchange="handleProxy" multiple style="width: 50px" data-eventid="{{'0'}}" data-comkey="{{$k}}" class="_select"></picker></template>`,
      { name: 'a' }
    )
  })
  it('v-model', () => {
    assertCodegen(
      `<input v-model="message" placeholder="edit me">`,
      `<template name="a"><input value="{{message}}" bindinput="handleProxy" placeholder="edit me" data-eventid="{{'0'}}" data-comkey="{{$k}}" class="_input" /></template>`,
      { name: 'a' }
    )
  })
  // it('v-model.trim', () => {
  //   assertCodegen(
  //     `<input v-model.trim="msg">`,
  //     `<template name="a"><input value="{{message}}" bindinput="handleProxy" placeholder="edit me" data-eventid="{{'0'}}" data-comkey="{{$k}}" class="_input" /></template>`,
  //     { name: 'a' }
  //   )
  // })
  it('v-model.lazy', () => {
    assertCodegen(
      `<input v-model.lazy="msg" >`,
      `<template name="a"><input value="{{msg}}" bindblur="handleProxy" data-eventid="{{'0'}}" data-comkey="{{$k}}" class="_input" /></template>`,
      { name: 'a' }
    )
  })
  it('v-model.number', () => {
    assertCodegen(
      `<input v-model.number="age" type="number">`,
      `<template name="a"><input value="{{age}}" bindinput="handleProxy" type="number" data-eventid="{{'0'}}" data-comkey="{{$k}}" class="_input" /></template>`,
      { name: 'a' }
    )
  })
})

describe('template', () => {
  it('template', () => {
    assertCodegen(
      `<div><Card v-for="i in 10"></Card></div>`,
      `<import src="/components/card" /><template name="a"><view class="_div data-v-djskdksdksdjkksdks"><template data="{{...$root[$kk+'0-'+index], $root}}" is="Card" wx:for="{{10}}" wx:for-index="index" wx:for-item="i"></template></view></template>`,
      {
        name: 'a',
        components: {
          Card: {
            name: 'Card',
            src: '/components/card'
          }
        },
        moduleId: 'data-v-djskdksdksdjkksdks'
      }
    )
  })

  it('template', () => {
    assertCodegen(
      `<div><Card :message="1"></Card></div>`,
      `<import src="/components/card" /><template name="a"><view class="_div data-v-djskdksdksdjkksdks"><template data="{{...$root[$kk+'0'], $root}}" is="Card"></template></view></template>`,
      {
        name: 'a',
        components: {
          Card: {
            name: 'Card',
            src: '/components/card'
          }
        },
        moduleId: 'data-v-djskdksdksdjkksdks'
      }
    )
  })
  it('template', () => {
    assertCodegen(
      `<div><Card :message="1"></Card> <block><span>test</span></block></div>`,
      `<import src="/components/card" /><template name="a"><view class="_div data-v-djskdksdksdjkksdks"><template data="{{...$root[$kk+'0'], $root}}" is="Card"></template> <block><label class="_span data-v-djskdksdksdjkksdks">test</label></block></view></template>`,
      {
        name: 'a',
        components: {
          Card: {
            name: 'Card',
            src: '/components/card'
          }
        },
        moduleId: 'data-v-djskdksdksdjkksdks'
      }
    )
  })
})
describe('onchange', () => {
  it('onchange', () => {
    assertCodegen(
      `<div class="baz boo"><picker @change="sss"></picker> <input @change="sss"></input></div>`,
      `<template name="a"><view class="_div hashValue baz boo"><picker bindchange="handleProxy" data-eventid="{{'0'}}" data-comkey="{{$k}}" class="_picker hashValue"></picker> <input bindblur="handleProxy" data-eventid="{{'1'}}" data-comkey="{{$k}}" class="_input hashValue" /></view></template>`,
      {
        name: 'a',
        components: {
          'card': {
            name: 'card',
            src: '/components/card'
          }
        },
        moduleId: 'hashValue'
      }
    )
  })
})
describe('slot', () => {
  it('插槽', () => {
    assertCodegen(
      `<div><slot>test</slot></div>`,
      `<template name="a"><view class="_div testModuleId"><template name="default">test</template><template data="{{...$root[$p], $root}}" is="{{$slotdefault || 'default'}}"></template></view></template>`,
      {
        name: 'a',
        moduleId: 'testModuleId'
      }
    )
  })

  it('使用', () => {
    assertCodegen(
      `<div><slot name="w">test</slot></div>`,
      `<template name="a"><view class="_div"><template name="w">test</template><template data="{{...$root[$p], $root}}" is="{{$slotw || 'w'}}"></template></view></template>`,
      {
        name: 'a'
      }
    )
  })

  it('slot name', () => {
    assertCodegen(
      `<card class="baz boo"><a slot="header">test</a></card>`,
      `<import src="/components/card" /><template name="a"><template data="{{...$root[$kk+'0'], $root, $slotdefault:'hashValue-default-0',$slotheader:'hashValue-header-0'}}" is="card"></template></template>`,
      {
        name: 'a',
        components: {
          'card': {
            name: 'card',
            src: '/components/card'
          }
        },
        moduleId: 'hashValue'
      },
      {
        mpTips: ['template 不支持此属性-> class="baz boo"'],
        mpErrors: [],
        /* eslint-disable */
        slots: {"hashValue-default-0":{"node":{"tag":"template","attrsMap":{"name":"hashValue-default-0"},"children":[],"staticClass":"","slots":{}},"name":"default","slotId":"hashValue-default-0","code":"<template name=\"hashValue-default-0\"></template>"},"hashValue-header-0":{"node":{"type":1,"tag":"template","attrsList":[],"attrsMap":{"name":"hashValue-header-0"},"parent":{"type":1,"tag":"card","attrsList":[],"attrsMap":{"class":"baz boo"},"children":[],"plain":false,"staticClass":"\"baz boo\"","mpcomid":"'0'","attrs":[{"name":"mpcomid","value":"'0'"}],"static":false,"staticRoot":false},"children":[{"type":3,"text":"test","staticClass":"hashValue","slots":{},"attrsMap":{"class":"hashValue"}}],"plain":false,"slotTarget":"\"header\"","staticRoot":false,"staticClass":"","slots":{}},"name":"header","slotId":"hashValue-header-0","code":"<template name=\"hashValue-header-0\">test</template>"}}
      }
    )
  })

  it('slot template', () => {
    assertCodegen(
      `<card class="baz boo"><template slot="header">test</template></card>`,
      `<import src="/components/card" /><template name="a"><template data="{{...$root[$kk+'1'], $root, $slotdefault:'hashValue-default-1',$slotheader:'hashValue-header-1'}}" is="card"></template></template>`,
      {
        name: 'a',
        components: {
          'card': {
            name: 'card',
            src: '/components/card'
          }
        },
        moduleId: 'hashValue'
      },
      {
        mpErrors: [],
        mpTips: ['template 不支持此属性-> class="baz boo"'],
        slots: {"hashValue-default-1":{"node":{"tag":"template","attrsMap":{"name":"hashValue-default-1"},"children":[],"staticClass":"","slots":{}},"name":"default","slotId":"hashValue-default-1","code":"<template name=\"hashValue-default-1\"></template>"},"hashValue-header-1":{"node":{"type":1,"tag":"template","attrsList":[],"attrsMap":{"name":"hashValue-header-1"},"parent":{"type":1,"tag":"card","attrsList":[],"attrsMap":{"class":"baz boo"},"children":[],"plain":false,"staticClass":"\"baz boo\"","mpcomid":"'1'","attrs":[{"name":"mpcomid","value":"'1'"}],"static":false,"staticRoot":false},"children":[{"type":3,"text":"test","staticClass":"hashValue","slots":{},"attrsMap":{"class":"hashValue"}}],"plain":false,"slotTarget":"\"header\"","mpcomid":"'0'","attrs":[{"name":"mpcomid","value":"'0'"}],"staticRoot":false,"staticClass":"","slots":{}},"name":"header","slotId":"hashValue-header-1","code":"<template name=\"hashValue-header-1\">test</template>"}}
      }
    )
  })
  it('slot template', () => {
    assertCodegen(
      `<template class="baz boo"><template slot="header">test</template></template>`,
      `<template name="a"><template><template slot="header">test</template></template></template>`,
      {
        name: 'a',
        components: {
          'card': {
            name: 'card',
            src: '/components/card'
          }
        },
        moduleId: 'hashValue'
      },
      {
        errors: ['Cannot use <template> as component root element because it may contain multiple nodes.'],
        mpTips: ['template 不支持此属性-> class="baz boo"'],
        mpErrors: []
      }
    )
  })
})
describe('web-view', () => {
  it('web-view', () => {
    assertCodegen(
      `<web-view src="https://i.meituan.com"> </web-view>`,
      `<template name="a"><web-view src="https://i.meituan.com" class="_web-view"></web-view></template>`,
      { name: 'a' }
    );
  })
})
