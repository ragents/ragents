# Licensed under the Apache License. See footer for details.

path = require "path"

pkg = require("./package.json")

preReqFile = "../ragents-test/tmp/pre-reqs-updated.txt"

#-------------------------------------------------------------------------------
tasks = defineTasks exports,
  watch: "watch for source file changes, build"
  build: "run a build"

WatchSpec = "*.ts lib lib/**/* lib/channels lib/channels/**/* www www/**/*"

#-------------------------------------------------------------------------------
mkdir "-p", "tmp"

#-------------------------------------------------------------------------------
tasks.build = ->
  syntaxCheckTypeScript "ragents-def.ts"
  syntaxCheckTypeScript "lib/channels/channel-def.ts"

  log "linting ..."
  jshint "lib/*.js lib/channels/*.js"

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
syntaxCheckTypeScript = (file) ->
  log "syntax checking: #{file} ..."
  tsc "--outDir tmp --module commonjs #{file}"

#-------------------------------------------------------------------------------
build_browser_version = ->
  oBase  = "ragents-browser.js"

  mkdir "-p", "www"

  # run browserify
  opts = """
    --outfile    tmp/#{oBase}
    --standalone ragents
    --entry      lib/ragents.js
    --plugin     [ minifyify --map #{oBase}.map.json --output tmp/#{oBase}.map.json ]
    --debug
  """

  opts = opts.trim().split(/\s+/).join(" ")

  log "running browserify ..."
  browserify opts

  # run cat-source-map
  log "running cat-source-map ..."
  cat_source_map "--fixFileNames tmp/#{oBase} www/#{oBase}"

  log "browser file(s) generated at: www/#{oBase}"

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
