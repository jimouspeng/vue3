/*
 * @Date: 2022-04-30 23:45:05
 * @LastEditors: jimouspeng
 * @Description: vue3响应系统
 * @LastEditTime: 2022-05-04 18:18:54
 * @FilePath: \vue3\source-code\proxy.js
 */
// bucket -> 存储副作用函数的桶,可利用weakMap的自动垃圾回收机制，为什么不用weakSet,因为 WeakSet 只能放置对象,不灵活
const bucket = new WeakMap()
// activeEffect -> 存储被注册副作用函数的全局变量
let activeEffect = null
// 原始数据-data
const data = { ok: true, text: 'hello world' }
/**
 * 代理数据-obj
 * objMap: 代理数据的Map
 * keyMap
 */
const obj = new Proxy(data, {
    get(target, key) {
        if (!activeEffect) return
        let objMap = bucket.get(target)
        if (!objMap) {
            bucket.set(target, (objMap = new Map()))
        }
        let keyMap = objMap.get(key)
        if (!keyMap) {
            /** 这里用set存keyMap方便直接去重 */
            objMap.set(key, (keyMap = new Set()))
        }
        keyMap.add(activeEffect)
        /** 收集每个副作用函数依赖的属性集合 */
        activeEffect.deps.push(keyMap)
        return target[key]
    },
    set(target, key, newVal) {
        target[key] = newVal
        const objMap = bucket.get(target)
        if (!objMap) return
        const keyMap = objMap.get(key)
        /** 拿到每个属性的副作用函数，并执行 */
        // keyMap &&
        //     keyMap.forEach((fn) => {
        //         fn()
        //         console.log('执行副作用函数：', key, activeEffect.deps)
        //     })
        const effectRun = new Set(keyMap)
        effectRun.forEach((fn) => {
            fn()
            console.log('执行副作用函数：', key, activeEffect.deps)
        })
        return true
    },
})
function cleanUp(effectFn) {
    for (let i = 0; i < effectFn.deps.length; i++) {
        const deps = effectFn.deps[i]
        console.log('deps:', effectFn)
        deps.delete(effectFn)
    }
    effectFn.deps = []
}
/** 用来注册副作用函数 */
function effect(effectFnc) {
    const execFn = () => {
        cleanUp(execFn)
        activeEffect = execFn
        effectFnc()
    }
    execFn.deps = []
    execFn()
}
/** 定义一个副作用函数 */
const effectFnc = () => {
    document.body.innerText = obj.ok ? obj.text : 'not'
}
effect(effectFnc)

setTimeout(() => {
    obj.text = 'jimous is cool'
}, 1000)

setTimeout(() => {
    console.log('执行')
    obj.otherParams = 'jimous is cool'
    obj.ok = false
    setTimeout(() => {
        obj.text = 'jimous is cool 2'
        console.log(bucket)
    }, 500)
}, 2000)
