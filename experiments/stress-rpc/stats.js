// Licensed under the Apache License. See footer for details.

exports.dump = dump
exports.incr = incr

var v8 = null
try { v8 = require("v8") } catch(e) {}

var Counters = {}

//------------------------------------------------------------------------------
function dump() {
  var report = new Report()

  if (process.memoryUsage) {
    var pMem   = process.memoryUsage()

    report.add("mem:rss",       pMem.rss)
    report.add("mem:heapTotal", pMem.heapTotal)
    report.add("mem:heapUsed",  pMem.heapUsed)
  }

  if (v8 && v8.getHeapStatistics) {
    var v8Heap = v8.getHeapStatistics()
    report.add("total_heap_size",            v8Heap.total_heap_size)
    report.add("total_heap_size_executable", v8Heap.total_heap_size_executable)
    report.add("total_physical_size",        v8Heap.total_physical_size)
    report.add("used_heap_size",             v8Heap.used_heap_size)
    report.add("heap_size_limit",            v8Heap.heap_size_limit)
  }

  for (var key in Counters) {
    report.add(key, Counters[key])
  }

  report.dump()
}

//------------------------------------------------------------------------------
function incr(counter) {
  if (Counters[counter] == null) Counters[counter] = 0
  Counters[counter]++
}

//------------------------------------------------------------------------------
function Report() {
  this.lines     = []
  this.maxKeyLen = 0
}

Report.prototype.add  = Report_add
Report.prototype.dump = Report_dump

//------------------------------------------------------------------------------
function Report_add(key, val) {
  this.lines.push({key:key, val:val})

  if (key.length > this.maxKeyLen) {
    this.maxKeyLen = key.length
  }
}

//------------------------------------------------------------------------------
function Report_dump() {
  var maxKeyLen = this.maxKeyLen
  console.log("-------------------------------------------------------")
  this.lines.forEach(function(line){
    var val = line.val
    if (typeof val == "number") val = numberWithCommas(val)
    console.log(left(line.key + ":", maxKeyLen+1) + " " + val)
  })
}

//------------------------------------------------------------------------------
function left(s, len) {
  while (s.length < len) s += " "
  return s
}

//------------------------------------------------------------------------------
// via: http://stackoverflow.com/questions/2901102/
//------------------------------------------------------------------------------
function numberWithCommas(x) {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
}

//------------------------------------------------------------------------------
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//    http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
//------------------------------------------------------------------------------
