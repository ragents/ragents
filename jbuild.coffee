# Licensed under the Apache License. See footer for details.

path = require "path"

pkg = require("./package.json")

preReqFile = "../ragents-test/tmp/pre-reqs-updated.txt"

#-------------------------------------------------------------------------------
tasks = defineTasks exports,
  watch: "watch for source file changes, build"
  build: "run a build"

WatchSpec = "*.ts lib lib/**/* www www/**/*"

#-------------------------------------------------------------------------------
mkdir "-p", "tmp"

#-------------------------------------------------------------------------------
tasks.build = ->
  tsc "--outDir tmp --module commonjs ragents-def.ts"
  build_browser_version()
  "".to preReqFile

#-------------------------------------------------------------------------------
tasks.watch = ->
  watchIter()

  watch
    files: WatchSpec.split " "
    run:   watchIter

  watchFiles "jbuild.coffee" :->
    log "jbuild file changed; exiting"
    process.exit 0

#-------------------------------------------------------------------------------
build_browser_version = ->

  oFile = "www/ragents-browser.js"
  tFile = "tmp/ragents-browser.js"

  mkdir "-p", path.dirname oFile
  mkdir "-p", path.dirname tFile

  opts = """
    --standalone ragents
    --outfile    #{tFile}
    --entry      lib/ragents.js
    --debug
  """

#    --exclude    "node_modules/websocket/**/*"

  opts = opts.trim().split(/\s+/).join(" ")

  log "running: browserify #{opts}"
  browserify opts

  cat_source_map "--fixFileNames #{tFile} #{oFile}"

  log "generated #{oFile}"

#-------------------------------------------------------------------------------
watchIter = ->
  tasks.build()

#-------------------------------------------------------------------------------
cleanDir = (dir) ->
  mkdir "-p", dir
  rm "-rf", "#{dir}/*"

#-------------------------------------------------------------------------------
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#    http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
#-------------------------------------------------------------------------------
