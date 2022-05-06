const set = new Set([1])

// set.forEach((el) => {
//     set.delete(1)
//     set.add(1)
//     console.log('遍历中', el)
// })

const newSet = new Set(set)

newSet.forEach((el) => {
    set.delete(1)
    set.add(1)
    console.log('遍历中', el, set)
})

let effectFnc3 = () => {
    document.body.innerText = obj.ok ? obj.text : 'not'
}

let a = { a: 1 }

let activeEffect2 = null
const effectFnc = () => {
    document.body.innerText = 'not'
}
function cleanUp(effectFn) {
    for (let i = 0; i < effectFn.deps.length; i++) {
        const deps = effectFn.deps[i]
        console.log('deps:', effectFn)
        deps.delete(effectFn)
    }
    effectFn.deps = []
}
function effect(effectFnc) {
    const execFn = () => {
        cleanUp(execFn)
        activeEffect2 = execFn
        effectFnc()
    }
    execFn.deps = []
    execFn()
}

effect(effectFnc)

const set2 = new Set()
set2.add(3)
set2.add(activeEffect2)
set2.add(a)
effectFnc3 = 3
a = 9
set2.add(3)
console.log(set2.has(effectFnc3), set2.has(activeEffect2), a)
console.log(set2)
effect(effectFnc)
