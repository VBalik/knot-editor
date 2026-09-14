(module
 (type $0 (func (param i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 f64 f64 f64 f64 f64 f64 f64 f64 f64) (result f64)))
 (import "env" "memory" (memory $0 1))
 (export "pairPass" (func $pairs/pairPass))
 (export "memory" (memory $0))
 (func $pairs/pairPass (param $0 i32) (param $1 i32) (param $2 i32) (param $3 i32) (param $4 i32) (param $5 i32) (param $6 i32) (param $7 i32) (param $8 i32) (param $9 i32) (param $10 i32) (param $11 i32) (param $12 i32) (param $13 i32) (param $14 i32) (param $15 i32) (param $16 i32) (param $17 i32) (param $18 i32) (param $19 i32) (param $20 f64) (param $21 f64) (param $22 f64) (param $23 f64) (param $24 f64) (param $25 f64) (param $26 f64) (param $27 f64) (param $28 f64) (result f64)
  (local $29 f64)
  (local $30 f64)
  (local $31 i32)
  (local $32 i32)
  (local $33 f64)
  (local $34 i32)
  (local $35 i32)
  (local $36 f64)
  (local $37 f64)
  (local $38 f64)
  (local $39 f64)
  (local $40 f64)
  (local $41 f64)
  (local $42 i32)
  (local $43 f64)
  (local $44 f64)
  (local $45 f64)
  (local $46 f64)
  (local $47 i32)
  (local $48 i32)
  (local $49 i32)
  (local $50 f64)
  (local $51 f64)
  (local $52 f64)
  (local $53 f64)
  (local $54 f64)
  (local $55 f64)
  (local $56 i32)
  (local $57 i32)
  (local $58 f64)
  (local $59 i32)
  (local $60 i32)
  (local $61 i32)
  (local $62 f64)
  (local $63 f64)
  (local $64 f64)
  local.get $22
  local.get $22
  f64.mul
  local.set $58
  local.get $22
  local.tee $33
  local.set $63
  loop $for-loop|0
   local.get $0
   local.get $60
   i32.gt_s
   if
    local.get $60
    i32.const 2
    i32.shl
    local.tee $32
    local.get $15
    i32.add
    i32.load
    local.tee $61
    local.get $15
    local.get $60
    i32.const 1
    i32.add
    local.tee $31
    i32.const 2
    i32.shl
    i32.add
    i32.load
    local.tee $48
    i32.ne
    if
     local.get $31
     i32.const 0
     local.get $0
     local.get $31
     i32.ne
     select
     local.set $59
     local.get $60
     i32.const 3
     i32.shl
     local.tee $31
     local.get $6
     i32.add
     f64.load
     local.set $37
     local.get $7
     local.get $31
     i32.add
     f64.load
     local.set $36
     local.get $8
     local.get $31
     i32.add
     f64.load
     local.set $30
     local.get $12
     local.get $32
     i32.add
     i32.load
     i32.const 1
     i32.sub
     local.set $47
     local.get $13
     local.get $32
     i32.add
     i32.load
     i32.const 1
     i32.sub
     local.set $42
     local.get $14
     local.get $32
     i32.add
     i32.load
     i32.const 1
     i32.sub
     local.set $35
     i32.const 0
     local.set $31
     loop $for-loop|1
      local.get $48
      local.get $61
      i32.gt_s
      if
       block $for-continue|1
        local.get $16
        local.get $61
        i32.const 2
        i32.shl
        i32.add
        i32.load
        local.tee $34
        i32.const 3
        i32.shl
        local.tee $32
        local.get $6
        i32.add
        f64.load
        local.get $37
        f64.sub
        local.tee $29
        local.get $29
        f64.mul
        local.get $7
        local.get $32
        i32.add
        f64.load
        local.get $36
        f64.sub
        local.tee $29
        local.get $29
        f64.mul
        f64.add
        local.get $8
        local.get $32
        i32.add
        f64.load
        local.get $30
        f64.sub
        local.tee $29
        local.get $29
        f64.mul
        f64.add
        local.get $58
        f64.gt
        br_if $for-continue|1
        local.get $34
        i32.const 2
        i32.shl
        local.tee $32
        local.get $12
        i32.add
        i32.load
        local.get $47
        i32.sub
        local.tee $56
        i32.const 0
        i32.lt_s
        local.get $56
        i32.const 2
        i32.gt_s
        i32.or
        local.get $13
        local.get $32
        i32.add
        i32.load
        local.get $42
        i32.sub
        local.tee $49
        i32.const 0
        i32.lt_s
        i32.or
        local.get $49
        i32.const 2
        i32.gt_s
        i32.or
        local.get $14
        local.get $32
        i32.add
        i32.load
        local.get $35
        i32.sub
        local.tee $32
        i32.const 0
        i32.lt_s
        i32.or
        local.get $32
        i32.const 2
        i32.gt_s
        i32.or
        br_if $for-continue|1
        local.get $32
        i32.const 3
        i32.mul
        local.get $49
        i32.add
        i32.const 3
        i32.mul
        local.get $56
        i32.add
        i32.const 20
        i32.shl
        local.get $34
        i32.add
        local.set $34
        local.get $31
        local.tee $32
        i32.const 1
        i32.add
        local.set $31
        loop $while-continue|2
         local.get $32
         i32.const 0
         i32.gt_s
         if (result i32)
          local.get $17
          local.get $32
          i32.const 1
          i32.sub
          i32.const 2
          i32.shl
          i32.add
          i32.load
          local.get $34
          i32.gt_s
         else
          i32.const 0
         end
         if
          local.get $17
          local.get $32
          i32.const 2
          i32.shl
          i32.add
          local.get $17
          local.get $32
          i32.const 1
          i32.sub
          local.tee $32
          i32.const 2
          i32.shl
          i32.add
          i32.load
          i32.store
          br $while-continue|2
         end
        end
        local.get $17
        local.get $32
        i32.const 2
        i32.shl
        i32.add
        local.get $34
        i32.store
       end
       local.get $61
       i32.const 1
       i32.add
       local.set $61
       br $for-loop|1
      end
     end
     i32.const 0
     local.set $32
     loop $for-loop|3
      local.get $31
      local.get $32
      i32.gt_s
      if
       local.get $17
       local.get $32
       i32.const 2
       i32.shl
       i32.add
       i32.load
       i32.const 1048575
       i32.and
       local.tee $49
       i32.const 1
       i32.add
       local.tee $34
       i32.const 0
       local.get $0
       local.get $34
       i32.ne
       select
       local.set $48
       local.get $0
       local.get $49
       local.get $60
       i32.sub
       local.tee $47
       i32.sub
       local.set $42
       local.get $59
       i32.const 3
       i32.shl
       local.tee $35
       local.get $3
       i32.add
       f64.load
       local.get $60
       i32.const 3
       i32.shl
       local.tee $34
       local.get $3
       i32.add
       f64.load
       local.tee $46
       f64.sub
       local.set $45
       local.get $4
       local.get $35
       i32.add
       f64.load
       local.get $4
       local.get $34
       i32.add
       f64.load
       local.tee $44
       f64.sub
       local.set $43
       local.get $5
       local.get $35
       i32.add
       f64.load
       local.get $5
       local.get $34
       i32.add
       f64.load
       local.tee $41
       f64.sub
       local.set $55
       local.get $48
       i32.const 3
       i32.shl
       local.tee $35
       local.get $3
       i32.add
       f64.load
       local.get $49
       i32.const 3
       i32.shl
       local.tee $34
       local.get $3
       i32.add
       f64.load
       local.tee $40
       f64.sub
       local.tee $54
       local.get $46
       local.get $40
       f64.sub
       local.tee $36
       f64.mul
       local.get $4
       local.get $35
       i32.add
       f64.load
       local.get $4
       local.get $34
       i32.add
       f64.load
       local.tee $39
       f64.sub
       local.tee $53
       local.get $44
       local.get $39
       f64.sub
       local.tee $30
       f64.mul
       f64.add
       local.get $5
       local.get $35
       i32.add
       f64.load
       local.get $5
       local.get $34
       i32.add
       f64.load
       local.tee $38
       f64.sub
       local.tee $52
       local.get $41
       local.get $38
       f64.sub
       local.tee $29
       f64.mul
       f64.add
       local.set $37
       f64.const 0
       local.set $62
       f64.const 0
       local.set $64
       local.get $45
       local.get $45
       f64.mul
       local.get $43
       local.get $43
       f64.mul
       f64.add
       local.get $55
       local.get $55
       f64.mul
       f64.add
       local.tee $51
       f64.const 1e-12
       f64.le
       local.tee $34
       local.get $54
       local.get $54
       f64.mul
       local.get $53
       local.get $53
       f64.mul
       f64.add
       local.get $52
       local.get $52
       f64.mul
       f64.add
       local.tee $50
       f64.const 1e-12
       f64.le
       i32.and
       i32.eqz
       if
        local.get $34
        if
         f64.const 0
         f64.const 1
         local.get $37
         local.get $50
         f64.div
         local.tee $29
         local.get $29
         f64.const 1
         f64.gt
         select
         local.get $29
         f64.const 0
         f64.lt
         select
         local.set $64
        else
         local.get $45
         local.get $36
         f64.mul
         local.get $43
         local.get $30
         f64.mul
         f64.add
         local.get $55
         local.get $29
         f64.mul
         f64.add
         local.set $36
         local.get $50
         f64.const 1e-12
         f64.le
         if
          f64.const 0
          f64.const 1
          local.get $36
          f64.neg
          local.get $51
          f64.div
          local.tee $29
          local.get $29
          f64.const 1
          f64.gt
          select
          local.get $29
          f64.const 0
          f64.lt
          select
          local.set $62
         else
          local.get $51
          local.get $50
          f64.mul
          local.get $45
          local.get $54
          f64.mul
          local.get $43
          local.get $53
          f64.mul
          f64.add
          local.get $55
          local.get $52
          f64.mul
          f64.add
          local.tee $30
          local.get $30
          f64.mul
          f64.sub
          local.tee $29
          f64.const 1e-12
          f64.gt
          if (result f64)
           f64.const 0
           f64.const 1
           local.get $30
           local.get $37
           f64.mul
           local.get $36
           local.get $50
           f64.mul
           f64.sub
           local.get $29
           f64.div
           local.tee $29
           local.get $29
           f64.const 1
           f64.gt
           select
           local.get $29
           f64.const 0
           f64.lt
           select
          else
           f64.const 0
          end
          local.set $62
          local.get $30
          local.get $62
          f64.mul
          local.get $37
          f64.add
          local.get $50
          f64.div
          local.tee $29
          f64.const 0
          f64.lt
          if (result f64)
           f64.const 0
           f64.const 1
           local.get $36
           f64.neg
           local.get $51
           f64.div
           local.tee $29
           local.get $29
           f64.const 1
           f64.gt
           select
           local.get $29
           f64.const 0
           f64.lt
           select
           local.set $62
           f64.const 0
          else
           local.get $29
           f64.const 1
           f64.gt
           if (result f64)
            f64.const 0
            f64.const 1
            local.get $30
            local.get $36
            f64.sub
            local.get $51
            f64.div
            local.tee $29
            local.get $29
            f64.const 1
            f64.gt
            select
            local.get $29
            f64.const 0
            f64.lt
            select
            local.set $62
            f64.const 1
           else
            local.get $29
           end
          end
          local.set $64
         end
        end
       end
       local.get $46
       local.get $45
       local.get $62
       f64.mul
       f64.add
       local.get $40
       local.get $54
       local.get $64
       f64.mul
       f64.add
       f64.sub
       local.tee $45
       local.get $45
       f64.mul
       local.get $44
       local.get $43
       local.get $62
       f64.mul
       f64.add
       local.get $39
       local.get $53
       local.get $64
       f64.mul
       f64.add
       f64.sub
       local.tee $44
       local.get $44
       f64.mul
       f64.add
       local.get $41
       local.get $55
       local.get $62
       f64.mul
       f64.add
       local.get $38
       local.get $52
       local.get $64
       f64.mul
       f64.add
       f64.sub
       local.tee $43
       local.get $43
       f64.mul
       f64.add
       f64.sqrt
       local.tee $30
       local.get $22
       f64.lt
       if
        local.get $30
        local.set $22
       end
       local.get $30
       local.get $63
       local.get $47
       local.get $42
       local.get $42
       local.get $47
       i32.gt_s
       select
       local.tee $42
       i32.const 3
       i32.gt_s
       local.get $30
       local.get $63
       f64.lt
       i32.and
       select
       local.set $63
       block $for-continue|3
        local.get $42
        f64.convert_i32_s
        local.get $23
        f64.mul
        local.get $30
        f64.const 1e-12
        f64.max
        f64.const 2
        f64.mul
        f64.div
        f64.const -1
        f64.add
        f64.const 0.15
        f64.div
        local.tee $41
        f64.const 0
        f64.le
        br_if $for-continue|3
        local.get $30
        local.get $33
        local.get $30
        local.get $33
        f64.lt
        select
        local.set $33
        f64.const 1
        local.get $41
        local.get $41
        f64.const 1
        f64.ge
        select
        local.tee $40
        local.get $40
        f64.mul
        f64.const 3
        local.get $40
        local.get $40
        f64.add
        f64.sub
        f64.mul
        local.set $39
        local.get $30
        local.get $20
        f64.sub
        local.tee $38
        local.get $23
        f64.const 1e-09
        f64.mul
        f64.le
        if
         i32.const 1
         local.set $57
         br $for-continue|3
        end
        local.get $21
        local.get $38
        f64.le
        br_if $for-continue|3
        local.get $28
        local.get $39
        local.get $2
        if (result f64)
         local.get $24
         local.get $18
         local.get $60
         i32.const 3
         i32.shl
         i32.add
         f64.load
         local.get $18
         local.get $49
         i32.const 3
         i32.shl
         i32.add
         f64.load
         f64.mul
         f64.sqrt
         f64.mul
        else
         local.get $24
        end
        local.tee $29
        local.get $25
        local.get $38
        local.get $38
        f64.mul
        local.get $38
        f64.mul
        local.get $38
        f64.mul
        local.tee $36
        f64.div
        local.get $26
        f64.sub
        local.get $27
        local.get $38
        local.get $21
        f64.sub
        f64.mul
        f64.add
        f64.mul
        local.tee $37
        f64.mul
        f64.add
        local.set $28
        local.get $1
        if
         local.get $39
         local.get $29
         f64.mul
         local.get $25
         f64.const -4
         f64.mul
         local.get $36
         local.get $38
         f64.mul
         f64.div
         local.get $27
         f64.add
         f64.mul
         local.set $36
         local.get $60
         i32.const 3
         i32.shl
         local.tee $35
         local.get $9
         i32.add
         local.tee $34
         f64.load
         local.set $29
         local.get $34
         local.get $29
         local.get $45
         local.get $41
         f64.const 1
         f64.lt
         if (result f64)
          local.get $36
          local.get $40
          f64.const 6
          f64.mul
          f64.const 1
          local.get $40
          f64.sub
          f64.mul
          local.get $37
          f64.mul
          local.get $42
          f64.convert_i32_s
          local.get $23
          f64.mul
          f64.neg
          local.get $30
          local.get $30
          f64.add
          local.get $30
          f64.mul
          f64.const 0.15
          f64.mul
          f64.div
          f64.mul
          f64.add
         else
          local.get $36
         end
         f64.neg
         local.get $30
         f64.div
         local.tee $30
         f64.mul
         local.tee $37
         f64.const 1
         local.get $62
         f64.sub
         local.tee $29
         f64.mul
         f64.add
         f64.store
         local.get $10
         local.get $35
         i32.add
         local.tee $34
         local.get $34
         f64.load
         local.get $44
         local.get $30
         f64.mul
         local.tee $36
         local.get $29
         f64.mul
         f64.add
         f64.store
         local.get $11
         local.get $35
         i32.add
         local.tee $34
         local.get $34
         f64.load
         local.get $43
         local.get $30
         f64.mul
         local.tee $30
         local.get $29
         f64.mul
         f64.add
         f64.store
         local.get $59
         i32.const 3
         i32.shl
         local.tee $35
         local.get $9
         i32.add
         local.tee $34
         local.get $34
         f64.load
         local.get $37
         local.get $62
         f64.mul
         f64.add
         f64.store
         local.get $10
         local.get $35
         i32.add
         local.tee $34
         local.get $34
         f64.load
         local.get $36
         local.get $62
         f64.mul
         f64.add
         f64.store
         local.get $11
         local.get $35
         i32.add
         local.tee $34
         local.get $34
         f64.load
         local.get $30
         local.get $62
         f64.mul
         f64.add
         f64.store
         local.get $49
         i32.const 3
         i32.shl
         local.tee $35
         local.get $9
         i32.add
         local.tee $34
         local.get $34
         f64.load
         local.get $37
         f64.const 1
         local.get $64
         f64.sub
         local.tee $29
         f64.mul
         f64.sub
         f64.store
         local.get $10
         local.get $35
         i32.add
         local.tee $34
         local.get $34
         f64.load
         local.get $36
         local.get $29
         f64.mul
         f64.sub
         f64.store
         local.get $11
         local.get $35
         i32.add
         local.tee $34
         local.get $34
         f64.load
         local.get $30
         local.get $29
         f64.mul
         f64.sub
         f64.store
         local.get $48
         i32.const 3
         i32.shl
         local.tee $35
         local.get $9
         i32.add
         local.tee $34
         local.get $34
         f64.load
         local.get $37
         local.get $64
         f64.mul
         f64.sub
         f64.store
         local.get $10
         local.get $35
         i32.add
         local.tee $34
         local.get $34
         f64.load
         local.get $36
         local.get $64
         f64.mul
         f64.sub
         f64.store
         local.get $11
         local.get $35
         i32.add
         local.tee $34
         local.get $34
         f64.load
         local.get $30
         local.get $64
         f64.mul
         f64.sub
         f64.store
        end
       end
       local.get $32
       i32.const 1
       i32.add
       local.set $32
       br $for-loop|3
      end
     end
    end
    local.get $60
    i32.const 1
    i32.add
    local.set $60
    br $for-loop|0
   end
  end
  local.get $19
  local.get $22
  f64.store
  local.get $19
  local.get $33
  f64.store offset=8
  local.get $19
  local.get $63
  f64.store offset=16
  local.get $19
  f64.const 1
  f64.const 0
  local.get $57
  select
  f64.store offset=24
  local.get $28
 )
)
