(module
 (type $0 (func (param i32 i32 i32 i32 i32 i32 i32) (result f64)))
 (import "env" "memory" (memory $0 16))
 (export "segDistAll" (func $wasm/segdist/segDistAll))
 (export "memory" (memory $0))
 (func $wasm/segdist/segDistAll (param $0 i32) (param $1 i32) (param $2 i32) (param $3 i32) (param $4 i32) (param $5 i32) (param $6 i32) (result f64)
  (local $7 f64)
  (local $8 f64)
  (local $9 f64)
  (local $10 i32)
  (local $11 f64)
  (local $12 f64)
  (local $13 f64)
  (local $14 f64)
  (local $15 f64)
  (local $16 f64)
  (local $17 i32)
  (local $18 i32)
  (local $19 f64)
  (local $20 f64)
  (local $21 f64)
  (local $22 f64)
  (local $23 f64)
  (local $24 i32)
  (local $25 i32)
  (local $26 f64)
  (local $27 f64)
  (local $28 f64)
  (local $29 f64)
  (local $30 f64)
  (local $31 f64)
  (local $32 f64)
  f64.const inf
  local.set $9
  loop $for-loop|0
   local.get $1
   local.get $10
   i32.gt_s
   if
    local.get $5
    local.get $10
    i32.const 1
    i32.shl
    local.tee $18
    i32.const 2
    i32.shl
    i32.add
    i32.load
    local.tee $24
    i32.const 3
    i32.shl
    local.tee $17
    local.get $2
    i32.add
    f64.load
    local.set $11
    local.get $5
    local.get $18
    i32.const 1
    i32.add
    i32.const 2
    i32.shl
    i32.add
    i32.load
    local.tee $25
    i32.const 3
    i32.shl
    local.tee $18
    local.get $2
    i32.add
    f64.load
    local.set $12
    local.get $24
    i32.const 1
    i32.add
    local.tee $24
    i32.const 0
    local.get $0
    local.get $24
    i32.ne
    select
    i32.const 3
    i32.shl
    local.tee $24
    local.get $2
    i32.add
    f64.load
    local.get $11
    f64.sub
    local.set $19
    local.get $3
    local.get $24
    i32.add
    f64.load
    local.get $3
    local.get $17
    i32.add
    f64.load
    local.tee $13
    f64.sub
    local.set $20
    local.get $4
    local.get $24
    i32.add
    f64.load
    local.get $4
    local.get $17
    i32.add
    f64.load
    local.tee $14
    f64.sub
    local.set $21
    local.get $25
    i32.const 1
    i32.add
    local.tee $17
    i32.const 0
    local.get $0
    local.get $17
    i32.ne
    select
    i32.const 3
    i32.shl
    local.tee $17
    local.get $2
    i32.add
    f64.load
    local.get $12
    f64.sub
    local.tee $26
    local.get $11
    local.get $12
    f64.sub
    local.tee $27
    f64.mul
    local.get $3
    local.get $17
    i32.add
    f64.load
    local.get $3
    local.get $18
    i32.add
    f64.load
    local.tee $15
    f64.sub
    local.tee $28
    local.get $13
    local.get $15
    f64.sub
    local.tee $22
    f64.mul
    f64.add
    local.get $4
    local.get $17
    i32.add
    f64.load
    local.get $4
    local.get $18
    i32.add
    f64.load
    local.tee $16
    f64.sub
    local.tee $29
    local.get $14
    local.get $16
    f64.sub
    local.tee $30
    f64.mul
    f64.add
    local.set $31
    f64.const 0
    local.set $8
    f64.const 0
    local.set $7
    local.get $19
    local.get $19
    f64.mul
    local.get $20
    local.get $20
    f64.mul
    f64.add
    local.get $21
    local.get $21
    f64.mul
    f64.add
    local.tee $32
    f64.const 1e-12
    f64.le
    local.tee $17
    local.get $26
    local.get $26
    f64.mul
    local.get $28
    local.get $28
    f64.mul
    f64.add
    local.get $29
    local.get $29
    f64.mul
    f64.add
    local.tee $23
    f64.const 1e-12
    f64.le
    i32.and
    i32.eqz
    if
     local.get $17
     if
      f64.const 0
      f64.const 1
      local.get $31
      local.get $23
      f64.div
      local.tee $7
      local.get $7
      f64.const 1
      f64.gt
      select
      local.get $7
      f64.const 0
      f64.lt
      select
      local.set $7
     else
      local.get $19
      local.get $27
      f64.mul
      local.get $20
      local.get $22
      f64.mul
      f64.add
      local.get $21
      local.get $30
      f64.mul
      f64.add
      local.set $22
      local.get $23
      f64.const 1e-12
      f64.le
      if
       f64.const 0
       f64.const 1
       local.get $22
       f64.neg
       local.get $32
       f64.div
       local.tee $8
       local.get $8
       f64.const 1
       f64.gt
       select
       local.get $8
       f64.const 0
       f64.lt
       select
       local.set $8
      else
       local.get $32
       local.get $23
       f64.mul
       local.get $19
       local.get $26
       f64.mul
       local.get $20
       local.get $28
       f64.mul
       f64.add
       local.get $21
       local.get $29
       f64.mul
       f64.add
       local.tee $7
       local.get $7
       f64.mul
       f64.sub
       local.tee $8
       f64.const 1e-12
       f64.gt
       if (result f64)
        f64.const 0
        f64.const 1
        local.get $7
        local.get $31
        f64.mul
        local.get $22
        local.get $23
        f64.mul
        f64.sub
        local.get $8
        f64.div
        local.tee $8
        local.get $8
        f64.const 1
        f64.gt
        select
        local.get $8
        f64.const 0
        f64.lt
        select
       else
        f64.const 0
       end
       local.set $8
       local.get $7
       local.get $8
       f64.mul
       local.get $31
       f64.add
       local.get $23
       f64.div
       local.tee $23
       f64.const 0
       f64.lt
       if (result f64)
        f64.const 0
        f64.const 1
        local.get $22
        f64.neg
        local.get $32
        f64.div
        local.tee $7
        local.get $7
        f64.const 1
        f64.gt
        select
        local.get $7
        f64.const 0
        f64.lt
        select
        local.set $8
        f64.const 0
       else
        local.get $23
        f64.const 1
        f64.gt
        if (result f64)
         f64.const 0
         f64.const 1
         local.get $7
         local.get $22
         f64.sub
         local.get $32
         f64.div
         local.tee $7
         local.get $7
         f64.const 1
         f64.gt
         select
         local.get $7
         f64.const 0
         f64.lt
         select
         local.set $8
         f64.const 1
        else
         local.get $23
        end
       end
       local.set $7
      end
     end
    end
    local.get $6
    local.get $10
    i32.const 48
    i32.mul
    i32.add
    local.tee $17
    local.get $11
    local.get $19
    local.get $8
    f64.mul
    f64.add
    local.get $12
    local.get $26
    local.get $7
    f64.mul
    f64.add
    f64.sub
    local.tee $11
    local.get $11
    f64.mul
    local.get $13
    local.get $20
    local.get $8
    f64.mul
    f64.add
    local.get $15
    local.get $28
    local.get $7
    f64.mul
    f64.add
    f64.sub
    local.tee $12
    local.get $12
    f64.mul
    f64.add
    local.get $14
    local.get $21
    local.get $8
    f64.mul
    f64.add
    local.get $16
    local.get $29
    local.get $7
    f64.mul
    f64.add
    f64.sub
    local.tee $13
    local.get $13
    f64.mul
    f64.add
    f64.sqrt
    local.tee $14
    f64.store
    local.get $17
    local.get $8
    f64.store offset=8
    local.get $17
    local.get $7
    f64.store offset=16
    local.get $17
    local.get $11
    f64.store offset=24
    local.get $17
    local.get $12
    f64.store offset=32
    local.get $17
    local.get $13
    f64.store offset=40
    local.get $14
    local.get $9
    local.get $9
    local.get $14
    f64.gt
    select
    local.set $9
    local.get $10
    i32.const 1
    i32.add
    local.set $10
    br $for-loop|0
   end
  end
  local.get $9
 )
)
