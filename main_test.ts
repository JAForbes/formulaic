import { assertEquals } from 'jsr:@std/assert'
import { expandRange, compile, dependencies, col, sanitize } from "./main.ts";
import { transform } from './main.ts';


Deno.test('expand range', () => {
  assertEquals(expandRange('A1:A3'), { "colStart": "A", "rowStart": 1, "colEnd": "A", "rowEnd": 3, "cells": ["A1", "A2", "A3"] })
  assertEquals(expandRange('A3:A1'), { "colStart": "A", "rowStart": 1, "colEnd": "A", "rowEnd": 3, "cells": ["A1", "A2", "A3"] })
  assertEquals(expandRange('A1:C1'), { "colStart": "A", "rowStart": 1, "colEnd": "C", "rowEnd": 1, "cells": ["A1", "B1", "C1"] })
  assertEquals(expandRange('A:A'), { "colStart": "A", "rowStart": 1, "colEnd": "A", "rowEnd": 99, "cells": col('A', 1, 99) })
  assertEquals(expandRange('A:C'), { "colStart": "A", "rowStart": 1, "colEnd": "C", "rowEnd": 99, "cells": [...col('A', 1, 99), ...col('B', 1, 99), ...col('C', 1, 99)] })
  assertEquals(expandRange('C:A'), { "colStart": "A", "rowStart": 1, "colEnd": "C", "rowEnd": 99, "cells": [...col('A', 1, 99), ...col('B', 1, 99), ...col('C', 1, 99)] })
})

Deno.test('transform', () => {

  {
    const actual = compile(
      'A:C + add(1, C4)'
    )
    .transformed
    assertEquals(actual, 'fn.range("A:C") + fn.add(1, fn.addr("C4"))')
  }

  {
    const actual = compile(
      'add(sum(A:C), add(1, add(1, C4)))'
    )
    .transformed
    assertEquals(actual, 'fn.add(fn.sum(fn.range("A:C")), fn.add(1, fn.add(1, fn.addr("C4"))))')
  }

})

Deno.test('dependencies', () => {
  assertEquals(dependencies(transform('A4:D5')), { addr: [], range: ["A4:D5"]})
  assertEquals(dependencies(transform('A1 + A:A + A4:D5')), { addr: ["A1"], range: ["A:A","A4:D5"]})
})

Deno.test('compile', () => {
  {
    
    // fn.addr("A1") + fn.addr("A2")
    const answer = compile('A1 + A2').compiled({
      addr(){
        return 1
      }
    })

    assertEquals(answer, 2) 
  }

  // {
  //   // sum(C:D)
  //   // fn.sum(fn.range('C:D'))
  //   const answer = compile('sum(C:D)').compiled({
  //     range(){
  //       return [1,1,1,1]
  //     },
  //     sum(xs: number[]){
  //       return xs.reduce( (p,n) => p + n, 0)
  //     }
  //   })

  //   assertEquals(answer, 'daniel: 4')
  // }
})